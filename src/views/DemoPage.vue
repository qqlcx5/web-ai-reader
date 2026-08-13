<script setup lang="ts">
import { ref, computed } from 'vue'
import { cloneDeep, debounce, groupBy, uniq } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { useCounterStore } from '@/stores/counter'

const count = ref(0)

const handleClick = () => {
  const data = { name: 'Vue 3', version: '3.5' }
  const cloned = cloneDeep(data)
  console.log('Cloned data:', cloned)
  count.value++
}

// Pinia 示例
const counterStore = useCounterStore()

// Lodash-ES 示例
const rawList = ref('apple,banana,apple,cherry,banana')
const uniqResult = computed(() => uniq(rawList.value.split(',').filter(Boolean)))
const groupResult = computed(() =>
  groupBy(rawList.value.split(',').filter(Boolean), (item) => item.charAt(0)),
)

const debounceCount = ref(0)
const debouncedHit = debounce(() => {
  debounceCount.value++
  ElMessage.success(`debounce 生效，实际执行第 ${debounceCount.value} 次`)
}, 500)

// Element Plus 表单示例
const dialogVisible = ref(false)
const form = ref({ name: '', region: '' })
const handleSubmit = () => {
  dialogVisible.value = false
  ElMessage.success(`提交成功：${form.value.name || '(未填写)'} / ${form.value.region || '(未选择)'}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          <span class="i-tabler-brand-vue text-primary inline-block mr-2"></span>
          Vue 3 集成示例
        </h1>
        <p class="text-gray-600 text-lg">
          UnoCSS + Element Plus + Iconify + Lodash-ES + Pinia + Vue Router + Sass
        </p>
      </div>

      <!-- 组件示例导航 -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="i-tabler-table text-xl text-primary"></span>
            <span class="text-lg font-semibold">ProTable 组件示例（Vue Router）</span>
          </div>
        </template>
        <div class="grid grid-cols-2 gap-4">
          <RouterLink
            to="/ErpProTable"
            class="p-4 border border-gray-200 rounded-lg hover:(border-blue-400 shadow-md) transition-all no-underline"
          >
            <div class="flex items-center gap-2 text-gray-900 font-semibold mb-1">
              <span class="i-tabler-layout-grid text-primary"></span>
              ErpProTable
            </div>
            <p class="text-gray-500 text-sm m-0">传统 ERP 风格：表头内嵌搜索、紧凑边框、分页</p>
          </RouterLink>
          <RouterLink
            to="/ModernProTable"
            class="p-4 border border-gray-200 rounded-lg hover:(border-blue-400 shadow-md) transition-all no-underline"
          >
            <div class="flex items-center gap-2 text-gray-900 font-semibold mb-1">
              <span class="i-tabler-sparkles text-success"></span>
              ModernProTable
            </div>
            <p class="text-gray-500 text-sm m-0">现代 B2B 风格：轻量输入框、徽标、微交互</p>
          </RouterLink>
        </div>
      </el-card>

      <!-- UnoCSS 示例 -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="i-tabler-palette text-xl text-primary"></span>
            <span class="text-lg font-semibold">UnoCSS 原子类 / shortcuts / attributify</span>
          </div>
        </template>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="p-4 bg-blue-500 text-white rounded-lg text-center">
            蓝色盒子
          </div>
          <div class="p-4 bg-green-500 text-white rounded-lg text-center">
            绿色盒子
          </div>
          <div class="p-4 bg-purple-500 text-white rounded-lg text-center">
            紫色盒子
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <!-- shortcuts：uno.config.ts 中定义的 flex-center -->
          <div class="flex-center h-20 bg-amber-100 rounded-lg text-amber-700">
            shortcuts: flex-center
          </div>
          <!-- attributify 模式：类名写在属性上 -->
          <div flex="~ col" items-center justify-center h-20 bg-teal-100 rounded-lg text-teal-700>
            attributify: flex="~ col"
          </div>
        </div>
      </el-card>

      <!-- Element Plus 示例 -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="i-tabler-component text-xl text-success"></span>
            <span class="text-lg font-semibold">Element Plus 组件</span>
          </div>
        </template>
        <div class="flex gap-4 flex-wrap mb-4">
          <el-button type="primary" @click="handleClick">
            <span class="i-tabler-plus mr-1"></span>
            点击次数: {{ count }}
          </el-button>
          <el-button type="success">成功按钮</el-button>
          <el-button type="warning">警告按钮</el-button>
          <el-button type="danger">危险按钮</el-button>
          <el-button @click="dialogVisible = true">
            <span class="i-tabler-forms mr-1"></span>
            打开表单弹窗
          </el-button>
        </div>
        <div class="flex gap-4 flex-wrap items-center">
          <el-tag>标签</el-tag>
          <el-tag type="success">成功</el-tag>
          <el-tag type="warning">警告</el-tag>
          <el-switch />
          <el-rate />
          <el-progress :percentage="66" class="w-50" />
        </div>

        <el-dialog v-model="dialogVisible" title="表单示例" width="420px">
          <el-form :model="form" label-width="70px">
            <el-form-item label="名称">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="地区">
              <el-select v-model="form.region" placeholder="请选择地区" class="w-full">
                <el-option label="华东" value="华东" />
                <el-option label="华南" value="华南" />
                <el-option label="华北" value="华北" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
          </template>
        </el-dialog>
      </el-card>

      <!-- Pinia 示例 -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="i-tabler-database text-xl text-danger"></span>
            <span class="text-lg font-semibold">Pinia 状态管理</span>
          </div>
        </template>
        <div class="flex items-center gap-6">
          <el-button type="primary" @click="counterStore.increment">
            <span class="i-tabler-plus mr-1"></span>
            store.increment()
          </el-button>
          <div class="text-gray-700">
            count: <span class="font-bold text-primary">{{ counterStore.count }}</span>
          </div>
          <div class="text-gray-700">
            doubleCount (getter): <span class="font-bold text-success">{{ counterStore.doubleCount }}</span>
          </div>
        </div>
      </el-card>

      <!-- 图标示例 -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="i-tabler-icons text-xl text-warning"></span>
            <span class="text-lg font-semibold">Tabler 图标</span>
          </div>
        </template>
        <div class="flex gap-6 text-3xl">
          <span class="i-tabler-home text-primary hover:scale-125 transition-transform cursor-pointer"></span>
          <span class="i-tabler-user text-success hover:scale-125 transition-transform cursor-pointer"></span>
          <span class="i-tabler-settings text-warning hover:scale-125 transition-transform cursor-pointer"></span>
          <span class="i-tabler-heart text-danger hover:scale-125 transition-transform cursor-pointer"></span>
          <span class="i-tabler-star text-info hover:scale-125 transition-transform cursor-pointer"></span>
        </div>
      </el-card>

      <!-- Lodash-ES 示例 -->
      <el-card>
        <template #header>
          <div class="flex items-center gap-2">
            <span class="i-tabler-code text-xl text-info"></span>
            <span class="text-lg font-semibold">Lodash-ES 工具库</span>
          </div>
        </template>
        <div class="mb-4">
          <p class="text-gray-600 text-sm mb-2">输入逗号分隔的内容，实时演示 uniq / groupBy：</p>
          <el-input v-model="rawList" placeholder="例如 apple,banana,apple" class="mb-3" />
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-gray-100 rounded-lg">
              <div class="text-sm font-semibold text-gray-700 mb-1">uniq 去重</div>
              <code class="text-xs text-gray-600">{{ uniqResult }}</code>
            </div>
            <div class="p-3 bg-gray-100 rounded-lg">
              <div class="text-sm font-semibold text-gray-700 mb-1">groupBy 首字母分组</div>
              <code class="text-xs text-gray-600">{{ groupResult }}</code>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <el-button @click="debouncedHit">
            <span class="i-tabler-clock mr-1"></span>
            快速连点测试 debounce(500ms)
          </el-button>
          <span class="text-gray-600 text-sm">实际执行次数: {{ debounceCount }}</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Sass/SCSS 样式示例
.text-primary {
  color: #409eff;
}

.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.text-danger {
  color: #f56c6c;
}

.text-info {
  color: #909399;
}

// 使用 Sass 的嵌套和变量功能
$transition-duration: 0.3s;

.hover\:scale-125 {
  transition: transform $transition-duration ease;

  &:hover {
    transform: scale(1.25);
  }
}
</style>
