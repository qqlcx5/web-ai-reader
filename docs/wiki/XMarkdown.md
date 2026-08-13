# XMarkdown Markdown渲染

﻿---
title: 'XMarkdown'

## 代码示例

### basic

```vue
<docs>
---
title: 基础用法
---

使用 `MarkdownRenderer` 渲染静态 Markdown 内容，支持 GFM、任务列表、表格、代码高亮等。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `# Hello, Element Plus X 👋

这是 **加粗**、*斜体*、~~删除线~~ 和 \`行内代码\`。

## 任务列表

- [x] 已完成任务
- [ ] 待完成任务

## 表格

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| markdown | string | \`''\` | Markdown 内容 |
| is-dark | boolean | \`false\` | 深色模式 |
| enable-animate | boolean | \`false\` | 流式动画 |

## 代码块

\`\`\`typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const messages: ChatMessage[] = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help you?' },
];
\`\`\`
`;
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### bubble-list-sticky

```vue
<docs>
---
title: 搭配 BubbleList 使用粘性代码头部
---

将 `MarkdownRenderer` 放在 `BubbleList` 的 `#content` 插槽中，以 BubbleList 自身作为滚动容器。滚动列表时，代码块顶部的语言标签与操作栏会吸附到 **BubbleList 可视区域顶部**，而非页面顶部，不受文档导航栏遮挡。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

interface MessageItem {
  key: number;
  placement: 'start' | 'end';
  content: string;
  avatar: string;
}

const messages: MessageItem[] = [
  {
    key: 1,
    placement: 'end',
    avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
    content: '请给我写一段完整的 TypeScript 用户管理模块示例。'
  },
  {
    key: 2,
    placement: 'start',
    avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
    content: `好的，下面是一个完整的 TypeScript 用户管理模块示例：

\`\`\`typescript
// user.ts — 用户管理模块

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
}

const store = new Map<number, User>();
let nextId = 1;

export function createUser(dto: CreateUserDTO): User {
  const now = new Date();
  const user: User = {
    id: nextId++,
    name: dto.name,
    email: dto.email,
    role: dto.role ?? 'viewer',
    createdAt: now,
    updatedAt: now,
  };
  store.set(user.id, user);
  return user;
}

export function getUserById(id: number): User | undefined {
  return store.get(id);
}

export function updateUser(id: number, dto: UpdateUserDTO): User {
  const user = store.get(id);
  if (!user) throw new Error(\`User \${id} not found\`);
  Object.assign(user, dto, { updatedAt: new Date() });
  return user;
}

export function deleteUser(id: number): boolean {
  return store.delete(id);
}

export function listUsers(role?: UserRole): User[] {
  const all = Array.from(store.values());
  return role ? all.filter(u => u.role === role) : all;
}

// 使用示例
const alice = createUser({ name: 'Alice', email: 'alice@example.com', role: 'admin' });
const bob   = createUser({ name: 'Bob',   email: 'bob@example.com' });

console.log(listUsers());          // [alice, bob]
console.log(listUsers('admin'));   // [alice]

updateUser(bob.id, { role: 'editor' });
console.log(getUserById(bob.id));  // { ...bob, role: 'editor' }

deleteUser(alice.id);
console.log(listUsers());          // [bob]
\`\`\`

以上代码包含：类型定义、CRUD 操作、简单内存存储，可按需替换为数据库实现。`
  },
  {
    key: 3,
    placement: 'end',
    avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
    content: '再来一个 Vue 3 组合式 API 的计数器组件示例。'
  },
  {
    key: 4,
    placement: 'start',
    avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
    content: `当然，这是一个使用 Vue 3 组合式 API 的计数器组件：

\`\`\`vue
<!-- Counter.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  min?: number;
  max?: number;
  step?: number;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
});

const emit = defineEmits<{
  change: [value: number];
}>();

const count = ref(props.min);

const canDecrement = computed(() => count.value - props.step >= props.min);
const canIncrement = computed(() => count.value + props.step <= props.max);

function decrement() {
  if (canDecrement.value) {
    count.value -= props.step;
    emit('change', count.value);
  }
}

function increment() {
  if (canIncrement.value) {
    count.value += props.step;
    emit('change', count.value);
  }
}

function reset() {
  count.value = props.min;
  emit('change', count.value);
}
<\/script>

<template>
  <div class="counter">
    <button :disabled="!canDecrement" @click="decrement">－</button>
    <span class="value">{{ count }}</span>
    <button :disabled="!canIncrement" @click="increment">＋</button>
    <button class="reset" @click="reset">重置</button>
  </div>
</template>

<style scoped>
.counter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.value {
  min-width: 3ch;
  text-align: center;
  font-size: 1.2em;
  font-weight: 600;
}
button {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  cursor: pointer;
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.reset {
  font-size: 0.85em;
  color: #666;
}
</style>
\`\`\`

该组件支持 \`min\`、\`max\`、\`step\` 属性，并通过 \`change\` 事件向父组件传递最新值。`
  }
];

