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
  <div class="flex h-screen w-screen overflow-hidden bg-panel text-ink">
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

    <!-- 桌面端：Rail + Sidebar + Main 水平 flex 排列，撑满全屏 -->
    <template v-if="!mobile">
      <!-- 外壳功能侧栏（可调宽度），仅在需要侧栏的视图显示 -->
      <AppSidebar
        v-if="sidebarConfig.show"
        :title="sidebarConfig.title"
        :subtitle="sidebarConfig.subtitle"
        :width="uiStore.sidebarWidth"
      >
        <div id="shell-sidebar" class="min-h-0 flex-1">
          <div class="p-3 text-center text-xs text-muted">
            {{ sidebarConfig.title }} 列表（待接入）
          </div>
        </div>
      </AppSidebar>

      <!-- 主区：flex-1 占据剩余宽度 -->
      <main class="flex min-h-0 min-w-0 flex-1 flex-col">
        <RouterView />
      </main>
    </template>

    <!-- 移动端：Rail 隐藏（底部导航），Sidebar 抽屉，main 占满 -->
    <template v-else>
      <AppSidebar
        v-if="sidebarConfig.show"
        :title="sidebarConfig.title"
        :subtitle="sidebarConfig.subtitle"
        :sidebar-open="uiStore.sidebarOpen"
        :mobile="true"
      >
        <div id="shell-sidebar" class="min-h-0 flex-1">
          <div class="p-3 text-center text-xs text-muted">
            {{ sidebarConfig.title }} 列表（待接入）
          </div>
        </div>
      </AppSidebar>

      <main class="flex min-h-0 min-w-0 flex-1 flex-col pb-[58px]">
        <RouterView />
      </main>
    </template>

    <Toaster />
  </div>
</template>
