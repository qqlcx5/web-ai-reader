<template>
  <div style="padding: 24px; background: #F3F4F6; min-height: 100vh;">
    <!-- 增加一点外层灰色背景，更能衬托表格的纯洁感 -->
    <ModernErpTable
      ref="tableRef"
      :requestApi="fetchMockData"
      :columns="tableColumns"
    >
      <!-- 工具栏：现代按钮组 -->
      <template #toolbar>
        <div class="modern-toolbar">
          <button class="modern-btn primary" @click="handleAdd">
            <i class="i-tabler-plus"></i>新建报告
          </button>
          <button class="modern-btn" @click="handleExport">
            <i class="i-tabler-download"></i>导出
          </button>
          <button class="modern-btn" @click="handleRefresh">
            <i class="i-tabler-refresh"></i>刷新
          </button>
        </div>
      </template>

      <!-- 【精美的图标操作列】使用 Tabler 替换 Element Icon -->
      <template #action="{ row }">
        <div class="action-group">
          <!-- 悬停变蓝的编辑 -->
          <button class="action-btn edit-btn" title="编辑" @click="handleEdit(row)">
            <i class="i-tabler-pencil"></i>
          </button>
          <!-- 悬停变红的删除/作废 -->
          <button class="action-btn delete-btn" title="作废" @click="handleCancel(row)">
            <i class="i-tabler-circle-x"></i>
          </button>
        </div>
      </template>

      <!-- 链接态：去除土气的下划线，使用品牌蓝 + hover加深 -->
      <template #reportNo="{ row }">
        <span class="modern-link" @click="handleEdit(row)">{{ row.reportNo }}</span>
      </template>
      <template #taskNo="{ row }">
        <span class="modern-link" @click="handleEdit(row)">{{ row.taskNo }}</span>
      </template>

      <!-- 品牌列：彩色徽标 -->
      <template #brand="{ row }">
        <span v-if="row.brand" class="brand-badge">{{ row.brand }}</span>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 数字量级右对齐（在 columns 配置了 align: 'right'）-->
    </ModernErpTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import ModernErpTable from '@/components/ModernProTable.vue';
import type { ProTableColumn, ProTableResponse } from '@/components/proTable';

const tableRef = ref<InstanceType<typeof ModernErpTable>>();

// Columns 结构没有变，但是配置更加考究
const tableColumns: ProTableColumn[] = [
  { type: 'index', width: '50', align: 'center' },
  { type: 'selection', width: '50', align: 'center' },
  { label: '操作', prop: 'action', width: '90', align: 'center' }, // 操作列放前放后视业务重要性定
  { label: '报告编号', prop: 'reportNo', width: '150', search: { type: 'input' } },
  { label: '试穿任务编号', prop: 'taskNo', width: '150', search: { type: 'input' } },
  // 下拉搜索示例
  {
    label: '品牌', prop: 'brand', width: '150',
    search: {
      type: 'select',
      options: [
        { label: '安踏成人-大货', value: '安踏成人-大货' },
        { label: '安踏儿童', value: '安踏儿童' },
        { label: 'FILA', value: 'FILA' },
      ],
    },
  },
  { label: '货号', prop: 'itemNo', width: '110', search: { type: 'input' } },
  { label: '开发供应商', prop: 'supplier', width: '130', search: { type: 'input' } },
  {
    label: '季度', prop: 'season', width: '110',
    search: {
      type: 'select',
      options: [
        { label: '17Q1', value: '17Q1' },
        { label: '17Q2', value: '17Q2' },
        { label: '18Q1', value: '18Q1' },
      ],
    },
  },
  // 【设计细节】：数字或与金额相关的一律右对齐，符合人类潜意识对齐小数点/位数的直觉
  { label: '数量', prop: 'quantity', width: '110', align: 'right', search: { type: 'input' } },
  { label: '尺码', prop: 'size', minWidth: '120', search: { type: 'input' } },
];

// 模拟数据源：45 条数据，方便演示分页
const brands = ['安踏成人-大货', '安踏儿童', 'FILA'];
const seasons = ['17Q1', '17Q2', '18Q1'];
const allRows = Array.from({ length: 45 }, (_, i) => ({
  reportNo: `SCN2603110${String(i + 1).padStart(2, '0')}`,
  taskNo: `TSK2603110${String(i + 1).padStart(2, '0')}`,
  quantity: (i % 9) + 1,
  size: '1,11,2,4,6',
  itemNo: i % 5 === 0 ? '' : String(100 + i),
  brand: i % 7 === 0 ? '' : brands[i % brands.length],
  supplier: i % 2 === 0 ? '泉州安大' : '乐骏',
  season: seasons[i % seasons.length],
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

const handleAdd = () => ElMessage.success('点击了「新建报告」');
const handleExport = () => ElMessage.info('点击了「导出」');
const handleRefresh = () => {
  tableRef.value?.fetchData();
  ElMessage.success('已刷新');
};
const handleEdit = (row: Record<string, unknown>) => ElMessage.info(`编辑：${row.reportNo}`);
const handleCancel = (row: Record<string, unknown>) => ElMessage.warning(`作废：${row.reportNo}`);
</script>

<style scoped>
/* 业务层的微交互样式 */
.modern-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
}

.modern-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  color: #475569;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.modern-btn:hover { border-color: #CBD5E1; background: #F8FAFC; }
.modern-btn.primary {
  color: #fff;
  background: #3B82F6;
  border-color: #3B82F6;
}
.modern-btn.primary:hover { background: #2563EB; }

.action-group {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #94A3B8; /* 常态冷灰色 */
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.action-btn i { font-size: 18px; }

/* 悬停时赋予灵魂色彩与微底色 */
.edit-btn:hover { color: #3B82F6; background: #EFF6FF; }
.delete-btn:hover { color: #EF4444; background: #FEF2F2; }

.modern-link {
  color: #2563EB;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}
.modern-link:hover {
  color: #1D4ED8;
  text-decoration: underline; /* 仅在 hover 时出现下划线 */
}

.brand-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: #1D4ED8;
  background: #EFF6FF;
  border-radius: 9999px;
}

.text-muted { color: #94A3B8; }
</style>
