/**
 * AuraMind Web 代理服务 — Cloudflare Worker
 *
 * 提供以下端点，补齐浏览器 CORS 受限的能力：
 *   POST /extract       { url }                       → 抓取网页并用 defuddle 提取正文
 *   POST /feed-fetch    { url, etag?, lastModified? } → 条件 GET RSS/Atom 源
 *   POST /s3-proxy      { url, method, headers, body } → 中继 S3 请求（绕 CORS）
 *   POST /webdav-proxy  { url, method, headers, body } → 中继 WebDAV 请求（绕 CORS）
 *   GET  /healthz                                      → 健康检查
 *
 * AI 调用不经过本代理（浏览器侧直连各 Provider）。
 */

import { extractUrl } from './extract'
import { fetchFeed } from './feed-fetch'
import { proxyFetch, type ProxyRequest } from './proxy-fetch'

export interface Env {
  // 预留：未来可加 ALLOWED_ORIGIN / API_TOKEN 等环境变量
}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return corsResponse(new Response(null, { status: 204 }))
    }

    try {
      if (url.pathname === '/healthz') {
        return json({ ok: true, service: 'auramind-proxy', time: new Date().toISOString() })
      }

      if (url.pathname === '/extract' && request.method === 'POST') {
        const body = await readJson(request)
        const target = typeof body?.url === 'string' ? body.url.trim() : ''
        if (!target) return jsonError(400, 'missing "url"')
        const result = await extractUrl(target)
        return json(result)
      }

      if (url.pathname === '/feed-fetch' && request.method === 'POST') {
        const body = await readJson(request)
        const target = typeof body?.url === 'string' ? body.url.trim() : ''
        if (!target) return jsonError(400, 'missing "url"')
        const result = await fetchFeed(target, {
          etag: typeof body?.etag === 'string' ? body.etag : undefined,
          lastModified:
            typeof body?.lastModified === 'string' ? body.lastModified : undefined,
        })
        return json(result)
      }

      if (
        (url.pathname === '/s3-proxy' || url.pathname === '/webdav-proxy') &&
        request.method === 'POST'
      ) {
        const body = (await readJson(request)) as ProxyRequest
        if (!body?.url) return jsonError(400, 'missing "url"')
        const result = await proxyFetch(body)
        return json(result)
      }

      return jsonError(404, `unknown route: ${request.method} ${url.pathname}`)
    } catch (err: any) {
      const message = err?.message || String(err)
      const status = err?.status && typeof err.status === 'number' ? err.status : 502
      return jsonError(status, message)
    }
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function readJson(request: Request): Promise<any> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function json(data: unknown, status = 200): Response {
  return corsResponse(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }),
  )
}

function jsonError(status: number, message: string): Response {
  return json({ error: message }, status)
}

function corsResponse(res: Response): Response {
  const headers = new Headers(res.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Access-Control-Max-Age', '86400')
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  })
}
