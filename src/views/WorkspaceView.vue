<script lang="ts" setup>
import { computed } from 'vue'
import { PanelRight, Sparkles, Cloud } from '@lucide/vue'
import { useDocumentStore } from '@/stores/document.store'
import { useModelStore } from '@/stores/model.store'
import { useChatStore } from '@/stores/chat.store'
import { useUiStore } from '@/stores/ui.store'
import ChatView from '@/components/auramind/ChatView.vue'
import ChatInput from '@/components/auramind/ChatInput.vue'
import ConversationList from '@/components/workspace/ConversationList.vue'
import ContextPanel from '@/components/workspace/ContextPanel.vue'
import ResizeHandle from '@/components/layout/ResizeHandle.vue'

const documentStore = useDocumentStore()
const modelStore = useModelStore()
const chatStore = useChatStore()
const uiStore = useUiStore()

// 当前文档标题（顶部）+ 已挂载上下文标识
const activeDoc = computed(
  () => documentStore.pageDocument || documentStore.currentDocument,
)
const headerTitle = computed(() => activeDoc.value?.title || '新对话')
const currentModelName = computed(() => {
  const m = modelStore.models.find((x) => x.id === modelStore.currentModelId)
  return m ? m.name : '未选择模型'
})
</script>

<template>
  <!-- 工作区为两栏：主区（会话横条 + 聊天）+ 检查器（可选）。
       ConversationList 是水平横条设计，放在主区顶部，适配宽屏和窄屏。 -->
  <div class="flex min-h-0 flex-1">
    <!-- 主区 -->
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <header
        class="flex h-[60px] shrink-0 items-center justify-between border-b border-line px-5"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-ink">{{ headerTitle }}</div>
            <div class="flex items-center gap-1 text-xs text-muted">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>{{ currentModelName }} · 已就绪</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <span class="hidden items-center gap-1 text-xs text-muted sm:flex">
            <Cloud class="h-3.5 w-3.5" />
            已保存
          </span>
          <button
            title="切换检查器"
            aria-label="切换检查器"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-gray-100"
            :class="uiStore.inspectorOpen ? 'text-brand' : ''"
            @click="uiStore.toggleInspector()"
          >
            <PanelRight class="h-4 w-4" />
          </button>
        </div>
      </header>

      <!-- 水平会话横条（ConversationList 是 flex-row 横向滚动设计） -->
      <ConversationList />

      <div class="relative flex min-h-0 flex-1 flex-col">
        <!-- 空状态 -->
        <div
          v-if="chatStore.messages.length === 0"
          class="flex min-h-[54vh] flex-col items-center justify-center px-6 text-center"
        >
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-soft text-brand"
          >
            <Sparkles class="h-7 w-7" />
          </div>
          <h1 class="mb-1.5 text-2xl font-semibold tracking-tight text-ink">
            想了解这篇文档的什么？
          </h1>
          <p class="mb-6 text-sm text-muted">
            选择记忆库中的文档开始对话，或在下方直接提问
          </p>
        </div>

        <ChatView v-show="chatStore.messages.length > 0" />
        <ChatInput />
      </div>
    </div>

    <!-- 检查器（可调宽度，≤1023px 隐藏；由 uiStore.inspectorOpen 控制） -->
    <aside
      v-if="uiStore.inspectorOpen"
      class="relative hidden shrink-0 flex-col border-l border-line bg-panel lg:flex"
      :style="{ width: uiStore.inspectorWidth + 'px' }"
    >
      <div
        class="flex h-[60px] shrink-0 items-center justify-between border-b border-line px-4"
      >
        <span class="text-sm font-semibold text-ink">检查器</span>
      </div>
      <div class="scrollbar min-h-0 flex-1 overflow-y-auto">
        <ContextPanel />
      </div>
      <!-- 左边缘拖拽把手 -->
      <ResizeHandle
        class="absolute inset-y-0 left-0"
        side="left"
        @resize="uiStore.setInspectorWidth(uiStore.inspectorWidth + $event)"
      />
    </aside>
  </div>
</template>
