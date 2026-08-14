import { defineStore } from 'pinia'
import { ref } from 'vue'

// 外壳级 UI 状态（非业务）：主题、检查器开关、移动端抽屉开关。
// 持久化主题与检查器开关，刷新后保留。
export const useUiStore = defineStore(
  'ui',
  () => {
    const dark = ref(false)
    const inspectorOpen = ref(true)
    const sidebarOpen = ref(false)

    function toggleTheme() {
      dark.value = !dark.value
    }

    function toggleInspector() {
      inspectorOpen.value = !inspectorOpen.value
    }

    function toggleSidebar() {
      sidebarOpen.value = !sidebarOpen.value
    }

    function closeSidebar() {
      sidebarOpen.value = false
    }

    return { dark, inspectorOpen, sidebarOpen, toggleTheme, toggleInspector, toggleSidebar, closeSidebar }
  },
  {
    persist: {
      pick: ['dark', 'inspectorOpen'],
    },
  },
)
