<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { proxyBase, setProxyBase } from '@/services/proxy'

// 代理服务地址：网页提取与 RSS 抓取都经由此代理（绕过浏览器 CORS）。
// 默认 /api（同源反向代理）；可填 Cloudflare Worker 地址。
const proxyUrl = ref('')
const saved = ref(false)

onMounted(() => {
  proxyUrl.value = proxyBase()
})

function save() {
  setProxyBase(proxyUrl.value)
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}

function reset() {
  proxyUrl.value = '/api'
  setProxyBase('')
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden text-[13px]">
    <!-- 代理服务地址 -->
    <div class="p-4 border-b border-zinc-100">
      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-0.5">
          <span class="text-zinc-700">代理服务地址</span>
          <span class="text-[11px] text-zinc-400">
            网页提取与 RSS 抓取经由此代理（绕过浏览器 CORS）。默认
            <code class="px-1 py-0.5 bg-zinc-100 rounded text-[10px]">/api</code>
            （同源反向代理），可填 Cloudflare Worker 地址。
          </span>
        </div>
        <div class="flex gap-2">
          <input
            v-model="proxyUrl"
            type="text"
            placeholder="https://auramind-proxy.xxx.workers.dev 或 /api"
            class="flex-1 px-3 py-2 text-[13px] border border-zinc-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
            @keydown.enter="save"
          />
          <button
            class="px-3 py-2 text-[13px] font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors whitespace-nowrap"
            @click="save"
          >
            {{ saved ? '已保存' : '保存' }}
          </button>
          <button
            class="px-3 py-2 text-[13px] text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-lg transition-colors"
            title="恢复默认"
            @click="reset"
          >
            默认
          </button>
        </div>
      </div>
    </div>

    <!-- 说明 -->
    <div class="p-4">
      <div class="flex flex-col gap-0.5">
        <span class="text-zinc-700">关于 Web 版提取</span>
        <span class="text-[11px] text-zinc-400 leading-relaxed">
          Web 版没有浏览器扩展的 host_permissions，无法直接抓取任意网页。网页提取（粘贴 URL
          入库、RSS 条目采集）和 RSS 源刷新都通过代理服务在服务端完成。AI 调用仍在浏览器侧直连各
          Provider，不经过代理。
        </span>
      </div>
    </div>
  </div>
</template>
