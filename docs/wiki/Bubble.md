# Bubble 对话气泡

`2.0.0 版本` 移除了内置的 Typewriter 打字器组件。如需 Markdown 渲染功能，请使用 [x-markdown-vue](https://www.npmjs.com/package/x-markdown-vue)

## 介绍

`Bubble` 是一个对话气泡组件，常用于聊天的时候。它可以展示对话内容，支持自定义头像、头部、内容、底部，并且具备加载状态展示。

### 基本使用

## 代码示例

### avatar-and-placement

```vue
<docs>
---
title: 支持位置和头像，以及间距设置
---

通过 `#avatar` 设置自定义头像。通过 `placement` 属性设置位置，提供了 `start`、`end` 两个选项值。

::: tip
😸 内置 `element-plus` `el-avatar` 组件。但是为避免属性名重复，例如：`el-avatar` 和 `Bubble` 的 `shape` 属性。你需要用以下属性设置

1. 属性
- `avatar` 设置头像占位图片
- `avatar-size` 设置头像占位大小 👉这个属性在 `el-avatar组件` 是 `number类型`，这里注意在此组件上是 `string类型` 以更好自定义样式属性😊
- `avatar-gap` 设置头像和气泡之间的距离
- `avatar-shape` 设置头像形状
- `avatar-icon` 设置头像占位图标
- `avatar-src-set` 设置头像图片 srcset 属性
- `avatar-alt` 设置头像图片的 alt  属性
- `avatar-fit` 设置头像占位图片的填充模式
2. 事件
- `@avatar-error` 当头像加载失败时触发。
:::
</docs>

<script setup lang="ts">
const avatarAI =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
const avatarUser = 'https://avatars.githubusercontent.com/u/76239030?v=4';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <!-- Avatar and Placement 左侧 -->
    <Bubble
      content="Good morning, how are you?"
      placement="start"
      :avatar="avatarAI"
      avatar-size="48px"
    />

    <!-- avatar-size 设置头像占位空间 -->
    <Bubble
      content="What a beautiful day!"
      placement="start"
      avatar-size="48px"
    />

    <!-- Avatar and Placement 右侧 -->
    <Bubble content="Hi, good morning, I'm fine!" placement="end">
      <template #avatar>
        <el-avatar :size="32" :src="avatarUser" />
      </template>
    </Bubble>

    <!-- avatar-gap 属性控制 气泡与头像的距离 -->
    <Bubble
      content="Hi, good morning, I'm fine! Thank you!"
      placement="end"
      avatar-size="0px"
      avatar-gap="0px"
    />
  </div>
</template>

```

### content-customize

```vue
<docs>
---
title: 自定义 气泡内容
---

通过 `#content` 插槽，自定义气泡内容。

::: info
`#content` 插槽 优先级更高，`content` 属性将失效。 `no-padding` 属性可以禁用气泡内容内边距。
:::
</docs>

<script setup lang="ts">
const avatarSize = '48px';
const avatarAI =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Bubble
      content="欢迎使用 element-plus-x。"
      typing
      :avatar="avatarAI"
      :avatar-size="avatarSize"
      no-style
    >
      <template #content>
        <div class="content-container">
          😊 欢迎使用 element-plus-x，我是自定义气泡
        </div>
      </template>
    </Bubble>

    <Bubble :avatar-size="avatarSize" typing no-style variant="borderless">
      <template #header>
        <div class="content-container-header">
          推荐内容 自定义气泡
        </div>
      </template>
      <template #content>
        <div class="content-borderless-container">
          🥤 长时间工作后如何有效休息？
        </div>
      </template>
    </Bubble>

    <Bubble :avatar-size="avatarSize" typing no-style variant="borderless">
      <template #content>
        <div class="content-borderless-container">
          💌 保持积极心态的秘诀是什么？
        </div>
      </template>
    </Bubble>

    <Bubble :avatar-size="avatarSize" typing no-style variant="borderless">
      <template #content>
        <div class="content-borderless-container">
          🔥 如何在巨大的压力下保持冷静？
        </div>
      </template>
    </Bubble>
  </div>
</template>

<style scoped>
.content-container {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.content-container-header {
  font-size: 12px;
  color: #909399;
}

.content-borderless-container {
  user-select: none;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #ebeef5;
  }
}
</style>

```

### content

```vue
<docs>
---
title: 基础用法。
---

最简化的集成方式。
</docs>

<script setup lang="ts">
const content = ref('hello world !');
</script>

<template>
  <Bubble :content="content" />
</template>

```

### header-and-footer

```vue
<docs>
---
title: 支持自定义气泡 头部、底部 内容
---

通过 `#header` 和 `#footer` 插槽 来自定义气泡的头部和底部。
</docs>

<script setup lang="ts">
import { DocumentCopy, Refresh, Search, Star } from '@element-plus/icons-vue';

const content = ref(
  '嗨！你好，欢迎使用 Element Plus X，有什么问题，可以问我哦~'
);
const avatarAI =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
</script>

<template>
  <Bubble :content="content">
    <template #avatar>
      <el-avatar :src="avatarAI" />
    </template>
    <template #header>
      <span>Element Plus X</span>
    </template>
    <template #footer>
      <div class="footer-container">
        <el-button type="info" :icon="Refresh" size="small" circle />
        <el-button type="success" :icon="Search" size="small" circle />
        <el-button type="warning" :icon="Star" size="small" circle />
        <el-button color="#626aef" :icon="DocumentCopy" size="small" circle />
      </div>
    </template>
  </Bubble>
</template>

<style scoped lang="less">
.footer-container {
  :deep(.el-button + .el-button) {
    margin-left: 8px;
  }
}
</style>

```

### loading

```vue
<docs>
---
title: 加载中状态
---

通过 `loading` 属性设置加载中状态。支持通过 `#loading` 插槽自定义加载中状态内容展示。

::: info
`#loading` 插槽 优先级更高，内置的加载中样式将失效。但 `loading` 属性任然可以控制 加载中状态。
:::
</docs>

<script setup lang="ts">
const loading = ref(true);
const content = ref('hello world !');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 10px">
    <Bubble :content="content" :loading="loading" />

    <Bubble :content="content" :loading="loading">
      <template #loading>
        <div>loading...</div>
      </template>
    </Bubble>

    <Bubble :content="content" :loading="loading">
      <template #loading>
        <div>感谢使用 Element-Plus-X 🌹 请稍后...</div>
      </template>
    </Bubble>

    <div style="display: flex; align-items: center">
      <span>状态：</span>
      <el-switch v-model="loading" />
    </div>
  </div>
</template>

```

### theme-overrides

```vue
<docs>
---
title: 自定义主题
---

通过 `ConfigProvider.themeOverrides` 覆盖 `Bubble` 的主题变量（背景、边框、圆角、padding、宽度等），开关前后会有明显反差。
</docs>

<script setup lang="ts">
import { computed, ref } from 'vue';

const enabled = ref(true);

const themeOverrides = computed(() => {
  if (!enabled.value) return {};
  return {
    common: {
      'color-primary': '#8b5cf6',
      'border-color': 'rgba(139, 92, 246, 0.35)',
      'fill-color': 'rgba(139, 92, 246, 0.10)',
      'text-color-primary': 'rgba(15, 23, 42, 0.92)',
      'box-shadow': '0 18px 54px rgba(139, 92, 246, 0.22)'
    },
    components: {
      Bubble: {
        'bubble-content-max-width': '420px',
        'bubble-bg':
          'linear-gradient(135deg, rgba(139, 92, 246, 0.16), rgba(59, 130, 246, 0.10))',
        'bubble-border-color': 'rgba(139, 92, 246, 0.32)',
        'bubble-text-color': 'rgba(15, 23, 42, 0.86)',
        'bubble-radius': '18px',
        'bubble-padding-y': '14px',
        'bubble-padding-x': '18px',
        'bubble-shadow': '0 18px 52px rgba(139, 92, 246, 0.18)',
        'bubble-dot-color': '#8b5cf6'
      }
    }
  };
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div>开启覆写后，气泡内容最大宽度会变窄。</div>
      <button
        type="button"
        style="
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(0, 0, 0, 0.02);
          cursor: pointer;
        "
        @click="enabled = !enabled"
      >
        {{ enabled ? '关闭自定义主题' : '开启自定义主题' }}
      </button>
    </div>

    <ConfigProvider apply-to="self" :theme-overrides="themeOverrides">
      <div
        style="
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--elx-border-color);
          background:
            radial-gradient(
              1200px 280px at 0% 0%,
              rgba(139, 92, 246, 0.22),
              transparent 60%
            ),
            radial-gradient(
              900px 240px at 100% 20%,
              rgba(59, 130, 246, 0.14),
              transparent 55%
            ),
            rgba(0, 0, 0, 0.02);
          box-shadow: var(--elx-box-shadow);
          display: flex;
          flex-direction: column;
          gap: 10px;
        "
      >
        <Bubble
          placement="start"
          variant="borderless"
          content="这是一个 start 气泡。覆写后会变成渐变背景 + 大圆角 + 更强阴影。"
        />
        <Bubble
          placement="end"
          variant="shadow"
          content="这是一个 end 气泡。通过 themeOverrides 你可以把 Bubble 做成统一的“玻璃风”主题。"
        />
        <Bubble placement="start" variant="shadow" loading />
      </div>
    </ConfigProvider>
  </div>
</template>

```

### variant-and-shape

```vue
<docs>
---
title: 内置样式格式和形状
---

通过 `variant` 属性设置气泡的填内置样式格式。通过 `shape` 属性设置气泡的形状。当然你也可以两两结合，搭配使用

::: info
默认情况下，`variant` 为 `filled`，`shape` 为 `round`。

`shape` 为 `corner` 时，`placement="end"` 会自动将气泡翻转，使得右上角的 `弧度针` 指向用户。
:::
</docs>

<script setup lang="ts"></script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="filled" variant="filled" />
      <Bubble content="filled + round" variant="filled" shape="round" />
      <Bubble content="filled + corner" variant="filled" shape="corner" />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="borderless" variant="borderless" />
      <Bubble content="borderless + round" variant="borderless" shape="round" />
      <Bubble
        content="borderless + corner"
        variant="borderless"
        shape="corner"
      />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="outlined" variant="outlined" />
      <Bubble content="outlined + round" variant="outlined" shape="round" />
      <Bubble content="outlined + corner" variant="outlined" shape="corner" />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="shadow" variant="shadow" />
      <Bubble content="shadow + round" variant="shadow" shape="round" />
      <Bubble content="shadow + corner" variant="shadow" shape="corner" />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="round" shape="round" />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="corner" shape="corner" />
      <Bubble content="placement end" shape="corner" placement="end" />
    </div>
  </div>
</template>

```

### with-markdown

```vue
<docs>
---
title: 与 x-markdown-vue 结合使用
---

支持公式、代码块、任务列表和流式渲染。
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

const avatar = 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4';

const staticContent = ref(`### 行内公式
1. 欧拉公式：$e^{i\\pi} + 1 = 0$
2. 二次方程求根公式：$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
3. 向量点积：$\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y + a_z b_z$

### []包裹公式
\\[ e^{i\\pi} + 1 = 0 \\]

\\[\\boxed{boxed包裹}\\]

### 块级公式
1. 傅里叶变换：
$$
F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt
$$

2. 矩阵乘法：
$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
\\begin{bmatrix}
x \\\\
y
\\end{bmatrix}
=
\\begin{bmatrix}
ax + by \\\\
cx + dy
\\end{bmatrix}
$$

3. 泰勒级数展开：
$$
f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n
$$

### 任务列表与代码块
- [x] Add some task
- [ ] Do some task

\`\`\`typescript
const greeting: string = "Hello World";
console.log(greeting);
\`\`\`
`);

const streamingContent = ref('');
let interval: ReturnType<typeof setInterval>;

function startStreaming() {
  streamingContent.value = '';
  const text = `# 标题
这是一个 Markdown 示例。
- 列表项 1
- 列表项 2
**粗体文本** 和 *斜体文本*

- [x] Add some task
- [ ] Do some task

\`\`\`typescript
const greeting = "Hello World";
console.log(greeting);
\`\`\`
`;
  let index = 0;
  interval = setInterval(() => {
    if (index < text.length) {
      streamingContent.value += text[index];
      index++;
    } else {
      clearInterval(interval);
    }
  }, 30);
}

function stopStreaming() {
  clearInterval(interval);
}

function resetStreaming() {
  stopStreaming();
  streamingContent.value = '';
}

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="markdown-demo-container">
    <div class="demo-section">
      <div class="demo-title">基础用法（支持公式、代码块、任务列表）</div>
      <Bubble :avatar="avatar" placement="start">
        <template #content>
          <div class="markdown-content-wrapper">
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer"
              :markdown="staticContent"
            />
          </div>
        </template>
      </Bubble>
    </div>

    <div class="demo-section">
      <div class="demo-title">流式渲染</div>
      <p class="demo-tip">
        通过 <code>enable-animate</code> 属性实现打字机效果，模拟 AI
        流式输出场景
      </p>
      <div class="btn-list">
        <el-button type="primary" @click="startStreaming">
          开始流式输出
        </el-button>
        <el-button @click="stopStreaming"> 停止 </el-button>
        <el-button @click="resetStreaming"> 重置 </el-button>
      </div>
      <Bubble :avatar="avatar" placement="start">
        <template #content>
          <div class="markdown-content-wrapper">
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer"
              :markdown="streamingContent"
              :enable-animate="true"
            />
          </div>
        </template>
      </Bubble>
    </div>
  </div>
</template>

<style scoped lang="scss">
.markdown-demo-container {
  .demo-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .demo-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--vp-c-text-1);
  }

  .demo-tip {
    color: var(--vp-c-text-2);
    font-size: 14px;
    margin-bottom: 12px;

    code {
      background: var(--vp-c-default-soft);
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  .btn-list {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}

.markdown-content-wrapper {
  word-break: break-word;
  color: #24292e;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    line-height: 1.25;
    &:first-child {
      margin-top: 0;
    }
  }

  :deep(p) {
    margin-top: 0;
    margin-bottom: 8px;
    line-height: 1.6;
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
    margin-top: 0;
    margin-bottom: 8px;

    ul,
    ol {
      margin-top: 4px;
      margin-bottom: 0;
    }
  }

  :deep(ul) {
    list-style-type: disc;
  }

  :deep(ol) {
    list-style-type: decimal;
  }

  :deep(li) {
    margin: 4px 0;
    line-height: 1.6;

    &.task-list-item {
      list-style-type: none;
      padding-left: 0;
      display: flex;
      align-items: flex-start;
      margin-left: -20px;

      input[type='checkbox'] {
        margin: 5px 8px 0 0;
        flex-shrink: 0;
      }
    }
  }

  :deep(a) {
    color: #0366d6;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  :deep(code):not(pre code) {
    background-color: rgba(27, 31, 35, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family:
      ui-monospace,
      SFMono-Regular,
      SF Mono,
      Menlo,
      Consolas,
      Liberation Mono,
      monospace;
    font-size: 85%;
  }

  :deep(blockquote) {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 8px 0;
  }

  :deep(hr) {
    height: 0.25em;
    padding: 0;
    margin: 16px 0;
    background-color: #e1e4e8;
    border: 0;
  }

  :deep(table) {
    display: block;
    width: 100%;
    overflow: auto;
    margin-top: 0;
    margin-bottom: 16px;
    border-collapse: collapse;

    th,
    td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }

    tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;
      &:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
  }
}

:deep(.x-md-code-block) {
  pre {
    background-color: #f6f8fa !important;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;

    code {
      font-family:
        ui-monospace,
        SFMono-Regular,
        SF Mono,
        Menlo,
        Consolas,
        Liberation Mono,
        monospace;
      font-size: 14px;
      line-height: 1.5;

      .line {
        display: block;
        min-height: 1rem;
      }
    }
  }
}

:deep(.x-md-animated-word) {
  animation: fadeIn 0.2s ease-in-out forwards;
  display: inline-block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

```

## API 参考

### 头像、位置

### 头部、底部

### 加载状态

### 自定义内容

### 变体和形状

### 自定义主题

通过 `ConfigProvider.themeOverrides` 覆盖 `Bubble` 的主题变量。完整变量表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens#bubble)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

### 与 x-markdown-vue 结合使用

从 v2.0.0 开始，Typewriter 组件已移除。如需 Markdown 渲染功能，请使用 [x-markdown-vue](https://www.npmjs.com/package/x-markdown-vue)，或查看专属文档：[XMarkdown](/zh/components/xMarkdown/)。

#### 安装

```bash
pnpm add x-markdown-vue
pnpm add katex
pnpm add shiki shiki-stream
```

::: tip
如果需要代码块语法高亮功能，请安装 `shiki` 和 `shiki-stream`。否则控制台可能会报错：`Streaming highlighter initialization failed: Error: Failed to load shiki-stream module`
:::

#### 完整演示

#### 基础用法

```vue
<script setup>
import { ref } from 'vue';
import { MarkdownRenderer } from 'x-markdown-vue';
import 'x-markdown-vue/style';

const avatar = ref('https://example.com/avatar.png');
const content = ref('**Hello** World!\n\n这是 **Markdown** 内容');
</script>

<template>
  <Bubble :avatar="avatar" placement="start">
    <template #content>
      <MarkdownRenderer :markdown="content" />
    </template>
  </Bubble>
</template>
```

#### 雾化效果（替代打字效果）

```vue
<script setup>
import { ref } from 'vue';
import { MarkdownRenderer } from 'x-markdown-vue';
import 'x-markdown-vue/style';

const content = ref('');
</script>

<template>
  <Bubble :avatar="avatar" placement="start">
    <template #content>
      <MarkdownRenderer :markdown="content" :enable-animate="true" />
    </template>
  </Bubble>
</template>
```

## 属性

| <div style="width: 130px">属性名</div> |  类型   |  默认值  | 说明                                                                                                              |
| :------------------------------------- | :-----: | :------: | :---------------------------------------------------------------------------------------------------------------- |
| `content`                              | String  |    ''    | 气泡内要展示的文本内容                                                                                            |
| `placement`                            | String  | 'start'  | 气泡的位置，可选值为 `'start'` 或 `'end'`，分别表示左侧和右侧。                                                   |
| `avatar`                               | String  |    ''    | 气泡头像的图片地址                                                                                                |
| `loading`                              | Boolean |  false   | 是否显示加载状态。为 `true` 时，气泡内会显示加载状态。                                                            |
| `shape`                                | String  |   null   | 气泡的形状，可选值为 `'round'`（圆角）或 `'corner'`（有角）。                                                     |
| `variant`                              | String  | 'filled' | 气泡的样式变体，可选值为 `'filled'`（填充）、`'borderless'`（无边框）、`'outlined'`（轮廓）、`'shadow'`（阴影）。 |
| `noStyle`                              | Boolean |  false   | 是否去除样式，为 `true` 时，将去除气泡内置 `padding` 和 `背景色`                                                  |
| `maxWidth`                             | String  | '500px'  | 气泡内容的最大宽度。                                                                                              |
| `avatar-size`                          | String  |    ''    | 设置头像占位大小                                                                                                  |
| `avatar-gap`                           | String  |  '12px'  | 设置头像和气泡之间的 `gap` 值                                                                                     |
| `avatar-shape`                         | String  |    ''    | 头像形状，可选值为 `'circle'`（圆形）或 `'square'`（方形）。                                                      |
| `avatar-icon`                          | String  |    ''    | 头像图标，优先级高于 `avatar`，支持传入图标名称，如 `'user'`。                                                    |
| `avatar-src-set`                       | String  |    ''    | 设置头像图片 srcset 属性                                                                                          |
| `avatar-alt`                           | String  |    ''    | 设置头像图片 alt 属性                                                                                             |
| `avatar-fit`                           | String  | 'cover'  | 设置头像图片的 `object-fit` 属性,可选属性值：`'cover'`、`'contain'`、`'fill'`、`'none'`、`'scale-down'`           |

## 事件

| 事件名         | 参数       | 类型     | 描述               |
| -------------- | ---------- | -------- | ------------------ |
| `@avatarError` | `ref` 实例 | Function | 头像加载失败时触发 |

## Ref 实例方法

| 属性名    | 类型     | 描述                   |
| --------- | -------- | ---------------------- |
| `restart` | Function | 重新开始。             |
| `destroy` | Function | 主动销毁 Bubble 组件。 |

## 插槽

| 插槽名     | 参数 | 类型 | 描述                       |
| ---------- | ---- | ---- | -------------------------- |
| `#avatar`  | -    | Slot | 自定义头像展示内容         |
| `#header`  | -    | Slot | 自定义气泡顶部展示内容     |
| `#content` | -    | Slot | 自定义气泡展示内容         |
| `#loading` | -    | Slot | 自定义气泡加载状态展示内容 |
| `#footer`  | -    | Slot | 自定义气泡底部展示内容     |

## 功能特性

1. **布局方向** - 支持左对齐(`start`)和右对齐(`end`)
2. **内容类型** - 支持纯文本、自定义插槽内容
3. **加载状态** - 内置加载动画，支持自定义加载内容
4. **视觉效果** - 提供多种形状和变体（圆角/直角、填充/描边/阴影等）
5. **灵活插槽** - 提供头像、头部、内容、底部、加载状态等插槽
---

