<template>
  <div style="padding: 10px;">
    <!-- 引入封装好的组件 -->
    <ErpProTable
      ref="tableRef"
      :requestApi="fetchMockData"
      :columns="tableColumns"
    >
      <!-- 插槽：顶部工具栏 -->
      <template #toolbar>
        <div class="toolbar-box">
          <el-button type="primary" size="small" @click="handleAdd">
            <i class="i-tabler-plus" style="margin-right: 4px;"></i>新增
          </el-button>
          <el-button size="small" @click="handleExport">
            <i class="i-tabler-download" style="margin-right: 4px;"></i>导出
          </el-button>
          <el-button size="small" @click="handleRefresh">
            <i class="i-tabler-refresh" style="margin-right: 4px;"></i>刷新
          </el-button>
        </div>
      </template>

      <!-- 插槽：自定义操作列的内容 -->
      <template #action="{ row }">
        <!-- 蓝色小图标按钮 -->
        <i
          class="i-tabler-pencil action-icon"
          title="编辑"
          @click="handleEdit(row)"
        ></i>
        <i
          class="i-tabler-circle-x action-icon"
          title="作废"
          @click="handleCancel(row)"
        ></i>
      </template>

      <!-- 插槽：将报告编号变成蓝色链接 -->
      <template #reportNo="{ row }">
        <a href="#" style="color: #409EFF; text-decoration: none;" @click.prevent="handleEdit(row)">{{ row.reportNo }}</a>
      </template>

      <!-- 插槽：试穿任务编号也是蓝色链接 -->
      <template #taskNo="{ row }">
        <a href="#" style="color: #409EFF; text-decoration: none;" @click.prevent="handleEdit(row)">{{ row.taskNo }}</a>
      </template>

      <!-- 插槽：数量列使用 Tag 展示 -->
      <template #quantity="{ row }">
        <el-tag size="small" :type="Number(row.quantity) > 5 ? 'success' : 'info'">{{ row.quantity }}</el-tag>
      </template>
    </ErpProTable>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import ErpProTable from '../components/ErpProTable.vue';
import type { ProTableColumn, ProTableResponse } from '../components/proTable';

const tableRef = ref<InstanceType<typeof ErpProTable>>();

// 【核心】：columns 配置（search 配置决定第一行是否出现搜索框）
const tableColumns: ProTableColumn[] = [
  // 1. 序列号（上方会自动留白）
  { type: 'index', width: '50', align: 'center' },

  // 2. 复选框（上方会自动留白）
  { type: 'selection', width: '50', align: 'center' },

  // 3. 操作列（上方会自动留白）
  { label: '操作', prop: 'action', width: '80', align: 'center' },

  // 4. 报告编号（配置 search: { type: 'input' }，第一行会自动出现输入框）
  { label: '报告编号', prop: 'reportNo', width: '140', search: { type: 'input' } },

  // 5. 试穿任务编号
  { label: '试穿任务编号', prop: 'taskNo', width: '140', search: { type: 'input' } },

  // 6. 数量
  { label: '数量', prop: 'quantity', width: '80', align: 'center', search: { type: 'input' } },

  // 7. 尺码
  { label: '尺码', prop: 'size', width: '120', search: { type: 'input' } },

  // 8. 货号
  { label: '货号', prop: 'itemNo', width: '100', search: { type: 'input' } },

  // 9. 品牌（下拉搜索示例）
  {
    label: '品牌', prop: 'brand', width: '140',
    search: {
      type: 'select',
      options: [
        { label: '安踏成人-大货', value: '安踏成人-大货' },
        { label: '安踏儿童', value: '安踏儿童' },
        { label: 'FILA', value: 'FILA' },
      ],
    },
  },

  // 10. 开发供应商
  { label: '开发供应商', prop: 'supplier', width: '120', search: { type: 'input' } },

  // 11. 开发供应商编码
  { label: '开发供应商编码', prop: 'supplierCode', width: '140', search: { type: 'input' } },

  // 12. 季度（下拉搜索示例）
  {
    label: '季度', prop: 'season', width: '100',
    search: {
      type: 'select',
      options: [
        { label: '17Q1', value: '17Q1' },
        { label: '17Q2', value: '17Q2' },
        { label: '18Q1', value: '18Q1' },
      ],
    },
  },

  // 13. 中类
  { label: '中类', prop: 'category', minWidth: '100', search: { type: 'input' } }
];

// 模拟数据源：60 条数据，方便演示分页
const brands = ['安踏成人-大货', '安踏儿童', 'FILA'];
const categories = ['足球鞋', '跑步鞋', '篮球鞋', '休闲鞋'];
const seasons = ['17Q1', '17Q2', '18Q1'];
const allRows = Array.from({ length: 60 }, (_, i) => ({
  reportNo: `SCN2603110${String(i + 1).padStart(2, '0')}`,
  taskNo: `TSK2603110${String(i + 1).padStart(2, '0')}`,
  quantity: (i % 9) + 1,
  size: '1,11,2,4,6',
  itemNo: String(100 + i),
  brand: brands[i % brands.length],
  supplier: i % 2 === 0 ? '泉州安大' : '乐骏',
  supplierCode: i % 2 === 0 ? '100021' : '101641',
  season: seasons[i % seasons.length],
  category: categories[i % categories.length],
}));

// 模拟 API 请求：支持搜索过滤 + 分页
const fetchMockData = (params: Record<string, unknown>): Promise<ProTableResponse> => {
  console.log('触发搜索请求，参数为：', params);
  const { pageNum = 1, pageSize = 20, ...filters } = params as Record<string, string | number>;

  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = allRows.filter((row) =>
        Object.entries(filters).every(([key, val]) =>
          val === undefined || val === '' ||
          String(row[key as keyof typeof row] ?? '').includes(String(val)),
        ),
      );
      const start = (Number(pageNum) - 1) * Number(pageSize);
      resolve({
        data: {
          list: filtered.slice(start, start + Number(pageSize)),
          total: filtered.length,
        },
      });
    }, 300);
  });
};

const handleAdd = () => ElMessage.success('点击了「新增」');
const handleExport = () => ElMessage.info('点击了「导出」');
const handleRefresh = () => {
  tableRef.value?.fetchData();
  ElMessage.success('已刷新');
};
const handleEdit = (row: Record<string, unknown>) => ElMessage.info(`编辑：${row.reportNo}`);
const handleCancel = (row: Record<string, unknown>) => ElMessage.warning(`作废：${row.reportNo}`);
</script>

<style scoped lang="scss">
.toolbar-box {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.action-icon {
  color: #409EFF;
  cursor: pointer;
  font-size: 16px;
  vertical-align: middle;

  & + .action-icon {
    margin-left: 8px;
  }

  &:hover {
    opacity: 0.7;
  }
}
</style>
