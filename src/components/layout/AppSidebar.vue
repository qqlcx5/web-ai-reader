<script lang="ts" setup>
import { Plus } from '@lucide/vue'

// rechat 风格的会话/功能侧栏（276px）。
// 移动端为抽屉，由 sidebarOpen 控制显隐。
// 内容通过默认 slot 注入（工作区=会话列表，其他视图=上下文面板）。
defineProps<{
  title: string
  /** slot 上方的副标题/描述 */
  subtitle?: string
  sidebarOpen: boolean
  mobile: boolean
}>()

const emit = defineEmits<{ 'new-item': [] }>()
</script>

<template>
  <aside
    :class="[
      'desktop-sidebar fixed bottom-0 left-[68px] top-0 z-30 flex w-[276px] flex-col border-r border-line bg-white',
      // 移动端：宽度微调 + 抽屉位移
      mobile && 'left-0 w-[286px] transition-transform duration-200',
      mobile && (sidebarOpen ? 'translate-x-0' : '-translate-x-[105%]'),
    ]"
    :style="mobile ? { boxShadow: sidebarOpen ? '10px 0 30px rgba(16,24,40,.14)' : 'none' } : undefined"
  >
    <!-- 60px 头部 -->
    <div class="flex h-[60px] shrink-0 items-center justify-between border-b border-line px-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <slot name="icon"><Plus class="h-4 w-4" /></slot>
        </div>
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold text-ink">{{ title }}</div>
          <div v-if="subtitle" class="truncate text-xs text-muted">{{ subtitle }}</div>
        </div>
      </div>
      <button
        title="新建"
        aria-label="新建"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-gray-100"
        @click="emit('new-item')"
      >
        <Plus class="h-4 w-4" />
      </button>
    </div>

    <!-- 列表/内容区：可滚动 -->
    <div class="scrollbar min-h-0 flex-1 overflow-y-auto">
      <slot />
    </div>

    <!-- 底部状态条（本地数据已保存） -->
    <div class="flex shrink-0 items-center gap-2 border-t border-line px-4 py-3 text-xs text-muted">
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      <span>本地数据已保存</span>
    </div>
  </aside>
</template>