const rendererProps = computed(() => ({
  showCodeBlockHeader: true,
  stickyCodeBlockHeader: true,
  enableCodeLineNumber: true
}));
</script>

<template>
  <div class="bubble-sticky-demo">
    <div class="hint">
      💡 向下滚动列表，代码块顶部的语言标签将吸附到
      <strong>BubbleList 可视区顶部</strong>，而非页面顶部。
    </div>
    <div class="list-stage">
      <BubbleList :list="messages">
        <template #content="{ item }">
          <component
            :is="MarkdownRenderer"
            v-if="item.placement === 'start' && MarkdownRenderer"
            :markdown="item.content"
            v-bind="rendererProps"
          />
          <span v-else>{{ item.content }}</span>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bubble-sticky-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .hint {
    padding: 10px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ecf5ff 0%, #f0f9eb 100%);
    border: 1px solid #d9ecff;
    font-size: 13px;
    color: #409eff;

    strong {
      color: #67c23a;
    }
  }

  .list-stage {
    height: 460px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    padding: 8px 10px;
  }
}
</style>

```

### code-block-actions

```vue
<docs>
---
title: 自定义代码块操作按钮
---

通过 `code-block-actions` 传入自定义按钮数组，可在代码块头部添加任意操作，按钮的 `show` 函数可控制其显示条件。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`
`;

const lastAction = ref('');

const codeBlockActions = [
  {
    key: 'run',
    title: '运行代码',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z"/></svg>`,
    show: (props: any) =>
      ['typescript', 'ts', 'javascript', 'js'].includes(props.language),
    onClick: (props: any) => {
      lastAction.value = `运行了 ${props.language} 代码（${props.code.length} 字符）`;
    }
  },
  {
    key: 'insert',
    title: '插入到编辑器',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
    onClick: (props: any) => {
      lastAction.value = `已插入 ${props.language} 代码块到编辑器`;
    }
  }
];
</script>

<template>
  <div>
    <div
      v-if="lastAction"
      style="
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #f0f9ff;
        border-radius: 4px;
        color: #0369a1;
        font-size: 13px;
      "
    >
      操作记录：{{ lastAction }}
    </div>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="content"
      :code-block-actions="codeBlockActions"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### code-block-config

```vue
<docs>
---
title: 代码块配置
---

支持配置是否显示头部、最大高度、粘性头部等代码块相关选项。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `\`\`\`typescript
// 一个较长的代码块，用于演示最大高度和行号效果
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

function createUser(data: Partial<User>): User {
  return {
    id: Math.floor(Math.random() * 10000),
    name: data.name ?? 'Anonymous',
    email: data.email ?? '',
    role: data.role ?? 'user',
    createdAt: new Date(),
  };
}

const user = createUser({ name: 'Alice', email: 'alice@example.com' });
console.log(user);
\`\`\``;

const showHeader = ref(true);
const stickyHeader = ref(false);
const codeMaxHeight = ref('200px');
const enableLineNumber = ref(true);

const rendererProps = computed(() => ({
  markdown: content,
  showCodeBlockHeader: showHeader.value,
  stickyCodeBlockHeader: stickyHeader.value,
  codeMaxHeight: codeMaxHeight.value,
  enableCodeLineNumber: enableLineNumber.value
}));
</script>

