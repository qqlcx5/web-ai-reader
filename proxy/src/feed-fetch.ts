/**
 * RSS/Atom 条件 GET — Worker 端实现。
 *
 * 与前端 src/services/feed/fetch.ts 的契约一致（FetchedFeed 形状），
 * 但在 Worker 内执行 fetch 以绕过浏览器 CORS。
 */

export interface FetchedFeed {
  xml: string
  etag?: string
  lastModified?: string
  notModified: boolean
  status: number
  contentType?: string
}

const FETCH_TIMEOUT_MS = 15_000
const MAX_BODY_BYTES = 3 * 1024 * 1024

export async function fetchFeed(
  rawUrl: string,
  opts: { etag?: string; lastModified?: string } = {},
): Promise<FetchedFeed> {
  const url = rawUrl.trim()
  if (!/^https?:\/\//i.test(url)) {
    throw Object.assign(new Error(`无效的 URL：${url}`), { status: 400 })
  }

  const headers: Record<string, string> = {
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    'User-Agent': 'AuraMindProxy/1.0 (+https://github.com/auramind)',
  }
  if (opts.etag) headers['If-None-Match'] = opts.etag
  if (opts.lastModified) headers['If-Modified-Since'] = opts.lastModified

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      headers,
      redirect: 'follow',
      signal: controller.signal,
    })

    if (res.status === 304) {
      return {
        xml: '',
        notModified: true,
        etag: opts.etag,
        lastModified: opts.lastModified,
        status: 304,
      }
    }
    if (!res.ok) {
      throw Object.assign(new Error(`Feed fetch failed: HTTP ${res.status}`), { status: 502 })
    }

    const buf = await res.arrayBuffer()
    const bytes = buf.byteLength > MAX_BODY_BYTES ? buf.slice(0, MAX_BODY_BYTES) : buf
    const xml = new TextDecoder('utf-8', { fatal: false, ignoreBOM: false }).decode(bytes)

    return {
      xml,
      notModified: false,
      etag: res.headers.get('etag') ?? undefined,
      lastModified: res.headers.get('last-modified') ?? undefined,
      status: res.status,
      contentType: res.headers.get('content-type') ?? undefined,
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('Feed 抓取超时（15 秒）'), { status: 504 })
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
