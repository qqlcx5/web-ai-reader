// Conditional GET for a feed URL.
//
// Web 版没有扩展的 host_permissions，直接 fetch 任意源会撞 CORS；
// 改为通过代理 POST /feed-fetch，由代理在服务端做条件 GET，再回传 XML/304 状态。
// 代理地址来自 services/proxy.ts（localStorage `auramind:proxy-base`），默认 /api。

import { proxyBase } from '../proxy'

export interface FetchedFeed {
  xml: string
  etag?: string
  lastModified?: string
  notModified: boolean
}

const FETCH_TIMEOUT_MS = 30_000

export async function fetchFeed(
  url: string,
  opts: { etag?: string; lastModified?: string } = {},
): Promise<FetchedFeed> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(`${proxyBase()}/feed-fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, etag: opts.etag, lastModified: opts.lastModified }),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`Feed fetch failed: HTTP ${res.status}`)
    }

    const data = (await res.json()) as {
      xml: string
      etag?: string
      lastModified?: string
      notModified: boolean
    }
    return {
      xml: data.xml,
      notModified: data.notModified,
      etag: data.etag,
      lastModified: data.lastModified,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