<template>
  <div>
    <div
      style="
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 12px;
        align-items: center;
      "
    >
      <el-checkbox v-model="showHeader"> 显示头部 </el-checkbox>
      <el-checkbox v-model="stickyHeader">
        粘性头部（页面滚动时固定）
      </el-checkbox>
      <el-checkbox v-model="enableLineNumber"> 显示行号 </el-checkbox>
      <span>
        最大高度：
        <el-input v-model="codeMaxHeight" size="small" style="width: 100px" />
      </span>
    </div>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      v-bind="rendererProps"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### code-x-render

```vue
<docs>
---
title: 自定义代码块渲染器
---

通过 `code-x-render` 对特定语言的代码块进行完全自定义渲染，适用于 JSON 可视化、图表渲染等场景。
</docs>

<script setup lang="ts">
import { h } from 'vue';
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `以下 JSON 块将使用自定义渲染器展示：

\`\`\`json
{
  "name": "element-plus-x",
  "version": "2.0.0",
  "description": "Vue 3 AI 组件库",
  "keywords": ["vue", "ai", "markdown", "chat"],
  "dependencies": {
    "x-markdown-vue": "^1.0.0"
  }
}
\`\`\`

普通代码块不受影响：

\`\`\`typescript
console.log('Hello World');
\`\`\`
`;

const codeXRender = {
  json: (props: any) => {
    try {
      const formatted = JSON.stringify(JSON.parse(props.raw.content), null, 2);
      return h(
        'div',
        {
          style: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            overflow: 'auto',
            color: '#a8ff78',
            border: '1px solid #2d2d5e'
          }
        },
        [
          h(
            'div',
            { style: 'color: #888; margin-bottom: 8px; font-size: 11px;' },
            '📋 JSON 查看器'
          ),
          h('pre', { style: 'margin: 0; white-space: pre-wrap;' }, formatted)
        ]
      );
    } catch {
      return null;
    }
  }
};
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :code-x-render="codeXRender"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### custom-attrs

```vue
<docs>
---
title: 自定义属性
---

通过 `custom-attrs` 为特定 Markdown 元素添加 HTML 属性，如为链接添加 `target="_blank"`、为标题添加自定义 class 等。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `# 一级标题（蓝色）

## 二级标题（绿色）

