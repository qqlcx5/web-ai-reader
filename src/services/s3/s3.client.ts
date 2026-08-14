import { AwsClient } from 'aws4fetch'
import type { S3Config } from '@/types/s3'
import { proxyBase } from '@/services/proxy'
import type { ProxyResponse } from './proxy-response'

export interface ConnectionTestResult {
  ok: boolean
  error?: string
}

export interface S3Remote {
  /** Probe bucket accessibility + base path reachability. */
  test(): Promise<ConnectionTestResult>
  hasData(): Promise<boolean>
  putText(path: string, text: string): Promise<void>
  getText(path: string): Promise<string>
  remove(path: string): Promise<void>
  /** Names of files under the base path (best-effort, never throws). */
  listFiles(): Promise<string[]>
}

export function normalizeBasePath(path: string): string {
  let p = (path || '').trim() || '/auramind'
  if (!p.startsWith('/')) p = '/' + p
  return p.replace(/\/+$/, '')
}

export function createS3Remote(cfg: S3Config): S3Remote {
  const signer = new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    region: cfg.region || 'us-east-1',
    service: 's3',
  })
  const Bucket = cfg.bucket
  const basePath = normalizeBasePath(cfg.basePath).replace(/^\//, '')
  const forcePathStyle = cfg.forcePathStyle ?? true

  function resourceUrl(key: string): string {
    const endpoint = cfg.endpoint.replace(/\/+$/, '')
    if (forcePathStyle) {
      return `${endpoint}/${Bucket}${key ? '/' + key : ''}`
    }
    const u = new URL(endpoint)
    return `${u.protocol}//${Bucket}.${u.host}${u.pathname}${key ? '/' + key : ''}`
  }

  function key(relPath: string): string {
    return basePath ? `${basePath}/${relPath}` : relPath
  }

  /**
   * 用 aws4fetch 签名后，通过代理中继请求（绕过浏览器 CORS）。
   * 返回 { status, headers, body }。
   */
  async function signedFetch(
    url: string,
    init: RequestInit = {},
  ): Promise<ProxyResponse> {
    // 1. 签名（aws4fetch 在签名时计算 Authorization 头）
    const signedReq = await signer.sign(url, init)

    // 2. 提取签名后的请求参数
    const method = signedReq.method
    const signedUrl = signedReq.url
    const headers: Record<string, string> = {}
    signedReq.headers.forEach((value, key) => {
      headers[key] = value
    })
    let body: string | undefined
    if (init.body && typeof init.body === 'string') {
      body = init.body
    }

    // 3. 通过代理中继
    const res = await fetch(`${proxyBase()}/s3-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: signedUrl, method, headers, body }),
    })
    if (!res.ok) {
      throw new Error(`S3 proxy error: HTTP ${res.status}`)
    }
    return (await res.json()) as ProxyResponse
  }

  return {
    async test() {
      try {
        const resp = await signedFetch(resourceUrl(''), { method: 'HEAD' })
        if (resp.status >= 400 && resp.status !== 403) {
          return { ok: false, error: `HEAD bucket returned ${resp.status}` }
        }
        // 验证 base path 可达
        const prefixUrl =
          resourceUrl('') +
          (basePath
            ? `?list-type=2&prefix=${encodeURIComponent(basePath + '/')}&max-keys=1`
            : '?list-type=2&max-keys=1')
        const listResp = await signedFetch(prefixUrl)
        if (listResp.status >= 400 && listResp.status !== 404) {
          return { ok: false, error: `LIST returned ${listResp.status}` }
        }
        return { ok: true }
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) }
      }
    },

    async hasData() {
      try {
        const resp = await signedFetch(resourceUrl(key('data.json')), {
          method: 'HEAD',
        })
        return resp.status >= 200 && resp.status < 300
      } catch {
        return false
      }
    },

    async putText(path, text) {
      const resp = await signedFetch(resourceUrl(key(path)), {
        method: 'PUT',
        body: text,
      })
      if (resp.status >= 400) {
        throw new Error(`PUT failed: ${resp.status}`)
      }
    },

    async getText(path) {
      const resp = await signedFetch(resourceUrl(key(path)))
      if (resp.status >= 400) {
        throw new Error(`GET failed: ${resp.status}`)
      }
      return resp.body
    },

    async remove(path) {
      try {
        await signedFetch(resourceUrl(key(path)), { method: 'DELETE' })
      } catch {
        // best-effort
      }
    },

    async listFiles() {
      try {
        const names: string[] = []
        const Prefix = basePath ? `${basePath}/` : ''
        let continuationToken = ''
        do {
          const params = new URLSearchParams({ 'list-type': '2' })
          if (Prefix) params.set('prefix', Prefix)
          if (continuationToken) params.set('continuation-token', continuationToken)
          const resp = await signedFetch(resourceUrl('') + '?' + params.toString())
          if (resp.status >= 400) break
          const xml = resp.body
          const doc = new DOMParser().parseFromString(xml, 'text/xml')
          for (const keyEl of doc.querySelectorAll('Contents > Key')) {
            const k = keyEl.textContent || ''
            const name = Prefix ? k.slice(Prefix.length) : k
            if (name) names.push(name)
          }
          const truncated = doc.querySelector('IsTruncated')?.textContent === 'true'
          continuationToken = truncated
            ? doc.querySelector('NextContinuationToken')?.textContent || ''
            : ''
        } while (continuationToken)
        return names
      } catch {
        return []
      }
    },
  }
}
