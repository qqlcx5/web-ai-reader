import type { WebDAVConfig } from '@/types/sync'
import { proxyBase } from '@/services/proxy'
import type { ProxyResponse } from '@/services/s3/proxy-response'

export interface ConnectionTestResult {
  ok: boolean
  error?: string
}

export interface WebDAVRemote {
  /** Probe + ensure the base directory exists. */
  test(): Promise<ConnectionTestResult>
  hasData(): Promise<boolean>
  putText(path: string, text: string): Promise<void>
  getText(path: string): Promise<string>
  remove(path: string): Promise<void>
  /** Names of files in the base directory (best-effort, never throws). */
  listFiles(): Promise<string[]>
}

export function normalizeBasePath(path: string): string {
  let p = (path || '').trim() || '/auramind'
  if (!p.startsWith('/')) p = '/' + p
  return p.replace(/\/+$/, '')
}

export function createWebDAVRemote(cfg: WebDAVConfig): WebDAVRemote {
  const base = normalizeBasePath(cfg.basePath)
  const authHeader =
    'Basic ' + btoa(`${cfg.username || ''}:${cfg.password || ''}`)

  /**
   * 通过代理中继 WebDAV 请求（绕过浏览器 CORS）。
   * WebDAV 服务器通常不发送 CORS 头、也不处理 PROPFIND/MKCOL 的预检。
   */
  async function davFetch(
    path: string,
    init: { method: string; headers?: Record<string, string>; body?: string } = {
      method: 'GET',
    },
  ): Promise<ProxyResponse> {
    const url = cfg.url.replace(/\/+$/, '') + (path.startsWith('/') ? path : '/' + path)
    const headers: Record<string, string> = {
      Authorization: authHeader,
      ...(init.headers || {}),
    }
    const res = await fetch(`${proxyBase()}/webdav-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, method: init.method, headers, body: init.body }),
    })
    if (!res.ok) {
      throw new Error(`WebDAV proxy error: HTTP ${res.status}`)
    }
    return (await res.json()) as ProxyResponse
  }

  /** 解析 PROPFIND 响应中的文件名列表。 */
  function parsePropfindFiles(xml: string, basePath: string): string[] {
    try {
      const doc = new DOMParser().parseFromString(xml, 'text/xml')
      const names: string[] = []
      const responses = doc.querySelectorAll('response, D\\:response, d\\:response')
      const base = basePath.replace(/\/+$/, '') + '/'
      responses.forEach((resp) => {
        const hrefEl =
          resp.querySelector('href') ||
          resp.querySelector('D\\:href') ||
          resp.querySelector('d\\:href')
        const href = hrefEl?.textContent || ''
        // 只取文件（非目录），去掉 basePath 前缀
        const name = href.split('?')[0].replace(/\/+$/, '').split('/').pop() || ''
        // 跳过目录本身（href 等于 basePath 或以 / 结尾）
        const isDir = href.endsWith('/')
        const fullHref = decodeURIComponent(href)
        if (name && !isDir && !fullHref.replace(/\/$/, '').endsWith(basePath.replace(/\/$/, ''))) {
          names.push(name)
        }
      })
      return [...new Set(names)]
    } catch {
      return []
    }
  }

  return {
    async test() {
      try {
        // PROPFIND base path（Depth: 0）检查是否存在
        const resp = await davFetch(base, {
          method: 'PROPFIND',
          headers: { Depth: '0' },
        })
        if (resp.status === 404) {
          // 不存在 → 创建目录
          const mk = await davFetch(base, { method: 'MKCOL' })
          if (mk.status >= 400 && mk.status !== 405) {
            return { ok: false, error: `MKCOL returned ${mk.status}` }
          }
        } else if (resp.status >= 400) {
          return { ok: false, error: `PROPFIND returned ${resp.status}` }
        }
        return { ok: true }
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) }
      }
    },

    async hasData() {
      try {
        const resp = await davFetch(`${base}/data.json`, { method: 'HEAD' })
        return resp.status >= 200 && resp.status < 300
      } catch {
        return false
      }
    },

    async putText(path, text) {
      const resp = await davFetch(`${base}/${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      })
      if (resp.status >= 400) {
        throw new Error(`PUT failed: ${resp.status}`)
      }
    },

    async getText(path) {
      const resp = await davFetch(`${base}/${path}`, { method: 'GET' })
      if (resp.status >= 400) {
        throw new Error(`GET failed: ${resp.status}`)
      }
      return resp.body
    },

    async remove(path) {
      try {
        await davFetch(`${base}/${path}`, { method: 'DELETE' })
      } catch {
        // best-effort
      }
    },

    async listFiles() {
      try {
        const resp = await davFetch(base, {
          method: 'PROPFIND',
          headers: { Depth: '1' },
        })
        if (resp.status >= 400) return []
        return parsePropfindFiles(resp.body, base)
      } catch {
        return []
      }
    },
  }
}
