# Web-DeepSeek Hook-Fetch 模块

## 模块概述

Web-DeepSeek 项目基于独立请求库 [hook-fetch](https://jsonlee12138.github.io/hook-fetch/) 封装了统一的 HTTP 客户端（`src/utils/http.ts`），实现了**插件化拦截器架构**，通过 Auth 插件注入 Bearer Token、Error 插件统一错误处理，向上层 API 模块暴露 `http.post` / `http.get` 等标准方法。

hook-fetch 是一个基于原生 `fetch` API 的轻量 HTTP 客户端，支持请求/响应拦截器 (Plugin)、超时控制、baseURL 等现代特性。Web-DeepSeek 在其基础上封装了 `chatApi` 模块（`src/api/chat-api.ts`），提供流式/非流式对话补全接口，供 Pinia Store 层调用。

**架构分层**：

```
stores/chat.ts  (Pinia Store — 业务层)
    │ import { chatApi, ChatRequestParams }
    ▼
api/chat-api.ts  (API 封装层 — chatStream / chat)
    │ import http from '@/utils/http'
    ▼
utils/http.ts  (HTTP 客户端层 — hook-fetch.create)
    │ import hookFetch from 'hook-fetch'
    ▼
hook-fetch  (第三方库 — 底层 fetch 封装)
```

---

## 核心 API

### 1. HTTP 客户端初始化 (`src/utils/http.ts`)

```typescript
import hookFetch from 'hook-fetch'
import type { HookFetchPlugin } from 'hook-fetch'

const http = hookFetch.create({
  baseURL: import.meta.env.VITE_AI_API_BASE || '/ai-api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  plugins: [authPlugin, errorPlugin],
})

export default http
```

**配置项**：

| 配置 | 类型 | 说明 |
|------|------|------|
| `baseURL` | `string` | 基础 API 路径，由环境变量 `VITE_AI_API_BASE` 提供，默认 `/ai-api` |
| `timeout` | `number` | 请求超时（毫秒），默认 30000ms |
| `headers` | `HeadersInit` | 默认请求头，`Content-Type: application/json` |
| `withCredentials` | `boolean` | 是否携带跨域凭证，设为 `false` |
| `plugins` | `HookFetchPlugin[]` | 插件（拦截器）列表 |

### 2. Auth 插件

```typescript
const authPlugin: HookFetchPlugin = {
  name: 'auth',
  priority: 100,
  beforeRequest(config) {
    const apiKey = import.meta.env.VITE_AI_API_KEY || ''
    if (apiKey) {
      const headers = new Headers(config.headers)
      headers.set('Authorization', `Bearer ${apiKey}`)
      config.headers = headers
    }
    return config
  },
}
```

**功能**：在每次请求前自动注入 `Authorization: Bearer <API_KEY>` 请求头。API Key 从环境变量 `VITE_AI_API_KEY` 读取。优先级 100。

### 3. Error 插件

```typescript
const errorPlugin: HookFetchPlugin = {
  name: 'error',
  priority: 50,
  onError(error, config) {
    console.error(
      `[HTTP Error] ${config.method} ${config.url}`,
      error.message,
      error.status,
    )
  },
}
```

**功能**：统一捕获并打印 HTTP 错误日志，格式为 `[HTTP Error] METHOD URL message status`。优先级 50。

### 4. Plugins 执行顺序

插件按 `priority` 从高到低执行：
1. `auth` (priority: 100) → 注入 Bearer Token
2. `error` (priority: 50) → 错误日志

---

## Chat API 封装 (`src/api/chat-api.ts`)

### 请求参数类型

```typescript
export interface ChatRequestParams {
  messages: { role: string; content: string }[]
  model: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
  providerId?: string
  apiHost?: string
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `messages` | `{ role, content }[]` | 是 | 对话消息数组 |
| `model` | `string` | 是 | 模型 ID，如 `deepseek-chat` |
| `temperature` | `number` | 否 | 采样温度 |
| `maxTokens` | `number` | 否 | 最大 token 数 |
| `signal` | `AbortSignal` | 否 | 取消信号，用于中止请求 |
| `providerId` | `string` | 否 | 多 Provider 支持，指定 Provider ID |
| `apiHost` | `string` | 否 | 自定义 API 主机地址 |

### `chatStream()` — 流式对话补全

```typescript
async chatStream(params: ChatRequestParams): Promise<ReadableStream<Uint8Array>>
```

发送流式请求，返回 `ReadableStream<Uint8Array>`（SSE 原始字节流）。调用方通过 `getReader()` 逐块读取，手动解析 SSE 的 `data:` 行和 `[DONE]` 终止标记。

请求体自动附加 `stream: true`，可选字段 `temperature` / `max_tokens` / `provider_id` / `api_host` 仅在传值时添加。

### `chat()` — 非流式对话补全

```typescript
async chat(params: ChatRequestParams): Promise<ChatCompletionResponse>
```

发送非流式请求，返回解析后的 JSON 响应（`ChatCompletionResponse`）。请求体附加 `stream: false`。

---

## 类型定义

### Chat API 类型 (`src/types/index.ts`)

```typescript
export interface ChatCompletionMessage {
  role: MessageRole  // 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatCompletionMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
}

export interface ChatCompletionChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: MessageRole
      content?: string
      reasoning_content?: string
    }
    finish_reason: string | null
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatCompletionMessage
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Stream delta — 用于 SSE 逐块解析
export interface ChatStreamDelta {
  id?: string
  content?: string
  reasoning_content?: string
  model?: string
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

// 模型列表响应
export interface ModelListResponse {
  data: Array<{
    id: string
    object?: string
    owned_by?: string
  }>
}
```

### hook-fetch Plugin 类型（来自 hook-fetch 第三方库）

```typescript
export interface HookFetchPlugin {
  name: string
  priority?: number
  beforeRequest?: (config: RequestConfig) => RequestConfig
  afterResponse?: (response: Response, config: RequestConfig) => Response
  onError?: (error: HookFetchError, config: RequestConfig) => void
}
```

---

## 使用示例

### 示例 1：流式对话 — Chat Store (`src/stores/chat.ts`)

这是项目中 hook-fetch 最核心的使用场景。Pinia Store 的 `streamChat` 方法调用 `chatApi.chatStream()` 发起流式请求，手动解析 SSE 字节流：

```typescript
import { chatApi, type ChatRequestParams } from '@/api/chat-api'

// 构建请求参数
const params: ChatRequestParams = {
  messages: messages.value
    .filter(m => m.status === 'complete' || m.status === 'streaming')
    .map(m => ({ role: m.role, content: m.content })),
  model: uiStore.selectedModel?.id ?? 'deepseek-chat',
  signal: abortController.value.signal,   // 支持中止
}

try {
  const stream = await chatApi.chatStream(params)
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue
      const json = trimmed.slice(6)
      if (json === '[DONE]') continue
      const delta = JSON.parse(json) as ChatStreamDelta
      if (delta.reasoning_content) {
        assistantMsg.reasoningContent += delta.reasoning_content
      }
      if (delta.content) {
        assistantMsg.content += delta.content
      }
    }
  }

  assistantMsg.status = 'complete'
} catch (err) {
  if ((err as Error).name === 'AbortError') {
    assistantMsg.status = 'stopped'
  } else {
    assistantMsg.status = 'error'
    assistantMsg.error = (err as Error).message
  }
}
```

**关键点**：
- 通过 `signal: abortController.value.signal` 传入 `AbortSignal`，实现用户点击停止时取消请求
- 手动处理 SSE `data:` 行，解析 `ChatStreamDelta` 提取 `content` 和 `reasoning_content`
- `[DONE]` 标记表示流结束
- `AbortError` 单独处理，标记为 `stopped` 而非 `error`

### 示例 2：重新生成 — 同一 Store 的再生方法

当用户点击"重新生成"时，清理上一条 assistant 消息后重新发起流式请求：

```typescript
// 重置 assistant 消息
msg.content = ''
msg.reasoningContent = ''
msg.status = 'sending'
msg.loading = true
msg.error = undefined

