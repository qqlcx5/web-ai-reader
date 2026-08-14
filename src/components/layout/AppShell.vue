<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui.store'
import { useAppStore } from '@/stores/app.store'
import AppRail from './AppRail.vue'
import Toaster from '@/components/Toaster.vue'

const uiStore = useUiStore()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

// 防止路由↔store 双向同步产生循环
let syncing = false

// 响应式断点：≤759px 视为移动端
const MOBILE_BP = 759
const mobile = ref(false)
let mql: MediaQueryList | null = null

function updateMobile(e: MediaQueryListEvent | MediaQueryList) {
  mobile.value = e.matches
}

onMounted(() => {
  mql = window.matchMedia(`(max-width: ${MOBILE_BP}px)`)
  updateMobile(mql)
  mql.addEventListener('change', updateMobile)
})

onBeforeUnmount(() => {
  mql?.removeEventListener('change', updateMobile)
})

// 把当前路由名同步到 app.store.currentView（供业务逻辑判断视图）
watch(
  () => route.name,
  (name) => {
    if (!name || syncing) return
    syncing = true
    appStore.setCurrentView(name as any, { resetHistory: true })
    syncing = false
  },
  { immediate: true },
)

// 反向同步：业务代码通过 appStore.setCurrentView / goBack 切换视图时，
// 同步推送到路由（例如 LibraryView 打开文档后跳回工作区）。
watch(
  () => appStore.currentView,
  (view) => {
    if (syncing || view === route.name) return
    syncing = true
    router.push({ name: view }).finally(() => {
      syncing = false
    })
  },
)
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-panel text-ink">
    <AppRail
      :dark="uiStore.dark"
      :mobile="mobile"
      @toggle-theme="uiStore.toggleTheme()"
      @toggle-sidebar="uiStore.toggleSidebar()"
    />

    <!-- 主区：Rail + Main 水平 flex 排列，撑满全屏。
         所有视图统一为 Rail(68px) + 主区(flex-1)，不再有外壳侧栏。
         每个视图内部自行管理布局（如 FeedsView 的三栏、WorkspaceView 的会话横条+聊天）。 -->
    <main class="flex min-h-0 min-w-0 flex-1 flex-col" :class="mobile ? 'pb-[58px]' : ''">
      <RouterView />
    </main>

    <Toaster />
  </div>
</template>
