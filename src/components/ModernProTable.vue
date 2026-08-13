<template>
  <div class="modern-b2b-table">
    <!-- 工具栏区域 -->
    <div class="table-toolbar" v-if="$slots.toolbar">
      <slot name="toolbar" />
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      class="linear-style-table"
      :border="true"
    >
      <template v-for="(col, index) in columns" :key="col.prop || index">

        <!-- 【外层表头：搜索过滤层】 -->
        <el-table-column
          :fixed="col.fixed"
          :width="col.width"
          :min-width="col.minWidth"
          align="center"
          class-name="filter-row-cell"
        >
          <template #header>
            <div class="modern-input-wrapper" v-if="col.search && col.prop">
              <!-- 文本输入 -->
              <div class="input-container" v-if="col.search.type === 'input'">
                <i class="i-tabler-search input-prefix-icon"></i>
                <input
                  type="text"
                  class="modern-native-input"
                  v-model="searchParams[col.prop]"
                  placeholder="搜索..."
                  @keyup.enter="triggerSearch"
                  @blur="triggerSearch"
                />
              </div>

              <!-- 下拉选择 (这里保留el-select但重写样式，因为原生select较难统一跨端UI) -->
              <el-select
                v-else-if="col.search.type === 'select'"
                v-model="searchParams[col.prop]"
                placeholder="全部"
                clearable
                @change="triggerSearch"
                class="modern-select"
                popper-class="modern-select-dropdown"
              >
                <el-option
                  v-for="opt in col.search.options"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </div>
            <!-- 空白占位 -->
            <div v-else class="empty-filter-cell"></div>
          </template>

          <!-- 【内层表头：真实列名与数据展示】 -->
          <el-table-column
            :label="col.label"
            :prop="col.prop"
            :type="col.type"
            :width="col.width"
            :min-width="col.minWidth"
            :align="col.align || 'left'"
            class-name="data-row-cell"
            header-align="left"
          >
            <!-- 自定义表头（比如带排序小图标） -->
            <template #header v-if="col.label">
              <span class="column-title">{{ col.label }}</span>
            </template>

            <!-- 数据行渲染 -->
            <template #default="scope" v-if="!col.type">
              <slot v-if="col.prop && $slots[col.prop]" :name="col.prop" :row="scope.row" :index="scope.$index" />
              <!-- 缺省态颜色变淡 -->
              <span v-else :class="{'text-muted': !(col.prop && scope.row[col.prop])}">
                {{ (col.prop && scope.row[col.prop]) || '-' }}
              </span>
            </template>
          </el-table-column>

        </el-table-column>
      </template>

      <!-- 空状态使用现代插画或简练文字 -->
      <template #empty>
        <div class="modern-empty-state">
          <i class="i-tabler-database-off empty-icon"></i>
          <p>暂无符合条件的数据</p>
        </div>
      </template>
    </el-table>

    <!-- 现代版分页 -->
    <div class="modern-pagination" v-if="pagination">
      <el-pagination
        v-model:current-page="pageable.pageNum"
        v-model:page-size="pageable.pageSize"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        :total="pageable.total"
        @size-change="triggerSearch"
        @current-change="fetchData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { ProTableColumn, ProTableRequestApi } from './proTable';

const props = withDefaults(
  defineProps<{
    requestApi: ProTableRequestApi;
    columns: ProTableColumn[];
    pagination?: boolean;
  }>(),
  { pagination: true },
);

const loading = ref(false);
const tableData = ref<Record<string, unknown>[]>([]);
const searchParams = reactive<Record<string, unknown>>({});
const pageable = reactive({ pageNum: 1, pageSize: 20, total: 0 });

const triggerSearch = () => { pageable.pageNum = 1; fetchData(); };

