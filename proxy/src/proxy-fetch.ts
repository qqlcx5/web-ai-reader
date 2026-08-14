/**
 * S3 / WebDAV 通用代理 —— 在 Worker 内转发任意 HTTP 请求，绕过浏览器 CORS。
 *
 * S3（aws4fetch）和 WebDAV（webdav/web）都从浏览器直接 fetch 目标服务器，
 * 大多数 S3/WebDAV 端点不发送 CORS 头 → 浏览器拦截。
 * 此模块把请求中继到 Worker：Worker 端 fetch（无 CORS 限制）→ 回传响应。
 *
 * 端点：
 *   POST /s3-proxy     { url, method, headers, body }  → { status, headers, body }
 *   POST /webdav-proxy { url, method, headers, body }  → { status, headers, body }
 *
 * 安全：仅允许 http/https，禁止 localhost/内网 IP（防 SSRF）。
 */

export interface ProxyRequest {
  url: string
  method: string
  headers?: Record<string, string>
  body?: string
}

export interface ProxyResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
}

const FETCH_TIMEOUT_MS = 30_000
const MAX_BODY_BYTES = 10 * 1024 * 1024

// 需要回传给客户端的响应头（排除 hop-by-hop 头和 CORS 头——Worker 自己加 CORS）
const PASSTHROUGH_HEADERS = new Set([
  'etag',
  'last-modified',
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'x-amz-request-id',
  'x-amz-version-id',
  'x-amz-delete-marker',
  'date',
])

export async function proxyFetch(req: ProxyRequest): Promise<ProxyResponse> {
  const url = validateUrl(req.url)
  const method = (req.method || 'GET').toUpperCase()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const init: RequestInit = {
      method,
      headers: req.headers || {},
      redirect: 'follow',
      signal: controller.signal,
    }
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      init.body = req.body
    }

    const res = await fetch(url, init)

    // 读取响应体（限制大小）
    const buf = await res.arrayBuffer()
    const bytes = buf.byteLength > MAX_BODY_BYTES ? buf.slice(0, MAX_BODY_BYTES) : buf
    const body = new TextDecoder('utf-8', { fatal: false, ignoreBOM: false }).decode(bytes)

    // 过滤响应头——只回传白名单内的
    const headers: Record<string, string> = {}
    res.headers.forEach((value, key) => {
      if (PASSTHROUGH_HEADERS.has(key.toLowerCase())) {
        headers[key] = value
      }
    })

    return {
      status: res.status,
      statusText: res.statusText,
      headers,
      body,
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('代理请求超时（30 秒）'), { status: 504 })
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

function validateUrl(raw: string): string {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    throw Object.assign(new Error(`无效的 URL：${raw}`), { status: 400 })
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw Object.assign(new Error('仅支持 http/https'), { status: 400 })
  }
  // 防 SSRF：禁止 localhost 和内网 IP
  const host = u.hostname.toLowerCase()
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.localhost') ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    throw Object.assign(new Error(`不允许的地址：${host}`), { status: 403 })
  }
  return u.toString()
}
