import type { ExtractionMethod } from '@/types/document'
import { proxyBase } from '../proxy'

// Web 版网页提取服务：通过轻量代理（proxy/，Cloudflare Worker）抓取 URL 并用 defuddle 提取正文。
// 与扩展版的差异：扩展用 browser.runtime.sendMessage 向 content script 请求当前标签页内容；
// Web 版没有标签页，改为把 URL 发给代理服务端抓取+提取。
//
// 代理地址来自 services/proxy.ts（localStorage `auramind:proxy-base`），默认走同源 /api。

export interface ExtractedPage {
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
  extractionMethod: ExtractionMethod
  sanitizedHtml?: string
}

export class CaptureError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CaptureError'
  }
}

const EXTRACT_TIMEOUT_MS = 30_000

/**
 * 抓取并提取指定 URL 的正文。
 * 调用代理 POST /extract { url }，返回 ExtractedPage。
 */
export async function requestExtractByUrl(url: string): Promise<ExtractedPage> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EXTRACT_TIMEOUT_MS)

  try {
    const res = await fetch(`${proxyBase()}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new CaptureError(`代理提取失败 (${res.status})${detail ? `: ${detail}` : ''}`)
    }

    const data = (await res.json()) as ExtractedPage
    if (!data || !data.url || !data.markdown) {
      throw new CaptureError('代理返回的数据不完整')
    }
    return data
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new CaptureError('提取超时（30 秒）')
    }
    if (err instanceof CaptureError) throw err
    // 网络错误 / 代理未部署
    throw new CaptureError(
      err?.message?.includes('Failed to fetch')
        ? '无法连接提取代理服务，请在设置中检查代理地址'
        : err?.message || '提取失败',
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * 兼容旧调用：扩展版 requestExtract(tabId) 按"当前标签页"提取。
 * Web 版无标签页；提供按 URL 提取。Phase 7 中 WorkspaceHeader/ContextPanel
 * 改为调用 requestExtractByUrl(currentDocument.url)。
 */
export async function requestExtract(url: string): Promise<ExtractedPage> {
  return requestExtractByUrl(url)
}
