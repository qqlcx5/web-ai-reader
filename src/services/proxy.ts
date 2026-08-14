/**
 * 代理服务地址解析 —— capture / feed 共用。
 *
 * 优先级：
 *   1. localStorage `auramind:proxy-base`（设置面板写入）
 *   2. 默认 `/api`（同源，配合反向代理部署）
 *
 * 设置面板 → StorageSettings 或 CaptureSettings 提供输入框，写入该键。
 */

const STORAGE_KEY = 'auramind:proxy-base'
const DEFAULT_PROXY_BASE = '/api'

export function proxyBase(): string {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v) return v.replace(/\/+$/, '') // 去掉尾部斜杠
  } catch {
    /* SSR / 无 localStorage 环境 */
  }
  return DEFAULT_PROXY_BASE
}

export function setProxyBase(url: string): void {
  const trimmed = url.trim().replace(/\/+$/, '')
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}
