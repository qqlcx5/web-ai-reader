/**
 * 网页正文提取 — Worker 端实现。
 *
 * 与前端 src/utils/content/extract.ts 的契约保持一致（ExtractedPageData 形状），
 * 但实现路径不同：
 *   前端：new Defuddle(doc) → createMarkdownContent（依赖浏览器 document）
 *   本文件：Defuddle(html, url) from 'defuddle/node'（内部 linkedom 建 DOM）
 *           + turndown 把返回的 content HTML 转 Markdown（createMarkdownContent 不可用）
 *
 * countWords / computeHash / estimateTokens 与前端逻辑完全相同。
 */

import { Defuddle } from 'defuddle/node'
import { parseHTML } from 'linkedom'
import TurndownService from 'turndown'
import type { Node } from 'turndown'

export interface ExtractedPageData {
  url: string
  title: string
  markdown: string
  siteName?: string
  author?: string
  description?: string
  publishedAt?: string
  canonicalUrl?: string
  contentHash: string
  wordCount: number
  tokenCount: number
  extractionMethod: 'defuddle' | 'fallback'
  sanitizedHtml?: string
}

const FETCH_TIMEOUT_MS = 15_000
const MAX_BODY_BYTES = 5 * 1024 * 1024 // 5MB cap to bound Worker memory

// ---------------------------------------------------------------------------
// 公共：抓取 + 提取一个 URL
// ---------------------------------------------------------------------------

export async function extractUrl(rawUrl: string): Promise<ExtractedPageData> {
  const url = normalizeUrl(rawUrl)

  const { html, finalUrl } = await fetchHtml(url)
  return extractFromHtmlString(html, finalUrl)
}

// ---------------------------------------------------------------------------
// HTTP 抓取
// ---------------------------------------------------------------------------

async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // 不少站点对无 UA 的请求直接 403；给一个常规桌面 UA
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    if (!res.ok) {
      throw Object.assign(new Error(`HTTP ${res.status} fetching ${url}`), { status: 502 })
    }
    const contentType = res.headers.get('content-type') || ''
    if (!/html|xml/i.test(contentType) && !contentType.includes('text/')) {
      throw Object.assign(new Error(`unsupported content-type: ${contentType}`), { status: 415 })
    }
    // 限流读取，避免超大页面撑爆 Worker
    const buf = await res.arrayBuffer()
    const bytes = buf.byteLength > MAX_BODY_BYTES ? buf.slice(0, MAX_BODY_BYTES) : buf
    // Workers 支持 TextDecoder，默认 utf-8
    const html = new TextDecoder('utf-8', { fatal: false, ignoreBOM: false }).decode(bytes)
    const finalUrl = res.url || url
    return { html, finalUrl }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('抓取超时（15 秒）'), { status: 504 })
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// ---------------------------------------------------------------------------
// 提取：defuddle → turndown
// ---------------------------------------------------------------------------

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

// 让链接/图片保留绝对地址（defuddle 返回的 content 里通常已是绝对路径，
// 但个别相对路径在这里兜底）
turndown.addRule('absoluteLinks', {
  filter: ['a'] as unknown as TurndownService.Filter,
  replacement(content: string, node: Node) {
    const href = (node as unknown as Element).getAttribute?.('href') || ''
    const titleAttr = (node as unknown as Element).getAttribute?.('title')
    const title = titleAttr ? ` "${titleAttr}"` : ''
    if (!href || href.startsWith('#')) return content
    return `[${content}](${href}${title})`
  },
})

export async function extractFromHtmlString(
  html: string,
  url: string,
): Promise<ExtractedPageData> {
  let result: Awaited<ReturnType<typeof Defuddle>>
  try {
    result = await Defuddle(html, url)
  } catch {
    return fallbackExtract(html, url)
  }

  const contentHtml = result.content || ''
  if (!contentHtml.trim()) {
    return fallbackExtract(html, url)
  }

  // defuddle/node 不返回 markdown，需要自己把 content HTML 转成 Markdown。
  // linkedom 建 DOM，turndown 转 Markdown（与前端 createMarkdownContent 近似）。
  let markdown: string
  try {
    const { document } = parseHTML(contentHtml)
    markdown = turndown.turndown(document.body || document)
  } catch {
    markdown = stripTags(contentHtml)
  }

  if (!markdown.trim()) {
    return fallbackExtract(html, url)
  }

  const contentHash = await computeHash(markdown)
  return {
    url,
    title: result.title || '',
    markdown,
    siteName: result.site || undefined,
    author: result.author || undefined,
    description: result.description || undefined,
    publishedAt: result.published || undefined,
    canonicalUrl: undefined,
    contentHash,
    wordCount: countWords(markdown),
    tokenCount: estimateTokens(markdown),
    extractionMethod: 'defuddle',
  }
}

function fallbackExtract(html: string, url: string): Promise<ExtractedPageData> {
  const { document } = parseHTML(html)
  const title = document.title || ''
  const text = stripTags(document.body?.innerHTML || html)
  const markdown = title ? `# ${title}\n\n${text}` : text

  return computeHash(markdown).then((contentHash) => ({
    url,
    title,
    markdown,
    contentHash,
    wordCount: countWords(markdown),
    tokenCount: estimateTokens(markdown),
    extractionMethod: 'fallback' as const,
  }))
}

// ---------------------------------------------------------------------------
// 纯函数（与前端 extract.ts / token.ts 对齐）
// ---------------------------------------------------------------------------

function countWords(text: string): number {
  const stripped = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[#>*_~-]/g, ' ')
    .replace(/\n+/g, ' ')

  const cjkMatches = stripped.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g)
  const cjkCount = cjkMatches ? cjkMatches.length : 0

  const nonCjk = stripped.replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, ' ')
  const nonCjkWords = nonCjk.split(/\s+/).filter(Boolean).length

  return cjkCount + nonCjkWords
}

function estimateTokens(text: string): number {
  const CHINESE_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g
  const chineseChars = (text.match(CHINESE_RE) || []).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars / 1.5 + otherChars / 4)
}

async function computeHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  let hex = ''
  for (const b of hashArray) hex += b.toString(16).padStart(2, '0')
  return hex
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeUrl(raw: string): string {
  let url = raw.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  // 校验合法性（避免 SSRF 到内网非标准端口时至少先过 URL 解析）
  try {
    const u = new URL(url)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      throw new Error('仅支持 http/https')
    }
    return u.toString()
  } catch {
    throw Object.assign(new Error(`无效的 URL：${raw}`), { status: 400 })
  }
}