这是一个 [外部链接](https://github.com/element-plus-x/x-markdown)，会在新窗口打开。

![示例图片](https://picsum.photos/seed/elx/400/160)
`;

const customAttrs = {
  heading: (_node: any, { level }: { level: number }) => ({
    style:
      level === 1
        ? 'color: #409eff;'
        : level === 2
          ? 'color: #67c23a;'
          : undefined,
    class: `custom-heading-${level}`
  }),
  a: () => ({
    target: '_blank',
    rel: 'noopener noreferrer'
  }),
  img: () => ({
    loading: 'lazy',
    style: 'max-width: 100%; border-radius: 8px;'
  })
};
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :custom-attrs="customAttrs"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### custom-code-components

```vue
<docs>
---
title: 自定义代码块组件（el-table & my-echarts）
---

通过 `code-x-render` 将特定语言的代码块渲染为 Vue 组件。本示例中：

- **`el-table`** 语言块 — 将 JSON 数据渲染为 Element Plus 表格
- **`my-echarts`** 语言块 — 将 ECharts JSON 配置渲染为交互式图表
</docs>

<script setup lang="ts">
import { ElTable, ElTableColumn } from 'element-plus';
import {
  defineComponent,
  h,
  computed as vComputed,
  onMounted as vOnMounted,
  ref as vRef
} from 'vue';
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `## 使用 \`el-table\` 展示员工数据

在代码块中写入 JSON，语言设为 \`el-table\`，自动渲染为 Element Plus 表格：

\`\`\`el-table
{
  "columns": ["姓名", "职位", "部门", "入职年份", "状态"],
  "rows": [
    { "姓名": "张三", "职位": "前端工程师", "部门": "研发部", "入职年份": "2021", "状态": "在职" },
    { "姓名": "李四", "职位": "产品经理", "部门": "产品部", "入职年份": "2020", "状态": "在职" },
    { "姓名": "王五", "职位": "UI 设计师", "部门": "设计部", "入职年份": "2022", "状态": "在职" },
    { "姓名": "赵六", "职位": "后端工程师", "部门": "研发部", "入职年份": "2019", "状态": "在职" },
    { "姓名": "陈七", "职位": "测试工程师", "部门": "测试部", "入职年份": "2023", "状态": "试用" }
  ]
}
\`\`\`

## 使用 \`my-echarts\` 展示图表

在代码块中写入 ECharts option JSON，语言设为 \`my-echarts\`，自动渲染为交互式图表：

\`\`\`my-echarts
{
  "title": { "text": "各部门人员分布", "left": "center" },
  "tooltip": { "trigger": "item", "formatter": "{b}: {c} 人 ({d}%)" },
  "legend": { "bottom": "5%" },
  "series": [{
    "type": "pie",
    "radius": ["40%", "70%"],
    "avoidLabelOverlap": true,
    "itemStyle": { "borderRadius": 8, "borderWidth": 2 },
    "label": { "show": true },
    "data": [
      { "value": 45, "name": "研发部" },
      { "value": 20, "name": "产品部" },
      { "value": 15, "name": "设计部" },
      { "value": 12, "name": "测试部" },
      { "value": 8,  "name": "市场部" }
    ]
  }]
}
\`\`\`
`;

// ─── el-table 组件 ───────────────────────────────────────────────────────────
const ElTableBlock = defineComponent({
  name: 'ElTableBlock',
  props: {
    rawJson: { type: String, required: true }
  },
  setup(props) {
    const parsed = vComputed(() => {
      try {
        const v = JSON.parse(props.rawJson);
        return {
          columns: Array.isArray(v.columns) ? v.columns : [],
          rows: Array.isArray(v.rows) ? v.rows : []
        };
      } catch {
        return { columns: [] as string[], rows: [] as any[] };
      }
    });
    return () =>
      h('div', { style: 'margin:16px 0;' }, [
        h(
          ElTable as any,
          {
            data: parsed.value.rows,
            border: true,
            stripe: true,
            style: { width: '100%' },
            size: 'small'
          },
          {
            default: () =>
              parsed.value.columns.map((col: string) =>
                h(ElTableColumn as any, {
                  key: col,
                  prop: col,
                  label: col,
                  minWidth: 100
                })
              )
          }
        )
      ]);
  }
});

// ─── ECharts 组件 ────────────────────────────────────────────────────────────
const MyEchartsBlock = defineComponent({
  name: 'MyEchartsBlock',
  props: {
    option: { type: Object, required: true }
  },
  setup(props) {
    const chartEl = vRef<HTMLDivElement>();

    vOnMounted(async () => {
      if (!chartEl.value) return;
      try {
        const echarts = await import('echarts');
        const chart = echarts.init(chartEl.value);
        chart.setOption(props.option);
        // 响应式宽度
        const ro = new ResizeObserver(() => chart.resize());
        ro.observe(chartEl.value);
      } catch (e) {
        console.warn('[my-echarts] echarts init failed', e);
      }
    });

    return () =>
      h('div', {
        ref: chartEl,
        style: 'width:100%;height:320px;margin:16px 0;'
      });
  }
});

// ─── codeXRender 映射 ────────────────────────────────────────────────────────
const codeXRender = {
  'el-table': (props: any) => h(ElTableBlock, { rawJson: props.raw.content }),

  'my-echarts': (props: any) => {
    try {
      const option = JSON.parse(props.raw.content);
      return h(MyEchartsBlock, { option });
    } catch {
      return h(
        'div',
        {
          style:
            'color:#f56c6c;padding:8px;border:1px dashed #f56c6c;border-radius:4px;'
        },
        '⚠ 图表 JSON 解析失败，请检查语法'
      );
    }
  }
};
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :code-x-render="codeXRender"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### custom-slots

```vue
<docs>
---
title: 自定义插槽
---

通过具名插槽自定义特定 Markdown 元素的渲染方式，可完全控制 HTML 输出结构和样式。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `# 自定义标题插槽

## 二级标题

> 这是一段引用文字，将使用自定义引用块渲染，带有图标和渐变背景。

访问 [Element Plus X](https://github.com/element-plus-x) 了解更多。
`;
</script>

<template>
  <component :is="MarkdownRenderer" v-if="MarkdownRenderer" :markdown="content">
    <!-- 自定义标题：左侧彩色边框 -->
    <template #heading="{ level, children }">
      <component
        :is="`h${level}`"
        :style="{
          borderLeft: level === 1 ? '4px solid #409eff' : '3px solid #67c23a',
          paddingLeft: '12px',
          margin: '16px 0 8px'
        }"
      >
        <component :is="children" />
      </component>
    </template>

    <!-- 自定义引用块：渐变背景 + 图标 -->
    <template #blockquote="{ children }">
      <blockquote
        style="
          background: linear-gradient(135deg, #e8f4ff, #f0f8ff);
          border-left: 4px solid #409eff;
          border-radius: 0 8px 8px 0;
          padding: 12px 16px;
          margin: 8px 0;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        "
      >
        <span>💡</span>
        <div><component :is="children" /></div>
      </blockquote>
    </template>

    <!-- 自定义链接：新窗口 + 外链图标 -->
    <template #a="{ node, children }">
      <a
        :href="node?.properties?.href"
        target="_blank"
        rel="noopener noreferrer"
        style="
          color: #409eff;
          text-decoration: none;
          border-bottom: 1px dashed #409eff;
        "
      >
        <component :is="children" />↗
      </a>
    </template>
  </component>
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### custom-streaming-blocks

```vue
<docs>
---
title: 流式自定义代码块（骨架屏占位）
---

模拟 AI 流式输出的真实场景：当 \`el-table\` / \`el-form\` / \`my-echarts\` 代码块的 JSON 还在拼接中时，用 **el-skeleton 骨架屏** 占位；一旦 JSON 完整可解析，立刻切换为对应的真实组件回显。

判定方式：在 `code-x-render` 里尝试 `JSON.parse(props.raw.content)`，**解析失败 → 骨架屏；解析成功 → 真实组件**，配合流式更新自然呈现"骨架屏 → 内容"的过渡。
</docs>

<script setup lang="ts">
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSkeleton,
  ElTable,
  ElTableColumn
} from 'element-plus';
import { defineComponent, h, onMounted as vOnMounted, ref as vRef } from 'vue';
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const fullText = `## 流式输出示例

下面三个代码块会随着流式拼接，先显示骨架屏，等 JSON 完整后切换为真实组件：

\`\`\`el-table
{
  "columns": ["姓名", "职位", "部门"],
  "rows": [
    { "姓名": "张三", "职位": "前端工程师", "部门": "研发部" },
    { "姓名": "李四", "职位": "产品经理", "部门": "产品部" },
    { "姓名": "王五", "职位": "UI 设计师", "部门": "设计部" }
  ]
}
\`\`\`

\`\`\`el-form
{
  "fields": [
    { "label": "姓名", "value": "张三" },
    { "label": "邮箱", "value": "zhangsan@example.com" },
    { "label": "部门", "value": "研发部" }
  ]
}
\`\`\`

\`\`\`my-echarts
{
  "title": { "text": "季度销售额", "left": "center" },
  "tooltip": {},
  "xAxis": { "type": "category", "data": ["Q1","Q2","Q3","Q4"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "bar", "data": [120, 200, 150, 320], "itemStyle": { "borderRadius": 6 } }]
}
\`\`\`
`;

const streamContent = ref('');
let intervalId: ReturnType<typeof setInterval> | null = null;
const isStreaming = ref(false);

function startStream() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  streamContent.value = '';
  isStreaming.value = true;
  let index = 0;
  intervalId = setInterval(() => {
    if (index < fullText.length) {
      // 一次推进若干字符，让流式更顺滑
      const step = 4;
      streamContent.value += fullText.slice(index, index + step);
      index += step;
    } else {
      clearInterval(intervalId!);
      intervalId = null;
      isStreaming.value = false;
    }
  }, 40);
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

// ─── 真实组件 ────────────────────────────────────────────────────────────────
const ElTableBlock = defineComponent({
  name: 'ElTableBlock',
  props: { data: { type: Object, required: true } },
  setup(props) {
    return () =>
      h('div', { style: 'margin:16px 0;' }, [
        h(
          ElTable as any,
          {
            data: props.data.rows ?? [],
            border: true,
            stripe: true,
            style: { width: '100%' },
            size: 'small'
          },
          {
            default: () =>
              (props.data.columns ?? []).map((col: string) =>
                h(ElTableColumn as any, {
                  key: col,
                  prop: col,
                  label: col,
                  minWidth: 100
                })
              )
          }
        )
      ]);
  }
});

const ElFormBlock = defineComponent({
  name: 'ElFormBlock',
  props: { data: { type: Object, required: true } },
  setup(props) {
    return () =>
      h(
        'div',
        {
          style:
            'margin:16px 0;padding:12px;border:1px solid #ebeef5;border-radius:6px;'
        },
        [
          h(
            ElForm as any,
            { labelWidth: '80px', size: 'small' },
            {
              default: () =>
                (props.data.fields ?? []).map((f: any, i: number) =>
                  h(
                    ElFormItem as any,
                    { key: i, label: f.label },
                    {
                      default: () =>
                        h(ElInput as any, {
                          modelValue: f.value,
                          'onUpdate:modelValue': () => {}
                        })
                    }
                  )
                )
            }
          )
        ]
      );
  }
});

const MyEchartsBlock = defineComponent({
  name: 'MyEchartsBlock',
  props: { option: { type: Object, required: true } },
  setup(props) {
    const chartEl = vRef<HTMLDivElement>();
    vOnMounted(async () => {
      if (!chartEl.value) return;
      try {
        const echarts = await import('echarts');
        const chart = echarts.init(chartEl.value);
        chart.setOption(props.option);
        const ro = new ResizeObserver(() => chart.resize());
        ro.observe(chartEl.value);
      } catch (e) {
        console.warn('[my-echarts] init failed', e);
      }
    });
    return () =>
      h('div', {
        ref: chartEl,
        style: 'width:100%;height:300px;margin:16px 0;'
      });
  }
});

// ─── 骨架屏占位 ─────────────────────────────────────────────────────────────
function skeletonOf(kind: 'el-table' | 'el-form' | 'my-echarts') {
  const rows = kind === 'my-echarts' ? 6 : 4;
  return h(
    'div',
    {
      style:
        'margin:16px 0;padding:12px;border:1px dashed #dcdfe6;border-radius:6px;background:#fafafa;'
    },
    [
      h(
        'div',
        { style: 'font-size:12px;color:#909399;margin-bottom:8px;' },
        `⏳ ${kind} 数据流式加载中…`
      ),
      h(ElSkeleton as any, { rows, animated: true })
    ]
  );
}

// ─── codeXRender：解析失败 → 骨架屏；成功 → 真实组件 ─────────────────────────
function safeParse(s: string): { ok: true; value: any } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch {
    return { ok: false };
  }
}

const codeXRender = {
  'el-table': (props: any) => {
    const r = safeParse(props.raw.content);
    return r.ok ? h(ElTableBlock, { data: r.value }) : skeletonOf('el-table');
  },
  'el-form': (props: any) => {
    const r = safeParse(props.raw.content);
    return r.ok ? h(ElFormBlock, { data: r.value }) : skeletonOf('el-form');
  },
  'my-echarts': (props: any) => {
    const r = safeParse(props.raw.content);
    return r.ok
      ? h(MyEchartsBlock, { option: r.value })
      : skeletonOf('my-echarts');
  }
};
</script>

<template>
  <div>
    <el-button
      type="primary"
      :loading="isStreaming"
      style="margin-bottom: 12px"
      @click="startStream"
    >
      {{ isStreaming ? '流式输出中...' : '开始流式输出' }}
    </el-button>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="streamContent"
      :code-x-render="codeXRender"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### custom-table

```vue
<docs>
---
title: 自定义表格（el-table 插槽）
---

通过 `#table` 插槽拦截 Markdown 中的 GFM 表格。插槽暴露 `children`（一个返回 VNode 数组的函数），递归读取 `<thead>` / `<tbody>` 即可拿到列与行，再用 `el-table` 渲染获得边框、条纹等能力。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `## 前端框架对比

| 框架 | 最新版本 | GitHub Stars | 学习曲线 | TypeScript |
|------|----------|-------------|----------|-----------|
| Vue | 3.4 | 48k | 低 | ✅ |
| React | 18.3 | 225k | 中 | ✅ |
| Angular | 17 | 93k | 高 | ✅ |
| Svelte | 5.0 | 78k | 低 | ✅ |

## 组件库对比

| 组件库 | 所属框架 | 主题定制 | 企业级支持 | 国际化 |
|--------|----------|----------|----------|--------|
| Element Plus | Vue 3 | ✅ | ✅ | ✅ |
| Ant Design | React | ✅ | ✅ | ✅ |
| Vuetify | Vue 3 | ✅ | ✅ | ✅ |
| Naive UI | Vue 3 | ✅ | ❌ | ✅ |
`;

// 递归从 VNode 子树提取纯文本
function vnodeText(vn: any): string {
  if (vn == null || vn === false || vn === true) return '';
  if (typeof vn === 'string' || typeof vn === 'number') return String(vn);
  if (Array.isArray(vn)) return vn.map(vnodeText).join('');
  if (typeof vn === 'object' && 'children' in vn)
    return vnodeText((vn as any).children);
  return '';
}

function findByTag(children: any, tag: string): any[] {
  if (!children) return [];
  const list = Array.isArray(children) ? children : [children];
  return list.filter(
    c => c && typeof c === 'object' && (c as any).type === tag
  );
}

function extractTableData(children: any) {
  const columns: string[] = [];
  const rows: Record<string, string>[] = [];
  const top = Array.isArray(children) ? children : [children];

  for (const section of top) {
    if (!section || typeof section !== 'object') continue;
    if ((section as any).type === 'thead') {
      const tr = findByTag((section as any).children, 'tr')[0];
      const ths = findByTag(tr?.children, 'th');
      for (const th of ths) columns.push(vnodeText(th.children));
    } else if ((section as any).type === 'tbody') {
      const trs = findByTag((section as any).children, 'tr');
      for (const tr of trs) {
        const tds = findByTag(tr.children, 'td');
        const row: Record<string, string> = {};
        tds.forEach((td, i) => {
          row[columns[i] ?? String(i)] = vnodeText(td.children);
        });
        rows.push(row);
      }
    }
  }
  return { columns, rows };
}
</script>

<template>
  <component :is="MarkdownRenderer" v-if="MarkdownRenderer" :markdown="content">
    <!-- 用 el-table 替换所有 Markdown 表格 -->
    <template #table="{ children }">
      <div style="margin: 16px 0">
        <template v-if="children">
          <el-table
            :data="extractTableData(children()).rows"
            border
            stripe
            style="width: 100%"
            size="small"
          >
            <el-table-column
              v-for="col in extractTableData(children()).columns"
              :key="col"
              :prop="col"
              :label="col"
              min-width="100"
            />
          </el-table>
        </template>
      </div>
    </template>
  </component>
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### dark-mode

```vue
<docs>
---
title: 深色模式
---

通过 `is-dark` prop 切换深浅色主题，代码块语法高亮主题也会随之自动切换。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const isDark = ref(false);

const content = `# 深色模式示例

这是一段带有代码块的内容：

\`\`\`typescript
const isDark: boolean = true;
const theme = isDark ? 'vitesse-dark' : 'vitesse-light';
console.log(\`当前高亮主题：\${theme}\`);
\`\`\`

> 深色模式下，代码高亮主题也会自动切换为深色风格。
`;
</script>

<template>
  <div>
    <el-switch
      v-model="isDark"
      active-text="深色"
      inactive-text="浅色"
      style="margin-bottom: 12px"
    />
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="content"
      :is-dark="isDark"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### latex

```vue
<docs>
---
title: LaTeX 数学公式
---

通过 `enable-latex` 启用数学公式渲染，需安装 `katex` 并引入其样式文件。
</docs>

<script setup lang="ts">
import 'katex/dist/katex.min.css';
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `### 行内公式

欧拉公式：$e^{i\\pi} + 1 = 0$

二次方程：$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

向量点积：$\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y + a_z b_z$

### 块级公式

傅里叶变换：

$$
F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt
$$

矩阵乘法：

$$
\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\cdot \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} ax+by \\\\ cx+dy \\end{bmatrix}
$$

Boxed 公式：

$$\\boxed{E = mc^2}$$
`;
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :enable-latex="true"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### mermaid-actions

```vue
<docs>
---
title: 自定义 Mermaid 操作按钮
---

通过 `mermaid-actions` 传入自定义按钮数组，可在 Mermaid 图表工具栏添加自定义操作。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `\`\`\`mermaid
graph LR
    A[客户端] --> B[负载均衡]
    B --> C[服务A]
    B --> D[服务B]
    C --> E[(数据库)]
    D --> E
\`\`\`
`;

const lastAction = ref('');

const mermaidActions = [
  {
    key: 'share',
    title: '分享图表',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>`,
    onClick: (props: any) => {
      lastAction.value = `分享图表，SVG 长度：${props.svg.length} 字符`;
    }
  },
  {
    key: 'edit-online',
    title: '在线编辑',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    show: (props: any) => !props.showSourceCode,
    onClick: (props: any) => {
      lastAction.value = `打开编辑器，原始内容：${props.rawContent.substring(0, 40)}...`;
    }
  }
];
</script>

<template>
  <div>
    <div
      v-if="lastAction"
      style="
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #f0f9ff;
        border-radius: 4px;
        color: #0369a1;
        font-size: 13px;
      "
    >
      操作记录：{{ lastAction }}
    </div>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="content"
      :mermaid-actions="mermaidActions"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### mermaid

```vue
<docs>
---
title: Mermaid 图表
---

开启 `enable-mermaid` 后可渲染流程图、时序图等，需安装 `mermaid`。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `\`\`\`mermaid
graph TD
    A[开始] --> B{已登录?}
    B -->|是| C[进入首页]
    B -->|否| D[跳转登录页]
    D --> E[输入凭据]
    E --> F{验证通过?}
    F -->|是| C
    F -->|否| G[提示错误]
    G --> D
\`\`\`

\`\`\`mermaid
sequenceDiagram
    用户->>前端: 点击发送
    前端->>服务端: POST /api/chat
    服务端-->>前端: 流式响应 (SSE)
    前端-->>用户: 实时渲染 Markdown
\`\`\`
`;
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :enable-mermaid="true"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### streaming

```vue
<docs>
---
title: 流式渲染动画
---

开启 `enable-animate` 后，新增内容将以逐字淡入动画效果呈现，非常适合 AI 流式输出场景。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const fullText = `# AI 助手回复

正在流式输出 Markdown 内容...

- 支持 **加粗** 和 *斜体*
- 支持 \`行内代码\`
- 支持任务列表

- [x] 已完成的步骤
- [ ] 待处理的任务

\`\`\`typescript
const greeting: string = 'Hello World';
console.log(greeting);
\`\`\`
`;

const streamContent = ref('');
let intervalId: ReturnType<typeof setInterval> | null = null;
const isStreaming = ref(false);

function startStream() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  streamContent.value = '';
  isStreaming.value = true;
  let index = 0;
  intervalId = setInterval(() => {
    if (index < fullText.length) {
      streamContent.value += fullText[index++];
    } else {
      clearInterval(intervalId!);
      intervalId = null;
      isStreaming.value = false;
    }
  }, 30);
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div>
    <el-button
      type="primary"
      :loading="isStreaming"
      style="margin-bottom: 12px"
      @click="startStream"
    >
      {{ isStreaming ? '输出中...' : '开始流式输出' }}
    </el-button>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="streamContent"
      :enable-animate="true"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

## API 参考


---

