<script lang="ts" setup>
import { Plus } from '@lucide/vue'
import ResizeHandle from './ResizeHandle.vue'
import { useUiStore } from '@/stores/ui.store'

// rechat 风格的会话/功能侧栏。
// 桌面端：flex 子元素，宽度由 uiStore.sidebarWidth 驱动（可拖拽调节）。
// 移动端：固定定位抽屉，由 sidebarOpen 控制显隐。
const props = defineProps<{
  title: string
  subtitle?: string
  /** 桌面端宽度（px），来自 uiStore.sidebarWidth */
  width?: number
  /** 移动端抽屉开关 */
  sidebarOpen?: boolean
  mobile?: boolean
}>()

const emit = defineEmits<{ 'new-item': [] }>()
const uiStore = useUiStore()
</script>

<template>
  <!-- 桌面端：flex 子元素，宽度可调 -->
  <aside
    v-if="!mobile"
    class="relative flex shrink-0 flex-col border-r border-line bg-white"
    :style="{ width: (props.width ?? 276) + 'px' }"
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

    <!-- 右边缘拖拽把手（绝对定位，不占布局空间） -->
    <ResizeHandle
      class="absolute inset-y-0 right-0"
      side="right"
      @resize="uiStore.setSidebarWidth(uiStore.sidebarWidth + $event)"
    />
  </aside>

  <!-- 移动端：抽屉（固定定位） -->
  <aside
    v-else
    class="fixed inset-y-0 left-0 z-30 flex w-[286px] flex-col border-r border-line bg-white transition-transform duration-200"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-[105%]'"
    :style="{ boxShadow: sidebarOpen ? '10px 0 30px rgba(16,24,40,.14)' : 'none' }"
  >
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
    <div class="scrollbar min-h-0 flex-1 overflow-y-auto">
      <slot />
    </div>
    <div class="flex shrink-0 items-center gap-2 border-t border-line px-4 py-3 text-xs text-muted">
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      <span>本地数据已保存</span>
    </div>
  </aside>
</template>
