/**
 * 代理中继的响应类型（与 proxy/src/proxy-fetch.ts 的 ProxyResponse 对齐）。
 * S3 和 WebDAV 客户端通过代理中继请求后，收到的就是这个结构。
 */
export interface ProxyResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
}
