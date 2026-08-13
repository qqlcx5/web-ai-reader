<template>
  <div class="erp-pro-table">
    <!-- 顶部可能需要的工具栏（导出、新增等） -->
    <div class="toolbar" v-if="$slots.toolbar">
      <slot name="toolbar" />
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      size="small"
      style="width: 100%"
      class="erp-custom-table"
    >
      <!-- 动态渲染每一列 -->
      <template v-for="(col, index) in columns" :key="col.prop || index">

        <!-- 【外层表头】：占据表格的第一行，专门用来放置搜索框 -->
        <el-table-column
          :fixed="col.fixed"
          :width="col.width"
          :min-width="col.minWidth"
          align="center"
          class-name="search-row-cell"
        >
          <!-- 自定义外层表头内容 -->
          <template #header>
            <div class="search-input-wrapper" v-if="col.search && col.prop">
              <!-- 文本搜索 -->
              <el-input
                v-if="col.search.type === 'input'"
                v-model="searchParams[col.prop]"
                size="small"
                clearable
                @change="triggerSearch"
                @keyup.enter="triggerSearch"
              />
              <!-- 下拉搜索 -->
              <el-select
                v-else-if="col.search.type === 'select'"
                v-model="searchParams[col.prop]"
                size="small"
                clearable
                @change="triggerSearch"
              >
                <el-option
                  v-for="opt in col.search.options"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </div>
            <!-- 如果没有配置搜索，这行留空占位，保证第一行高度对齐 -->
            <div v-else class="empty-search-cell"></div>
          </template>

          <!-- 【内层表头】：占据表格的第二行，用于显示列名，并负责渲染数据 -->
          <el-table-column
            :label="col.label"
            :prop="col.prop"
            :type="col.type"
            :width="col.width"
            :min-width="col.minWidth"
            :align="col.align || 'left'"
            class-name="data-row-cell"
          >
            <!-- 数据行渲染 -->
            <template #default="scope" v-if="!col.type">
              <!-- 如果外部传入了插槽，使用插槽 -->
              <slot v-if="col.prop && $slots[col.prop]" :name="col.prop" :row="scope.row" :index="scope.$index" />
              <!-- 否则默认显示文本 -->
              <span v-else>{{ (col.prop && scope.row[col.prop]) ?? '' }}</span>
            </template>
          </el-table-column>

        </el-table-column>
      </template>

      <!-- 空数据 -->
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-box" v-if="pagination">
      <el-pagination
        v-model:current-page="pageable.pageNum"
        v-model:page-size="pageable.pageSize"
        :page-sizes="[20, 50, 100, 200]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageable.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
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

// 触发搜索
const triggerSearch = () => {
  pageable.pageNum = 1;
  fetchData();
};

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      ...(props.pagination ? { pageNum: pageable.pageNum, pageSize: pageable.pageSize } : {}),
      ...searchParams
    };
    const res = await props.requestApi(params);
    tableData.value = res.data.list || [];
    pageable.total = res.data.total || 0;
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (val: number) => {
  pageable.pageSize = val;
  triggerSearch();
};

const handleCurrentChange = (val: number) => {
  pageable.pageNum = val;
  fetchData();
};

onMounted(() => fetchData());

// 对外暴露方法
defineExpose({ fetchData, searchParams });
</script>

<style scoped lang="scss">
.erp-pro-table {
  /* ==============================================
     高度还原 ERP 传统风格 CSS
     ============================================== */
  .erp-custom-table {
    border: 1px solid #dcdfe6;

    /* 1. 统一表头背景色（还原图片中的浅蓝色） */
    :deep(th.el-table__cell) {
      background-color: #eef4fc !important;
      color: #333;
      font-weight: normal;
      padding: 0; /* 移除默认 padding 方便输入框撑满 */
    }

    /* 2. 第一行表头（搜索行）：紧凑，无上下边距 */
    :deep(thead tr:nth-child(1) th) {
      padding: 2px 2px; /* 给输入框留一点点间隙 */
      border-bottom: 1px solid #dcdfe6;
    }

    /* 3. 第二行表头（列名行）：设置合适的行高 */
    :deep(thead tr:nth-child(2) th) {
      padding: 8px 4px;
      font-size: 13px;
    }

    /* 4. 输入框样式重写：填满单元格，无圆角 */
    .search-input-wrapper {
      width: 100%;
      height: 28px;

      :deep(.el-input), :deep(.el-select) {
        width: 100%;
        height: 100%;
      }

      :deep(.el-input__wrapper) {
        border-radius: 0; /* 移除圆角，符合传统 ERP 风格 */
        box-shadow: none; /* 移除 Element 默认的阴影边框 */
        border: 1px solid #c0c4cc; /* 换成实线细边框 */
        padding: 0 8px;
        background-color: #fff;
      }

      /* 聚焦时边框变蓝 */
      :deep(.el-input__wrapper.is-focus) {
        border-color: #409eff;
      }

      :deep(.el-input__inner) {
        height: 26px;
        font-size: 12px;
      }
    }

    /* 5. 没有搜索框的单元格，放一个空 div 撑开高度 */
    .empty-search-cell {
      height: 28px;
      width: 100%;
    }

    /* 6. 数据行稍微紧凑一点 */
    :deep(td.el-table__cell) {
      padding: 6px 0;
      font-size: 13px;
      color: #606266;
    }
  }

  .pagination-box {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