// 重新构建上下文 + 发起请求
abortController.value = new AbortController()
const params: ChatRequestParams = {
  messages: messages.value
    .slice(0, idx)   // 只传目标消息之前的历史
    .filter(m => m.status === 'complete' || m.status === 'stopped')
    .map(m => ({ role: m.role, content: m.content })),
  model: uiStore.selectedModel?.id ?? 'deepseek-chat',
  signal: abortController.value.signal,
}

generating.value = true
chatApi.chatStream(params).then(async (stream) => {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  // ... 同示例 1 的 SSE 解析逻辑
  msg.status = 'complete'
}).catch((err) => {
  if ((err as Error).name === 'AbortError') {
    msg.status = 'stopped'
  } else {
    msg.status = 'error'
    msg.error = (err as Error).message
  }
})
```

### 示例 3：非流式请求 — Chat API 封装层

`chatApi.chat()` 的实现展示了如何用 `http.post().json()` 获取完整 JSON 响应：

```typescript
import http from '@/utils/http'

async chat(params: ChatRequestParams): Promise<ChatCompletionResponse> {
  const { messages, model, temperature, maxTokens, signal, providerId, apiHost } = params

  const body = {
    model,
    messages,
    stream: false,
    ...(temperature !== undefined && { temperature }),
    ...(maxTokens !== undefined && { max_tokens: maxTokens }),
    ...(providerId && { provider_id: providerId }),
    ...(apiHost && { api_host: apiHost }),
  }

  const request = http.post('/chat/completions', body, {
    headers: { 'Content-Type': 'application/json' },
    ...(signal && { signal }),
  })

  return request.json() as Promise<ChatCompletionResponse>
}
```

**关键点**：
- `http.post(url, body, options)` 返回 hook-fetch Request 对象
- 通过 `.json()` 方法直接解析 JSON 响应体并返回类型化结果
- 可选参数通过对象展开有条件地添加，保持请求体干净

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_AI_API_BASE` | API 基础 URL（baseURL） | `/ai-api` |
| `VITE_AI_API_KEY` | API 密钥（Bearer Token） | 空（不注入 Auth 头） |

---

## 插件扩展指南

如需新增自定义拦截器，在 `src/utils/http.ts` 的 `plugins` 数组中追加 `HookFetchPlugin` 对象：

```typescript
const logPlugin: HookFetchPlugin = {
  name: 'logger',
  priority: 80,
  beforeRequest(config) {
    console.log(`[HTTP] ${config.method} ${config.url}`)
    return config
  },
  afterResponse(response, config) {
    console.log(`[HTTP] ${response.status} ${config.url}`)
    return response
  },
}

// 注册到 http 实例
const http = hookFetch.create({
  // ...
  plugins: [authPlugin, logPlugin, errorPlugin],
})
```

**优先级建议**：
- 90-100：认证/鉴权类
- 70-89：日志/监控类
- 50-69：错误处理类
- 0-49：其他业务拦截
**