const fetchData = async () => {
  loading.value = true;
  try {
    const params = { ...(props.pagination ? { pageNum: pageable.pageNum, pageSize: pageable.pageSize } : {}), ...searchParams };
    const res = await props.requestApi(params);
    tableData.value = res.data.list || [];
    pageable.total = res.data.total || 0;
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchData());
defineExpose({ fetchData, searchParams });
</script>

<style scoped lang="scss">
/*
  ============== 现代 B2B 美学核心 CSS ==============
  摒弃 Element 默认的粗糙边框，采用 Tailwind 风格的色彩体系 (Slate/Zinc)
*/
.modern-b2b-table {
  --table-border-color: #E2E8F0; /* Slate 200 */
  --table-header-bg: #F8FAFC;    /* Slate 50 */
  --text-primary: #0F172A;       /* Slate 900 */
  --text-secondary: #475569;     /* Slate 600 */
  --text-muted: #94A3B8;         /* Slate 400 */
  --focus-ring: 0 0 0 2px rgba(59, 130, 246, 0.25); /* 柔和的蓝色光晕 */
  --border-radius-sm: 6px;

  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--table-border-color);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  padding: 1px;

  .linear-style-table {
    border-radius: 8px;
    --el-table-border-color: var(--table-border-color);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-text-color: var(--text-primary);

    /* 重写表头背景和去线 */
    :deep(th.el-table__cell) {
      background-color: var(--table-header-bg) !important;
      border-bottom: 1px solid var(--table-border-color) !important;
      border-right: 1px solid var(--table-border-color) !important;
    }

    /* 【核心魔法】：第一行搜索行样式 */
    :deep(thead tr:nth-child(1) th) {
      padding: 6px 8px;
      border-bottom: none !important; /* 去掉第一行和第二行之间的粗硬实线 */
      background: #F1F5F9 !important; /* 搜索行背景稍微深一点点，形成层级 */
    }

    /* 【核心魔法】：第二行真实列名样式 */
    :deep(thead tr:nth-child(2) th) {
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* 数据行样式：更通透的呼吸感 */
    :deep(td.el-table__cell) {
      padding: 10px 12px;
      font-size: 13px;
      border-bottom: 1px solid #F1F5F9; /* 非常淡的行分割线 */
      transition: background-color 0.2s ease;
    }

    /* 悬停整行的高级感反馈 */
    :deep(tbody tr:hover > td) {
      background-color: #F8FAFC !important;
    }

    /* 定制化原生输入框：比 el-input 更轻量、更好看 */
    .modern-input-wrapper {
      width: 100%;
      position: relative;

      .input-container {
        position: relative;
        display: flex;
        align-items: center;

        .input-prefix-icon {
          position: absolute;
          left: 8px;
          color: var(--text-muted);
          font-size: 14px;
        }

        .modern-native-input {
          width: 100%;
          height: 28px;
          padding: 0 8px 0 26px;
          font-size: 12px;
          color: var(--text-primary);
          background-color: #fff;
          border: 1px solid var(--table-border-color);
          border-radius: var(--border-radius-sm);
          outline: none;
          transition: all 0.2s ease;

          &::placeholder { color: var(--text-muted); }
          &:hover { border-color: #CBD5E1; }
          &:focus {
            border-color: #3B82F6;
            box-shadow: var(--focus-ring);
          }
        }
      }

      /* 重写 Element Plus 的 Select 以符合整体风格 */
      :deep(.el-select) {
        .el-input__wrapper {
          height: 28px;
          border-radius: var(--border-radius-sm);
          box-shadow: 0 0 0 1px var(--table-border-color) inset;
          &:hover { box-shadow: 0 0 0 1px #CBD5E1 inset; }
          &.is-focus { box-shadow: var(--focus-ring), 0 0 0 1px #3B82F6 inset !important; }
        }
      }
    }

    .empty-filter-cell {
      height: 28px;
    }

    .text-muted {
      color: var(--text-muted);
    }
  }

  /* 现代空状态 */
  .modern-empty-state {
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-muted);

    .empty-icon {
      font-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }
  }

  /* 底部精简分页 */
  .modern-pagination {
    padding: 12px 16px;
    display: flex;
    justify-content: flex-end;
    background: #fff;
    border-radius: 0 0 8px 8px;
  }
}
</style>
