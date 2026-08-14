<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui.store'
import { useAppStore } from '@/stores/app.store'
import AppRail from './AppRail.vue'
import AppSidebar from './AppSidebar.vue'
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

// 各视图侧栏配置：标题 / 副标题 / 是否显示外壳侧栏。
// workspace 自带三栏（会话列+主区+检查器），故关闭外壳侧栏避免重复面板。
const sidebarConfig = computed<{ title: string; subtitle?: string; show: boolean }>(() => {
  switch (route.name) {
    case 'library':
      return { title: '记忆库', subtitle: '已收藏文档', show: true }
    case 'analysis':
      return { title: 'AI 分析', subtitle: '任务队列', show: true }
    case 'feeds':
      return { title: '订阅', subtitle: 'RSS 源', show: true }
    case 'usage':
      return { title: '用量', show: false }
    case 'settings':
      return { title: '设置', show: false }
    default:
      return { title: '', show: false }
  }
})
</script>

<template>
  <div class="h-screen overflow-hidden bg-panel text-ink">
    <!-- 移动端侧栏遮罩 -->
    <div
      v-if="mobile && uiStore.sidebarOpen"
      class="fixed inset-0 z-50 bg-slate-900/25"
      @click="uiStore.closeSidebar()"
    />

    <AppRail
      :dark="uiStore.dark"
      :mobile="mobile"
      @toggle-theme="uiStore.toggleTheme()"
      @toggle-sidebar="uiStore.toggleSidebar()"
    />

    <AppSidebar
      v-if="sidebarConfig.show"
      :title="sidebarConfig.title"
      :subtitle="sidebarConfig.subtitle"
      :sidebar-open="uiStore.sidebarOpen"
      :mobile="mobile"
    >
      <!-- 视图通过 <Teleport to="#shell-sidebar"> 注入列表内容 -->
      <div id="shell-sidebar" class="min-h-0 flex-1">
        <div class="p-3 text-center text-xs text-muted">
          {{ sidebarConfig.title }} 列表（待接入）
        </div>
      </div>
    </AppSidebar>

    <!-- 主区：桌面 ml-[344px]（68+276），无侧栏视图 ml-[68px]，移动 ml-0 -->
    <main
      :class="[
        'flex h-screen min-h-0 flex-col',
        !mobile && sidebarConfig.show && 'ml-[344px]',
        !mobile && !sidebarConfig.show && 'ml-[68px]',
        mobile && 'ml-0',
      ]"
    >
      <RouterView />
    </main>

    <Toaster />
  </div>
</template>
