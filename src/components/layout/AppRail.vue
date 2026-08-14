<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PanelRight,
  BookOpen,
  Zap,
  Rss,
  Gauge,
  Settings,
  Moon,
  Sun,
} from '@lucide/vue'
import LogoMark from '@/components/common/LogoMark.vue'

// 导航项映射源项目六大视图（currentView）到 rechat 导轨位。
// 工作区 / 记忆库 / AI分析 / 订阅 / 用量 / 设置
const navItems = [
  { key: 'workspace', icon: PanelRight, label: '工作区', to: '/workspace' },
  { key: 'library', icon: BookOpen, label: '记忆库', to: '/library' },
  { key: 'analysis', icon: Zap, label: 'AI 分析', to: '/analysis' },
  { key: 'feeds', icon: Rss, label: '订阅', to: '/feeds' },
  { key: 'usage', icon: Gauge, label: '用量', to: '/usage' },
  { key: 'settings', icon: Settings, label: '设置', to: '/settings' },
] as const

const route = useRoute()
const router = useRouter()

const activeKey = computed(() => (route.name as string) ?? 'workspace')

const props = defineProps<{
  dark: boolean
  mobile: boolean
}>()
const emit = defineEmits<{ 'toggle-theme': []; 'toggle-sidebar': [] }>()

function navigate(to: string) {
  router.push(to)
}
</script>

<template>
  <!-- 桌面导轨：flex 子元素，固定 68px 宽 -->
  <aside
    v-if="!mobile"
    class="rail flex w-[68px] shrink-0 flex-col items-center border-r border-line bg-white py-4"
  >
    <div class="mb-8 flex h-10 w-10 items-center justify-center">
      <LogoMark />
    </div>

    <nav class="flex flex-col gap-3">
      <button
        v-for="item in navItems"
        :key="item.key"
        :title="item.label"
        :aria-label="item.label"
        :class="
          activeKey === item.key
            ? 'bg-brand-soft text-brand'
            : 'text-muted hover:bg-gray-100'
        "
        class="flex h-10 w-10 items-center justify-center rounded-xl transition"
        @click="navigate(item.to)"
      >
        <component :is="item.icon" class="h-[18px] w-[18px]" />
      </button>
    </nav>

    <div class="mt-auto flex flex-col items-center gap-3">
      <button
        title="切换主题"
        aria-label="切换主题"
        class="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-gray-100"
        @click="emit('toggle-theme')"
      >
        <component :is="props.dark ? Sun : Moon" class="h-[18px] w-[18px]" />
      </button>
      <div
        class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-brand"
      >
        L
      </div>
    </div>
  </aside>

  <!-- 移动端：导轨隐藏，由底部导航代替 -->
  <nav
    v-else
    class="mobile-nav fixed bottom-0 left-0 right-0 z-50 flex h-[58px] items-center justify-around border-t border-line bg-white"
  >
    <button
      v-for="item in navItems"
      :key="item.key"
      :class="activeKey === item.key ? 'text-brand' : 'text-muted'"
      class="flex flex-col items-center gap-1 text-[10px]"
      @click="navigate(item.to)"
    >
      <component :is="item.icon" class="h-[18px] w-[18px]" />
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>
