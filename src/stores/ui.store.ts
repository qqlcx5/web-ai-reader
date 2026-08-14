import { defineStore } from 'pinia'
import { ref } from 'vue'

// 外壳级 UI 状态（非业务）：主题、检查器开关、移动端抽屉开关、可调面板宽度。
// 持久化主题/检查器开关/面板宽度，刷新后保留。

// 可调面板宽度的边界（px）
const SIDEBAR_MIN = 200
const SIDEBAR_MAX = 480
const CONV_LIST_MIN = 200
const CONV_LIST_MAX = 480
const INSPECTOR_MIN = 240
const INSPECTOR_MAX = 520

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

export const useUiStore = defineStore(
  'ui',
  () => {
    const dark = ref(false)
    const inspectorOpen = ref(true)
    const sidebarOpen = ref(false)

    // 可调面板宽度（px），初始值与原固定宽度一致
    const sidebarWidth = ref(276) // 外壳功能侧栏
    const convListWidth = ref(276) // 工作区会话列
    const inspectorWidth = ref(304) // 工作区检查器

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

    function setSidebarWidth(w: number) {
      sidebarWidth.value = clamp(Math.round(w), SIDEBAR_MIN, SIDEBAR_MAX)
    }

    function setConvListWidth(w: number) {
      convListWidth.value = clamp(Math.round(w), CONV_LIST_MIN, CONV_LIST_MAX)
    }

    function setInspectorWidth(w: number) {
      inspectorWidth.value = clamp(Math.round(w), INSPECTOR_MIN, INSPECTOR_MAX)
    }

    return {
      dark,
      inspectorOpen,
      sidebarOpen,
      sidebarWidth,
      convListWidth,
      inspectorWidth,
      toggleTheme,
      toggleInspector,
      toggleSidebar,
      closeSidebar,
      setSidebarWidth,
      setConvListWidth,
      setInspectorWidth,
    }
  },
  {
    persist: {
      pick: ['dark', 'inspectorOpen', 'sidebarWidth', 'convListWidth', 'inspectorWidth'],
    },
  },
)
