# useXStream 流式传输

## 介绍

这个钩子函数，可以让用户更方便的控制 **流式请求**。提供 `发起请求` ，`中断请求` ，返回 `loading` 请求状态，返回 SSE 协议 `实时的数据流`，返回请求 `error` 信息。

目前只测试了 SSE 和 SIP 协议请求，其他协议的请求还有待测试，如果您好的想法和发现，欢迎进交流群 👨‍👩‍👧‍👧 **[交流群](https://element-plus-x.com/en/introduce.html#%F0%9F%91%A5-%E7%A4%BE%E5%8C%BA%E6%94%AF%E6%8C%81)**，与我们取得联系，欢迎交流方案，提交 issue 和 pr。提交规范请阅读 👉 **[开发文档](https://element-plus-x.com/guide/develop.html)**

## 代码示例

### useSIP

```vue
<docs>
---
title: SIP 基础使用
---

这里展示对 SIP 协议的支持
</docs>

<script setup lang="ts">
import { useXStream } from 'vue-element-plus-x';

const { startStream, cancel, data, error, isLoading } = useXStream();

async function startSIPStream() {
  try {
    const response = await fetch(
      'https://node-test.element-plus-x.com/api/sip',
      {
        headers: { 'Content-Type': 'application/sip' }
      }
    );
    const readableStream = response.body!;

    // 自定义 transformStream 处理 SIP 数据
    const sipTransformStream = new TransformStream<string, any>({
      transform(chunk, controller) {
        // 这里可以添加 SIP 数据的解析逻辑
        controller.enqueue(chunk);
      }
    });

    await startStream({ readableStream, transformStream: sipTransformStream });
  }
  catch (err) {
    console.error('Fetch error:', err);
  }
}

// 计算属性
const content = computed(() => {
  if (!data.value.length)
    return '';
  let text = '';
  for (let index = 0; index < data.value.length; index++) {
    const chunk = data.value[index];
    try {
      console.log('chunk', chunk);
      text += chunk;
    }
    catch (error) {
      console.error('解析数据时出错:', error);
    }
    // console.log('New chunk:', chunk)
  }
  console.log('Text:', text);
  return text;
});
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button :disabled="isLoading" @click="startSIPStream">
        {{ isLoading ? '加载中...' : '获取 SIP 协议数据' }}
      </el-button>

      <el-button :disabled="!isLoading" @click="cancel()">
        中断请求
      </el-button>
    </div>
    <div v-if="error" class="error">
      {{ error.message }}
    </div>

    <Bubble
      v-if="content"
      :content="content"
      is-markdown
      style="width: calc(100% - 12px)"
    />
  </div>
</template>

<style scoped lang="less">
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  .el-button {
    width: fit-content;
  }
  :deep(.markdown-body) {
    background-color: transparent;
    padding: 12px;
  }
}
</style>

```

### useSSE

```vue
<docs>
---
title: SSE 基础使用
---

这个钩子函数，是对标 `ant-design-x` 的 `XStream` 方法，我们 融合 `Vue` 的开发范式。

在此基础上，新增了对流式请求的 `中断` 处理，并将 原钩子函数的配置方法，放在了 `startStream` 入参中，让开发者更能理解 这个钩子的作用
</docs>

<script setup lang="ts">
import { useXStream } from 'vue-element-plus-x';

const { startStream, cancel, data, error, isLoading } = useXStream();

// 默认支持 SSE 协议
async function startSSE() {
  try {
    const response = await fetch(
      'https://node-test.element-plus-x.com/api/sse',
      {
        headers: { 'Content-Type': 'text/event-stream' }
      }
    );
    const readableStream = response.body!;
    await startStream({ readableStream });
  }
  catch (err) {
    console.error('Fetch error:', err);
  }
}

// 机器人的 content 计算属性
const content = computed(() => {
  if (!data.value.length)
    return '';
  let text = '';
  for (let index = 0; index < data.value.length; index++) {
    const chunk = data.value[index].data;
    try {
      const parsedChunk = JSON.parse(chunk).content;
      text += parsedChunk;
    }
    catch (error) {
      // 这个 结束标识 是后端给的，所以这里这样判断
      // 实际项目中，以项目需要为准
      if (chunk === ' [DONE]') {
        // 处理数据结束的情况
        // console.log('数据接收完毕')
      }
      else {
        console.error('解析数据时出错:', error);
      }
    }
    // console.log('New chunk:', chunk)
  }
  console.log('Text:', text);
  return text;
});
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button :disabled="isLoading" @click="startSSE">
        {{ isLoading ? '加载中...' : '获取 SSE流数据' }}
      </el-button>

      <el-button :disabled="!isLoading" @click="cancel()">
        中断请求
      </el-button>
    </div>
    <div v-if="error" class="error">
      {{ error.message }}
    </div>

    <Bubble
      v-if="content"
      :content="content"
      is-markdown
      style="width: calc(100% - 12px)"
    />
  </div>
</template>

<style scoped lang="less">
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  .el-button {
    width: fit-content;
  }
  :deep(.markdown-body) {
    background-color: transparent;
    padding: 12px;
  }
}
</style>

```

## API 参考

::: warning
这个 hooks 的解析规则，也和 ant-design-x 一致，都是在内部做了处理。**请放心切换使用**

sseEventPart
**`'event: message\ndata: {"id":"${i}","content":"${contentChunks[i]}"}\n\n'`**

```ts
// 数据流默认分隔符（使用两个换行符，分割一条流数据）
const DEFAULT_STREAM_SEPARATOR = '\n\n';
// 分段默认分隔符（使用单个换行符，换行当前数据）
const DEFAULT_PART_SEPARATOR = '\n';
// 键值对默认分隔符（使用冒号）
const DEFAULT_KV_SEPARATOR = ':';
```

:::

## 返回钩子

| 属性名      | 说明                 | 类型                                          |
| ----------- | -------------------- | --------------------------------------------- |
| startStream | 开始请求流模式接口   | `({readableStream, transformStream}) => void` |
| cancel      | 中断流式请求         | `() => void`                                  |
| loading     | 是否正在请求流式数据 | `boolean`                                     |
| data        | 实时返回的流式数据   | `string`                                      |
| error       | 流式请求报错信息     | `string`                                      |
---

