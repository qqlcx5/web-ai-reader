import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'

// AppShell 作为布局父路由（Rail + Sidebar + Inspector 持久存在），
// 六大功能视图作为子路由，对应源项目的 currentView。
const routes = [
  {
    path: '/',
    component: AppShell,
    children: [
      { path: '', redirect: '/workspace' },
      {
        path: 'workspace',
        name: 'workspace',
        component: () => import('@/views/WorkspaceView.vue'),
      },
      {
        path: 'library',
        name: 'library',
        component: () => import('@/views/LibraryView.vue'),
      },
      {
        path: 'analysis',
        name: 'analysis',
        component: () => import('@/views/AnalysisView.vue'),
      },
      {
        path: 'feeds',
        name: 'feeds',
        component: () => import('@/views/FeedsView.vue'),
      },
      {
        path: 'usage',
        name: 'usage',
        component: () => import('@/views/UsageView.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
