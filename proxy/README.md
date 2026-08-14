# AuraMind Web — 轻量代理服务

Cloudflare Worker，为 Web 版补齐 CORS 受限的能力：

- `POST /extract` — 抓取 URL 并用 defuddle 提取正文，返回 Markdown + 元数据。
- `POST /feed-fetch` — 条件 GET 一个 RSS/Atom 源，绕过浏览器 CORS。
- `GET  /healthz` — 健康检查。

AI 调用仍在浏览器侧直连各 Provider，不经过本代理。

## 本地开发

```bash
cd proxy
pnpm install
pnpm dev   # wrangler dev，默认 http://localhost:8787
```

## 部署

```bash
pnpm deploy   # wrangler deploy
```

部署后把 Worker 地址填入 Web 版「设置 → 代理服务地址」（如 `https://auramind-proxy.xxx.workers.dev`）。

## 前端对接

前端 `capture.service.ts` / `feed/fetch.ts` 会向 `${proxyBase}/extract` 等端点发 POST。
默认 `proxyBase = /api`（同源），可在 localStorage `auramind:proxy-base` 或设置面板覆盖。
