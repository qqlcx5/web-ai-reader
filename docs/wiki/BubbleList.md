# BubbleList 对话气泡列表

## 介绍

`BubbleList` 基于 `Bubble` 组件，用于展示一组对话气泡列表。内置虚拟滚动（`virtua/vue`）、自动追底、滚动状态机、未读计数、双向分页加载、回底按钮和混合节点渲染，开箱即用，按需配置。

### 基础使用

## 代码示例

### auto-scroll

```vue
<docs>
---
title: 自动触底控制（autoScroll）
---

`autoScroll`（默认 `true`）控制追加新消息时是否自动滚到底部。关闭后，新消息不再自动触底，而是累计未读计数——这是显示未读角标的前提。

::: tip 流式输出的特殊行为
即使 `autoScroll` 开启，流式增量也只在用户处于底部时跟随；上滑后不强制拉回，避免打断阅读。
:::
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface MessageItem {
  key: number;
  role: 'user' | 'ai';
  content: string;
  placement: 'start' | 'end';
  loading?: boolean;
}

const bubbleListRef = ref<BubbleListInstance | null>(null);
const autoScroll = ref(true);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
let nextKey = 100;

const bubbleItems = ref<MessageItem[]>(buildSeedList());

function buildSeedList(): MessageItem[] {
  const list: MessageItem[] = [];
  for (let i = 0; i < 8; i++) {
    const isUser = i % 2 !== 0;
    list.push({
      key: i + 1,
      role: isUser ? 'user' : 'ai',
      content: isUser
        ? `用户消息 ${i + 1}：你好，我想了解一下 BubbleList 的自动滚动功能。`
        : `AI 回复 ${i + 1}：BubbleList 的 autoScroll 属性控制新消息是否自动滚动到底部。默认开启。`,
      placement: isUser ? 'end' : 'start'
    });
  }
  nextKey = 9;
  return list;
}

function resetConversation() {
  bubbleItems.value = buildSeedList();
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function appendMessage(role: 'user' | 'ai') {
  bubbleItems.value.push({
    key: ++nextKey,
    role,
    content:
      role === 'user'
        ? '用户追加消息：这是一条测试消息，用于观察 autoScroll 开关对自动触底的影响。'
        : 'AI 追加回复：当 autoScroll 开启时，此消息会自动出现在底部可视区域。',
    placement: role === 'user' ? 'end' : 'start'
  });
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}

function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}
</script>

<template>
  <div class="autoscroll-demo">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-header">
        <span class="header-icon">⚙️</span>
        <span>AutoScroll 自动触底控制台</span>
      </div>

      <!-- 核心：autoScroll 开关 -->
      <div class="control-row core-switch">
        <span class="switch-label">
          <strong>autoScroll</strong>
          <span class="switch-desc">{{
            autoScroll
              ? '已开启 — 新消息自动触底'
              : '已关闭 — 累计未读，需手动回底'
          }}</span>
        </span>
        <el-switch
          v-model="autoScroll"
          active-text="开启"
          inactive-text="关闭"
        />
      </div>

      <el-divider style="margin: 8px 0" />

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          plain
          size="small"
          @click="appendMessage('user')"
        >
          + 用户消息
        </el-button>
        <el-button
          type="success"
          plain
          size="small"
          @click="appendMessage('ai')"
        >
          + AI 回复
        </el-button>
        <el-button size="small" @click="resetConversation">
          重置会话
        </el-button>
      </div>

      <!-- 行为说明 -->
      <div class="behavior-hint" :class="autoScroll ? 'hint-on' : 'hint-off'">
        <div class="hint-icon">
          {{ autoScroll ? '✅' : '⚠️' }}
        </div>
        <div class="hint-text">
          <template v-if="autoScroll">
            <strong>当前模式：自动追底</strong><br />
            所有新消息（用户 / AI）都会自动滚动到底部，未读计数始终为 0。
            尝试向上滚动后再点追加消息，观察是否仍然自动回底。
          </template>
          <template v-else>
            <strong>当前模式：手动控制</strong><br />
            新消息不再自动触发滚动，未读数开始累计。
            回底按钮将显示红色数字角标，点击后平滑滚到底部并清零未读。
          </template>
        </div>
      </div>
    </div>

    <!-- BubbleList -->
    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :auto-scroll="autoScroll"
        :always-show-scrollbar="true"
        :show-back-button="true"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <!-- 自定义回底按钮（带未读角标） -->
        <template #backToBottom="context">
          <div
            class="custom-back-btn"
            :class="{ 'has-unread': context.unreadCount > 0 }"
            @click="context.scrollToBottom(true)"
          >
            <span class="btn-icon">↓</span>
            <span class="btn-text">回到底部</span>
            <span v-if="context.unreadCount > 0" class="btn-badge">
              {{ context.unreadCount > 99 ? '99+' : context.unreadCount }}
            </span>
          </div>
        </template>
      </BubbleList>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-item">
        <span class="status-label">scrollState</span>
        <el-tag
          :type="
            scrollState === 'AT_BOTTOM'
              ? 'success'
              : scrollState === 'SCROLLED_UP'
                ? 'warning'
                : 'danger'
          "
          size="small"
        >
          {{ scrollState }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">unreadCount</span>
        <el-tag :type="unreadCount > 0 ? 'danger' : 'info'" size="small">
          {{ unreadCount }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">autoScroll</span>
        <el-tag :type="autoScroll ? 'success' : 'danger'" size="small">
          {{ autoScroll ? 'ON' : 'OFF' }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.autoscroll-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
}

.control-panel {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;

  .panel-header {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;

    .header-icon {
      font-size: 18px;
    }
  }

  .core-switch {
    background: #fafafa;
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .switch-label {
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong {
        color: #303133;
        font-size: 14px;
      }
      .switch-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .behavior-hint {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.6;
    display: flex;
    gap: 8px;

    &.hint-on {
      background: #f0f9eb;
      border: 1px solid #e1f3d8;
      color: #67c23a;
    }

    &.hint-off {
      background: #fef0f0;
      border: 1px solid #fde2e2;
      color: #f56c6c;
    }

    .hint-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    strong {
      font-weight: 600;
    }
  }
}

.status-bar {
  display: flex;
  gap: 16px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 8px;
  flex-wrap: wrap;

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .status-label {
      font-size: 12px;
      color: #909399;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  }
}

// ---- 自定义回底按钮（带未读角标） ----
.custom-back-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.35);
  transition: all 0.25s ease;
  user-select: none;
  z-index: 10;

  &:hover {
    transform: translateX(-50%) scale(1.05);
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.5);
  }

  &:active {
    transform: translateX(-50%) scale(0.97);
  }

  .btn-icon {
    font-size: 14px;
    font-weight: 700;
  }
  .btn-text {
    white-space: nowrap;
  }

  .btn-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #f56c6c;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
  }

  &.has-unread {
    animation: pulse-red 1.5s ease-in-out infinite;
  }
}

@keyframes pulse-red {
  0%,
  100% {
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.35);
  }
  50% {
    box-shadow:
      0 2px 20px rgba(245, 108, 108, 0.6),
      0 0 0 4px rgba(245, 108, 108, 0.15);
  }
}
</style>

```

### back-button

```vue
<docs>
---
title: 返回底部按钮
---

内置回底按钮，支持属性配置外观，也可通过 `#backToBottom` 插槽完全自定义。

通过 `showBackButton`、`backButtonThreshold`、`backButtonPosition`、`btnColor` / `btnIconSize` / `btnLoading` 等属性调整按钮行为与样式。关闭 `autoScroll` 后，按钮上会自动出现未读角标，插槽上下文中的 `unreadCount` 即为当前未读数，`scrollToBottom()` 调用后自动清零。
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface MessageItem {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  loading: boolean;
  shape: 'round' | 'corner';
  variant: string;
  avatar: string;
  avatarSize: string;
}

const bubbleListRef = ref<BubbleListInstance | null>(null);

// ---- 控制开关 ----
const useCustomSlot = ref(false);
const autoScrollEnabled = ref(true);
const alwaysShowScrollbar = ref(false);

// ---- 内置按钮属性（仅默认模式） ----
const btnLoading = ref(true);
const btnColor = ref('#409EFF');
const btnSize = ref(24);
const bottomValue = ref(20);
const leftValue = ref(50);

// ---- 状态 ----
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
let nextKey = 100;

const backButtonPosition = computed(() => ({
  bottom: `${bottomValue.value}%`,
  left: `${leftValue.value}%`,
  transform: 'translateX(-50%)'
}));

// ---- 初始数据 ----
const list = ref<MessageItem[]>(buildSeedList());

function buildSeedList(): MessageItem[] {
  const messages: MessageItem[] = [];
  for (let i = 0; i < 12; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    const placement = role === 'ai' ? 'start' : 'end';
    messages.push({
      key: i + 1,
      role,
      placement,
      content:
        role === 'ai'
          ? '💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~'.repeat(
              2
            )
          : `哈哈哈，让我试试第 ${i + 1} 条消息`,
      loading: false,
      shape: 'corner',
      variant: role === 'ai' ? 'filled' : 'outlined',
      avatar:
        role === 'ai'
          ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          : 'https://avatars.githubusercontent.com/u/76239030?v=4',
      avatarSize: '24px'
    });
  }
  nextKey = 13;
  return messages;
}

// ---- 操作 ----
function appendMessage(role: 'user' | 'ai') {
  list.value.push({
    key: ++nextKey,
    role,
    placement: role === 'ai' ? 'start' : 'end',
    content:
      role === 'user'
        ? '📝 用户追加消息：这是一条测试消息，用于观察 autoScroll 对触底和未读的影响。'
        : '🤖 AI 追加回复：当 autoScroll 关闭时，此消息会触发未读计数 +1，回底按钮将带红色角标。',
    loading: false,
    shape: 'corner',
    variant: role === 'ai' ? 'filled' : 'outlined',
    avatar:
      role === 'ai'
        ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        : 'https://avatars.githubusercontent.com/u/76239030?v=4',
    avatarSize: '24px'
  });
}

function resetConversation() {
  list.value = buildSeedList();
  unreadCount.value = 0;
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}

function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}
</script>

<template>
  <div class="back-btn-demo">
    <!-- ====== 控制面板 ====== -->
    <div class="control-panel">
      <!-- 核心开关区 -->
      <div class="panel-section">
        <div class="section-title">核心控制</div>

        <div class="control-row core-switch">
          <span class="switch-label">
            <strong>autoScroll</strong>
            <span class="switch-desc">
              {{
                autoScrollEnabled
                  ? '已开启 — 新消息自动触底，无未读'
                  : '已关闭 — 累计未读，显示角标'
              }}
            </span>
          </span>
          <el-switch
            v-model="autoScrollEnabled"
            active-text="开启"
            inactive-text="关闭"
          />
        </div>

        <div class="control-row">
          <span class="control-label">自定义插槽 (V2)</span>
          <el-switch
            v-model="useCustomSlot"
            inactive-text="默认按钮"
            active-text="自定义"
          />
        </div>

        <div class="control-row">
          <span class="control-label">滚动条显示</span>
          <el-switch
            v-model="alwaysShowScrollbar"
            inactive-text="鼠标悬停"
            active-text="一直展示"
          />
        </div>
      </div>

      <!-- 内置按钮属性（仅默认模式） -->
      <template v-if="!useCustomSlot">
        <div class="panel-section">
          <div class="section-title">内置按钮样式</div>

          <div class="control-row">
            <span class="control-label">Loading 动效</span>
            <el-switch
              v-model="btnLoading"
              inactive-text="关闭"
              active-text="开启"
            />
          </div>

          <div class="control-row">
            <span class="control-label">按钮颜色</span>
            <el-color-picker v-model="btnColor" size="default" />
          </div>

          <div class="control-row">
            <span class="control-label">图标大小</span>
            <el-slider v-model="btnSize" :min="16" :max="48" style="flex: 1" />
          </div>
        </div>
      </template>

      <!-- 定位属性（两种模式均生效） -->
      <div class="panel-section">
        <div class="section-title">
          按钮定位
          <el-tag
            size="small"
            type="success"
            effect="plain"
            style="margin-left: 6px; vertical-align: middle"
          >
            插槽模式也生效
          </el-tag>
        </div>
        <div class="control-row">
          <span class="control-label">距底部 %</span>
          <el-slider v-model="bottomValue" :min="0" :max="50" style="flex: 1" />
          <span class="control-value">{{ bottomValue }}%</span>
        </div>
        <div class="control-row">
          <span class="control-label">水平位置 %</span>
          <el-slider v-model="leftValue" :min="0" :max="100" style="flex: 1" />
          <span class="control-value">{{ leftValue }}%</span>
        </div>
      </div>

      <!-- 自定义模式提示 -->
      <div v-if="useCustomSlot" class="custom-tip">
        <span class="tip-badge">V2</span>
        <span
          >自定义 <code>#backToBottom</code> 插槽时，icon / 颜色 /
          大小等视觉属性失效，但
          <strong>backButtonPosition</strong
          >（位置定位）由外层容器控制，上方定位滑块<strong>仍然实时生效</strong>。</span
        >
      </div>

      <!-- 操作按钮 -->
      <el-divider style="margin: 10px 0" />
      <div class="action-buttons">
        <el-button
          type="primary"
          plain
          size="small"
          @click="appendMessage('user')"
        >
          + 用户消息
        </el-button>
        <el-button
          type="success"
          plain
          size="small"
          @click="appendMessage('ai')"
        >
          + AI 回复
        </el-button>
        <el-button size="small" @click="resetConversation">
          重置会话
        </el-button>
      </div>

      <!-- 行为说明 -->
      <div
        class="behavior-hint"
        :class="autoScrollEnabled ? 'hint-on' : 'hint-off'"
      >
        <div class="hint-icon">
          {{ autoScrollEnabled ? '✅' : '⚠️' }}
        </div>
        <div class="hint-text">
          <template v-if="autoScrollEnabled">
            <strong>autoScroll 开启中</strong><br />
            追加消息后自动滚到底部，<strong>unreadCount 始终为 0</strong
            >，回底按钮不会出现。<br />
            尝试：先向上滚动一段距离，再点「+ 用户消息」，观察是否仍自动回底。
          </template>
          <template v-else>
            <strong>autoScroll 已关闭</strong><br />
            追加消息后<strong>不自动滚动</strong>，未读数逐条 +1，状态变为
            <code>HAS_NEW_MESSAGES</code>，回底按钮浮现并带<span
              class="badge-preview"
              >红色数字角标</span
            >。<br />
            点击回底按钮后未读清零，状态恢复 <code>AT_BOTTOM</code>。
          </template>
        </div>
      </div>
    </div>

    <!-- ====== BubbleList ====== -->
    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="list"
        :auto-scroll="autoScrollEnabled"
        :always-show-scrollbar="alwaysShowScrollbar"
        :show-back-button="true"
        :btn-color="useCustomSlot ? undefined : btnColor"
        :btn-loading="useCustomSlot ? undefined : btnLoading"
        :back-button-position="backButtonPosition"
        :btn-icon-size="useCustomSlot ? undefined : btnSize"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <!-- 自定义回底按钮（带未读角标） -->
        <template v-if="useCustomSlot" #backToBottom="context">
          <div
            class="custom-back-btn"
            :class="{ 'has-unread': context.unreadCount > 0 }"
            @click="context.scrollToBottom(true)"
          >
            <span class="custom-back-btn__icon">↓</span>
            <span class="custom-back-btn__text">
              {{
                context.unreadCount > 0
                  ? `${context.unreadCount > 99 ? '99+' : context.unreadCount} 条新消息`
                  : '回到底部'
              }}
            </span>
            <span v-if="context.unreadCount > 0" class="custom-back-btn__badge">
              {{ context.unreadCount > 99 ? '99+' : context.unreadCount }}
            </span>
          </div>
        </template>
      </BubbleList>
    </div>

    <!-- ====== 状态栏 ====== -->
    <div class="status-bar">
      <div class="status-item">
        <span class="status-label">scrollState</span>
        <el-tag
          :type="
            scrollState === 'AT_BOTTOM'
              ? 'success'
              : scrollState === 'SCROLLED_UP'
                ? 'warning'
                : 'danger'
          "
          size="small"
        >
          {{ scrollState }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">unreadCount</span>
        <el-tag :type="unreadCount > 0 ? 'danger' : 'info'" size="small">
          {{ unreadCount }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">autoScroll</span>
        <el-tag :type="autoScrollEnabled ? 'success' : 'danger'" size="small">
          {{ autoScrollEnabled ? 'ON' : 'OFF' }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">按钮模式</span>
        <el-tag :type="useCustomSlot ? 'warning' : 'info'" size="small">
          {{ useCustomSlot ? '自定义插槽' : '内置默认' }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.back-btn-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
}

// ---- 控制面板 ----
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 14px;

  .panel-section {
    display: flex;
    flex-direction: column;
    gap: 6px;

    & + .panel-section {
      margin-top: 6px;
      padding-top: 10px;
      border-top: 1px dashed #dcdfe6;
    }
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 2px;
  }

  .control-row {
    display: flex;
    align-items: center;
    gap: 10px;

    .control-label {
      font-size: 13px;
      color: #606266;
      min-width: 100px;
    }

    .control-value {
      font-size: 12px;
      color: #409eff;
      min-width: 36px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  }

  .core-switch {
    background: #fafafa;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .switch-label {
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong {
        color: #303133;
        font-size: 14px;
      }
      .switch-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  // 行为说明卡片
  .behavior-hint {
    margin-top: 4px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.65;
    display: flex;
    gap: 8px;

    &.hint-on {
      background: #f0f9eb;
      border: 1px solid #e1f3d8;
      color: #67c23a;
    }

    &.hint-off {
      background: #fef0f0;
      border: 1px solid #fde2e2;
      color: #f56c6c;
    }

    .hint-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    strong {
      font-weight: 600;
    }
    code {
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.06);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
    }
    .badge-preview {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      background: #f56c6c;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      vertical-align: middle;
    }
  }

  // V2 自定义提示
  .custom-tip {
    margin-top: 4px;
    padding: 10px 12px;
    border-radius: 8px;
    background: linear-gradient(135deg, #f0f9eb 0%, #ecf5ff 100%);
    border: 1px solid #e1f3d8;
    font-size: 13px;
    color: #606266;
    line-height: 1.6;

    .tip-badge {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 4px;
      background: #67c23a;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      margin-right: 6px;
      vertical-align: middle;
    }

    code {
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.06);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
    }
  }
}

// ---- 状态栏 ----
.status-bar {
  display: flex;
  gap: 16px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 8px;
  flex-wrap: wrap;

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .status-label {
      font-size: 12px;
      color: #909399;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  }
}

// ---- 自定义回底按钮（带未读角标） ----
.custom-back-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 24px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.35);
  transition: all 0.25s ease;
  user-select: none;
  z-index: 10;

  &:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5);
    background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
  }

  &:active {
    transform: translateX(-50%) scale(0.96);
  }

  &.has-unread {
    animation: pulse-red 1.5s ease-in-out infinite;
  }

  &__icon {
    font-size: 16px;
    font-weight: 700;
  }

  &__text {
    white-space: nowrap;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #f56c6c;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
  }
}

@keyframes pulse-red {
  0%,
  100% {
    box-shadow: 0 4px 14px rgba(64, 158, 255, 0.35);
  }
  50% {
    box-shadow:
      0 4px 20px rgba(245, 108, 108, 0.6),
      0 0 0 4px rgba(245, 108, 108, 0.15);
  }
}
</style>

```

### bidirectional-loading

```vue
<docs>
---
title: 双向分页加载
---

向上滚到顶部触发 `@load-more-top`，向下滚到底部触发 `@load-more-bottom`。数据准备完毕后调用 `loadMoreTopComplete()` / `loadMoreBottomComplete()` 通知组件，滚动位置自动修复，无需手动处理跳动。

通过 `topStatus` / `bottomStatus` 属性（`{ type, text }`）控制边界状态区的展示（`loading` / `no-more`），配合 `#topStatus` / `#bottomStatus` 插槽自定义 UI。
</docs>

<script setup lang="ts">
import type {
  BubbleListBoundaryState,
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';
import { computed } from 'vue';

interface MessageItem {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
  avatarSize?: string;
  avatarGap?: string;
  shape?: string;
  variant?: string;
}

const MAX_HISTORY_BATCHES = 3;
const MAX_BOTTOM_BATCHES = 2;
const PAGE_SIZE = 6;

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<MessageItem[]>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const historyBatchCount = ref(0);
const bottomBatchCount = ref(0);
const topTriggerCount = ref(0);
const bottomTriggerCount = ref(0);
const topLoading = ref(false);
const bottomLoading = ref(false);
const lastAction = ref(
  '手动滚动到顶部触发历史加载，回到底部继续向下滚动可触发更多消息。'
);

let nextKey = 0;
let topTimer: number | null = null;
let bottomTimer: number | null = null;

function createMessage(
  key: number,
  role: 'user' | 'ai',
  content: string
): MessageItem {
  const isUser = role === 'user';
  return {
    key,
    role,
    placement: isUser ? 'end' : 'start',
    content,
    avatar: isUser
      ? 'https://avatars.githubusercontent.com/u/76239030?v=4'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '24px',
    avatarGap: '12px',
    shape: 'corner',
    variant: isUser ? 'outlined' : 'filled'
  };
}

function createBatch(label: string, startRole: 'ai' | 'user'): MessageItem[] {
  const batch: MessageItem[] = [];
  for (let i = 0; i < PAGE_SIZE; i++) {
    const role =
      startRole === 'ai'
        ? i % 2 === 0
          ? 'ai'
          : 'user'
        : i % 2 === 0
          ? 'user'
          : 'ai';
    const step = i + 1;
    batch.push(
      createMessage(
        nextKey + i + 1,
        role,
        role === 'user'
          ? `${label} 用户消息 ${step}：用于验证滚动位置、回底按钮和分页触发。`
          : `${label} AI 回复 ${step}：这条消息会刻意保持不同长度，用来验证变高气泡与自动跟随是否稳定。`.repeat(
              step % 3 === 0 ? 2 : 1
            )
      )
    );
  }
  return batch;
}

function buildSeedList(): MessageItem[] {
  const list: MessageItem[] = [];
  for (let i = 0; i < 16; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    list.push(
      createMessage(
        i + 1,
        role,
        role === 'ai' ? `初始 AI 消息 ${i + 1}` : `初始用户消息 ${i + 1}`
      )
    );
  }
  nextKey = list.length;
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  historyBatchCount.value = 0;
  bottomBatchCount.value = 0;
  topTriggerCount.value = 0;
  bottomTriggerCount.value = 0;
  topLoading.value = false;
  bottomLoading.value = false;
  lastAction.value =
    '手动滚动到顶部触发历史加载，回到底部继续向下滚动可触发更多消息。';
  return list;
}

function resetConversation() {
  bubbleItems.value = buildSeedList();
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

// ---- 边界状态计算 ----
const topStatus = computed<BubbleListBoundaryState | null>(() => {
  if (topLoading.value)
    return { type: 'loading', text: '正在加载更早的历史消息...' };
  if (historyBatchCount.value >= MAX_HISTORY_BATCHES)
    return { type: 'no-more', text: '历史消息已经全部加载完毕' };
  return null;
});

const bottomStatus = computed<BubbleListBoundaryState | null>(() => {
  if (bottomLoading.value)
    return { type: 'loading', text: '正在加载更多消息...' };
  if (bottomBatchCount.value >= MAX_BOTTOM_BATCHES)
    return { type: 'no-more', text: '已经展示全部可加载消息' };
  return null;
});

// ---- 分页事件处理 ----
function handleLoadMoreTop() {
  topTriggerCount.value += 1;
  if (topLoading.value) return;

  topLoading.value = true;
  const n = historyBatchCount.value + 1;

  topTimer = window.setTimeout(() => {
    if (historyBatchCount.value >= MAX_HISTORY_BATCHES) {
      lastAction.value = '顶部历史消息已全部加载完毕。';
      topLoading.value = false;
      topTimer = null;
      bubbleListRef.value?.loadMoreTopComplete();
      return;
    }

    const items = createBatch(`历史批次 ${n}`, n % 2 === 0 ? 'user' : 'ai');
    nextKey += items.length;
    bubbleItems.value = [...items, ...bubbleItems.value];
    historyBatchCount.value = n;
    topLoading.value = false;
    lastAction.value = `顶部加载完成：已插入历史批次 ${n}。`;
    topTimer = null;
    nextTick(() => {
      bubbleListRef.value?.loadMoreTopComplete();
    });
  }, 600);
}

function handleLoadMoreBottom() {
  bottomTriggerCount.value += 1;
  if (bottomLoading.value) return;

  bottomLoading.value = true;
  const n = bottomBatchCount.value + 1;

  bottomTimer = window.setTimeout(() => {
    if (bottomBatchCount.value >= MAX_BOTTOM_BATCHES) {
      lastAction.value = '底部更多消息已全部加载完毕。';
      bottomLoading.value = false;
      bottomTimer = null;
      bubbleListRef.value?.loadMoreBottomComplete();
      return;
    }

    const items = createBatch(`底部批次 ${n}`, n % 2 === 0 ? 'ai' : 'user');
    nextKey += items.length;
    bubbleItems.value = [...bubbleItems.value, ...items];
    bottomBatchCount.value = n;
    bottomLoading.value = false;
    lastAction.value = `底部加载完成：已追加批次 ${n}。`;
    bottomTimer = null;
    nextTick(() => {
      bubbleListRef.value?.loadMoreBottomComplete();
    });
  }, 600);
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}
function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

onMounted(() => {
  resetConversation();
});
onUnmounted(() => {
  if (topTimer) window.clearTimeout(topTimer);
  if (bottomTimer) window.clearTimeout(bottomTimer);
});
</script>

<template>
  <div class="bidirectional-demo">
    <div class="tip-banner">
      <span class="tip-icon">↕</span>
      <span
        >先<strong>向上滚动</strong>到顶部触发历史加载，再<strong>向下滚动</strong>到底部触发更多消息。观察边界状态区的
        loading → no-more 切换。</span
      >
    </div>

    <div class="toolbar-group">
      <div class="btn-list">
        <el-button
          size="small"
          type="primary"
          plain
          @click="bubbleListRef?.scrollToTop()"
        >
          滚到顶部
        </el-button>
        <el-button
          size="small"
          type="primary"
          plain
          @click="bubbleListRef?.scrollToBottom()"
        >
          滚到底部
        </el-button>
        <el-button size="small" type="info" plain @click="resetConversation">
          重置数据
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-chip">
        <span>滚动状态</span
        ><strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-chip">
        <span>未读计数</span><strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-chip">
        <span>顶部触发次数</span><strong>{{ topTriggerCount }}</strong>
      </div>
      <div class="status-chip">
        <span>底部触发次数</span><strong>{{ bottomTriggerCount }}</strong>
      </div>
      <div class="status-chip">
        <span>历史批次</span
        ><strong>{{ historyBatchCount }}/{{ MAX_HISTORY_BATCHES }}</strong>
      </div>
      <div class="status-chip">
        <span>底部批次</span
        ><strong>{{ bottomBatchCount }}/{{ MAX_BOTTOM_BATCHES }}</strong>
      </div>
    </div>

    <div class="activity-bar">
      <span>最近动作</span><strong>{{ lastAction }}</strong>
      <small>
        顶部加载中：{{ topLoading ? '是' : '否' }}，底部加载中：{{
          bottomLoading ? '是' : '否'
        }}</small
      >
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :top-status="topStatus"
        :bottom-status="bottomStatus"
        @load-more-top="handleLoadMoreTop"
        @load-more-bottom="handleLoadMoreBottom"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #topStatus="{ status }">
          <div class="edge-status" :data-state="status.type">
            <span class="edge-status__dot" /><span>{{ status.text }}</span>
          </div>
        </template>

        <template #bottomStatus="{ status }">
          <div class="edge-status" :data-state="status.type">
            <span class="edge-status__dot" /><span>{{ status.text }}</span>
          </div>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bidirectional-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;

  .tip-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #f0f9eb 0%, #ecf5ff 100%);
    border: 1px solid #e1f3d8;
    font-size: 13px;
    color: #67c23a;
    .tip-icon {
      font-size: 18px;
      font-weight: 700;
    }
    strong {
      color: #303133;
    }
  }

  .toolbar-group {
    min-height: 0;
  }
  .btn-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #dbeafe;
    span {
      font-size: 12px;
      color: #64748b;
      line-height: 1;
    }
    strong {
      font-size: 13px;
      color: #0f172a;
      line-height: 1;
      &.state-at_bottom {
        color: #67c23a;
      }
      &.state-scrolled_up {
        color: #e6a23c;
      }
      &.state-has_new_messages {
        color: #f56c6c;
      }
    }
  }

  .activity-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;
    span {
      font-size: 12px;
      color: #64748b;
    }
    strong {
      font-size: 13px;
      color: #1e3a8a;
    }
    small {
      color: #64748b;
      font-size: 12px;
      margin-left: 4px;
    }
  }

  .story-stage {
    min-height: 520px;
    height: 520px;
    padding: 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
  }

  .story-stage :deep(.elx-bubble-list) {
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1 1 0;
    overflow: hidden;
  }
}

.edge-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.24);
  font-size: 13px;
  color: #475569;
  &[data-state='loading'] {
    color: #1d4ed8;
  }
  &[data-state='no-more'] {
    color: #64748b;
  }
}
.edge-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.8;
}
</style>

```

### customized

```vue
<docs>
---
title: 插槽自定义
---

通过 9 个插槽完全接管列表渲染：`#avatar`、`#header`、`#content`、`#footer`、`#loading` 控制每条气泡的各部分；`#backToBottom` 自定义回底按钮（含未读角标）；`#topStatus` / `#bottomStatus` 自定义边界状态区；`#item` 渲染非气泡类型节点。
</docs>

<script setup lang="ts">
import type {
  BubbleListBoundaryState,
  BubbleListItemProps,
  BubbleListProps
} from 'vue-element-plus-x/types/BubbleList';
import {
  ArrowDown,
  Bell,
  Bottom,
  DocumentCopy,
  Refresh,
  Search,
  Star,
  Top
} from '@element-plus/icons-vue';

type listType = BubbleListItemProps & {
  key: number;
  role: 'user' | 'ai' | 'system';
};

// 示例调用
const bubbleItems = ref<BubbleListProps<listType>['list']>(
  generateFakeItems(16)
);
const avatar = ref('https://avatars.githubusercontent.com/u/76239030?v=4');
const avartAi = ref(
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
);
const switchValue = ref(false);
const loading = ref(false);

// 边界状态（用于 topStatus / bottomStatus 插槽）
const topStatus = ref<BubbleListBoundaryState | null>(null);
const bottomStatus = ref<BubbleListBoundaryState | null>(null);

function generateFakeItems(count: number): listType[] {
  const messages: listType[] = [];
  for (let i = 0; i < count; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    const placement = role === 'ai' ? 'start' : 'end';
    const key = i + 1;
    messages.push({
      key,
      role,
      placement,
      noStyle: true // 如果你不想用默认的气泡样式
    });
  }
  return messages;
}

// 设置某个 item 的 loading
function setLoading(loading: boolean) {
  bubbleItems.value[bubbleItems.value.length - 1].loading = loading;
  bubbleItems.value[bubbleItems.value.length - 2].loading = loading;
}

/** 插入一条系统通知（走 #item 插槽） */
function addNotice() {
  bubbleItems.value.push({
    key: bubbleItems.value.length + 1,
    role: 'system',
    placement: 'start',
    type: 'notice'
  } as listType);
}

/** 模拟顶部加载更多 */
function triggerTopLoad() {
  topStatus.value = { type: 'loading', text: '正在加载更早的消息...' };
  setTimeout(() => {
    bubbleItems.value.unshift(
      { key: Date.now(), role: 'ai', placement: 'start', noStyle: true },
      { key: Date.now() + 1, role: 'user', placement: 'end', noStyle: true }
    );
    topStatus.value = null;
  }, 1500);
}

/** 模拟底部加载更多 */
function triggerBottomLoad() {
  bottomStatus.value = { type: 'loading', text: '正在加载更多消息...' };
  setTimeout(() => {
    bubbleItems.value.push({
      key: Date.now(),
      role: 'ai',
      placement: 'start',
      noStyle: true
    });
    bottomStatus.value = null;
  }, 1500);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <!-- 控制区 -->
    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
      <span>动态设置内容 <el-switch v-model="switchValue" /></span>
      <span
        >自定义 loading
        <el-switch
          v-model="loading"
          @change="(value: any) => setLoading(value as boolean)"
        />
      </span>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
      <el-button type="primary" @click="addNotice">
        + 系统通知（#item）
      </el-button>
      <el-button type="primary" :icon="Top" @click="triggerTopLoad">
        顶部加载
      </el-button>
      <el-button type="primary" :icon="Bottom" @click="triggerBottomLoad">
        底部加载
      </el-button>
      <el-button @click="() => bubbleItems.unshift(...generateFakeItems(3))">
        +3 条消息（便于观察回底按钮）
      </el-button>
    </div>

    <div class="story-stage">
      <BubbleList
        :list="bubbleItems"
        :top-status="topStatus"
        :bottom-status="bottomStatus"
        show-back-button
      >
        <!-- ====== 1. #avatar 自定义头像 ====== -->
        <template #avatar="{ item }">
          <div class="avatar-wrapper">
            <img :src="item.role === 'ai' ? avartAi : avatar" alt="avatar" />
          </div>
        </template>

        <!-- ====== 2. #header 自定义头部 ====== -->
        <template #header="{ item }">
          <div class="header-wrapper">
            <div class="header-name">
              {{ item.role === 'ai' ? 'Element Plus X 🍧' : '🧁 用户' }}
            </div>
          </div>
        </template>

        <!-- ====== 3. #content 自定义气泡内容 ====== -->
        <template #content="{ item }">
          <div class="content-wrapper">
            <div class="content-text">
              {{
                item.role === 'ai'
                  ? `${switchValue ? `#ai-${item.key}：` : ''} 💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~`
                  : `${switchValue ? `#user-${item.key}：` : ''}哈哈哈，让我试试`
              }}
            </div>
          </div>
        </template>

        <!-- ====== 4. #footer 自定义底部操作栏 ====== -->
        <template #footer="{ item }">
          <div class="footer-wrapper">
            <div class="footer-container">
              <el-button type="info" :icon="Refresh" size="small" circle />
              <el-button type="success" :icon="Search" size="small" circle />
              <el-button type="warning" :icon="Star" size="small" circle />
              <el-button
                color="#626aef"
                :icon="DocumentCopy"
                size="small"
                circle
              />
            </div>
            <div class="footer-time">
              {{ item.role === 'ai' ? '下午 2:32' : '下午 2:33' }}
            </div>
          </div>
        </template>

        <!-- ====== 5. #loading 自定义加载动画 ====== -->
        <template #loading="{ item }">
          <div class="loading-container">
            <span>#{{ item.role }}-{{ item.key }}：</span>
            <span>我</span>
            <span>是</span>
            <span>自</span>
            <span>定</span>
            <span>义</span>
            <span>加</span>
            <span>载</span>
            <span>内</span>
            <span>容</span>
            <span>哦</span>
            <span>~</span>
          </div>
        </template>

        <!-- ====== 6. #backToBottom 自定义回底按钮（含未读角标） ====== -->
        <template #backToBottom="{ unreadCount: uc, scrollToBottom }">
          <div class="custom-back-btn" @click="scrollToBottom(false)">
            <el-icon :size="14">
              <ArrowDown />
            </el-icon>
            <span>{{ uc > 0 ? `${uc} 条新消息` : '回到底部' }}</span>
            <span v-if="uc > 0" class="unread-badge">{{
              uc > 99 ? '99+' : uc
            }}</span>
          </div>
        </template>

        <!-- ====== 7. #topStatus 自定义顶部边界状态 ====== -->
        <template #topStatus="{ status }">
          <div class="boundary-custom boundary-top">
            <el-icon
              v-if="status.type === 'loading'"
              class="is-loading"
              :size="14"
            >
              <Refresh />
            </el-icon>
            <span>{{ status.text || `顶部 ${status.type}` }}</span>
            <el-tag size="small" type="info" effect="plain">
              #topStatus
            </el-tag>
          </div>
        </template>

        <!-- ====== 8. #bottomStatus 自定义底部边界状态 ====== -->
        <template #bottomStatus="{ status }">
          <div class="boundary-custom boundary-bottom">
            <el-icon
              v-if="status.type === 'loading'"
              class="is-loading"
              :size="14"
            >
              <Refresh />
            </el-icon>
            <span>{{ status.text || `底部 ${status.type}` }}</span>
            <el-tag size="small" type="info" effect="plain">
              #bottomStatus
            </el-tag>
          </div>
        </template>

        <!-- ====== 9. #item 非气泡类型自定义渲染 ====== -->
        <template #item="{ index, itemType }">
          <div class="custom-notice-item">
            <el-icon :size="16" color="#e6a23c">
              <Bell />
            </el-icon>
            <span
              >[{{ itemType }}] 系统通知 — 这是通过 #item
              插槽自定义渲染的内容（index={{ index }}）</span
            >
          </div>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="less">
.story-stage {
  height: 450px;
  padding: 8px 10px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* ── 1. avatar ── */
.avatar-wrapper {
  width: 40px;
  height: 40px;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

/* ── 2. header ── */
.header-wrapper {
  .header-name {
    font-size: 14px;
    color: #979797;
  }
}

/* ── 3. content ── */
.content-wrapper {
  .content-text {
    font-size: 14px;
    color: #333;
    padding: 12px;
    background: linear-gradient(to right, #fdfcfb 0%, #ffd1ab 100%);
    border-radius: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

/* ── 4. footer ── */
.footer-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  .footer-time {
    font-size: 12px;
    margin-top: 3px;
  }
}

.footer-container {
  :deep(.el-button + .el-button) {
    margin-left: 8px;
  }
}

/* ── 5. loading ── */
.loading-container {
  font-size: 14px;
  color: #333;
  padding: 12px;
  background: linear-gradient(to right, #fdfcfb 0%, #ffd1ab 100%);
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-container span {
  display: inline-block;
  margin-left: 8px;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(5px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.loading-container span:nth-child(4n) {
  animation: bounce 1.2s ease infinite;
}
.loading-container span:nth-child(4n + 1) {
  animation: bounce 1.2s ease infinite;
  animation-delay: 0.3s;
}
.loading-container span:nth-child(4n + 2) {
  animation: bounce 1.2s ease infinite;
  animation-delay: 0.6s;
}
.loading-container span:nth-child(4n + 3) {
  animation: bounce 1.2s ease infinite;
  animation-delay: 0.9s;
}

/* ── 6. backToBottom 自定义回底按钮 ── */
.custom-back-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: all 0.25s ease;
  user-select: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(102, 126, 234, 0.55);
  }
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #f56c6c;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  animation: badge-pulse 1.5s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.55);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(245, 108, 108, 0);
  }
}

/* ── 7 & 8. topStatus / bottomStatus ── */
.boundary-custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #606266;

  &.boundary-top {
    background: linear-gradient(90deg, #ecf5ff 0%, transparent 100%);
    border: 1px dashed #b3d8ff;
  }

  &.boundary-bottom {
    background: linear-gradient(90deg, transparent 0%, #ecf5ff 100%);
    border: 1px dashed #b3d8ff;
  }

  .el-icon {
    color: #409eff;
  }
}

/* ── 9. item 非气泡自定义项 ── */
.custom-notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  margin: 4px 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #fdf6ec 0%, #faecd8 100%);
  border-left: 3px solid #e6a23c;
  font-size: 13px;
  color: #996633;
}
</style>

```

### fog-effect

```vue
<docs>
---
title: 雾化效果
---

通过 `enable-animate` 属性实现打字机雾化效果，模拟 AI 流式输出场景。
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

const STREAM_TICK_MS = 50;
const STREAM_CHARS_PER_TICK = 6;

const list = ref([
  {
    key: '1',
    content: '你好！请帮我介绍一下 BubbleList 的雾化效果。',
    placement: 'end' as const,
    avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
    role: 'user'
  },
  {
    key: '2',
    content: '',
    placement: 'start' as const,
    avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
    role: 'ai'
  }
]);

const isStreaming = ref(false);
let streamTimer: number | null = null;
let streamCharacters: string[] = [];
let streamOffset = 0;

const fullMarkdown = `### 雾化效果介绍

**雾化效果**（Fog / Animate）是 \`x-markdown-vue\` 的 \`MarkdownRenderer\` 提供的一种平滑过渡动画：

- 新增文字以**渐显**方式出现，而非生硬地追加
- 配合流式输出，能模拟 AI **逐段回复**的视觉体验
- 仅需设置 \`enable-animate\` 即可开启

#### 代码示例

\`\`\`vue
<MarkdownRenderer
  :markdown="content"
  :enable-animate="true"
/>
\`\`\`

#### 公式支持

行内公式 $E = mc^2$，块级公式同样适用：

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

> 提示：雾化效果在流式场景下体验最佳，配合 BubbleList 自动追底使用更流畅。`;

function startStreaming() {
  if (isStreaming.value) return;

  // 重置 AI 消息
  list.value[1].content = '';
  streamOffset = 0;
  streamCharacters = Array.from(fullMarkdown);

  const initialChunk = streamCharacters
    .slice(0, STREAM_CHARS_PER_TICK)
    .join('');
  streamOffset = initialChunk.length;
  list.value[1].content = initialChunk;
  isStreaming.value = true;

  streamTimer = window.setInterval(() => {
    if (streamOffset >= streamCharacters.length) {
      stopStreaming();
      return;
    }
    const nextChunk = streamCharacters
      .slice(streamOffset, streamOffset + STREAM_CHARS_PER_TICK)
      .join('');
    list.value[1].content += nextChunk;
    streamOffset += nextChunk.length;

    if (streamOffset >= streamCharacters.length) {
      stopStreaming();
    }
  }, STREAM_TICK_MS);
}

function stopStreaming() {
  if (streamTimer !== null) {
    window.clearInterval(streamTimer);
    streamTimer = null;
  }
  isStreaming.value = false;
}

function resetStreaming() {
  stopStreaming();
  list.value[1].content = '';
}

onMounted(() => {
  startStreaming();
});

onUnmounted(() => {
  stopStreaming();
});
</script>

<template>
  <div class="fog-demo-container">
    <div class="btn-list">
      <el-button type="primary" :disabled="isStreaming" @click="startStreaming">
        开始流式输出
      </el-button>
      <el-button :disabled="!isStreaming" @click="stopStreaming">
        停止
      </el-button>
      <el-button @click="resetStreaming"> 重置 </el-button>
    </div>

    <div class="list-stage">
      <BubbleList :list="list" max-height="420px">
        <template #content="{ item }">
          <div v-if="item.role === 'ai'" class="markdown-content-wrapper">
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer"
              :markdown="item.content || ''"
              :enable-animate="true"
            />
            <pre v-else>{{ item.content }}</pre>
          </div>
          <span v-else>{{ item.content }}</span>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fog-demo-container {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .btn-list {
    display: flex;
    gap: 12px;
  }

  .list-stage {
    height: 420px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
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
  }

  :deep(ul) {
    list-style-type: disc;
  }

  :deep(li) {
    margin: 4px 0;
    line-height: 1.6;
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
      monospace;
    font-size: 85%;
  }

  :deep(blockquote) {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 8px 0;
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
</style>

```

### list

```vue
<docs>
---
title: 基础使用
---

通过 `list` 数组快速渲染一组对话气泡。数组中每个对象会透传给内置的 `Bubble` 组件，`Bubble` 的所有属性（`content`、`placement`、`loading`、`shape`、`variant` 等）都可以直接配置，消息的增删改只需维护这个数组即可。

::: tip
通过 `max-height` 属性或父容器高度控制列表高度，内容溢出时自动出现滚动条。每个 item 的详细属性可参考 [Bubble 文档](/zh/components/bubble)。
:::
</docs>

<script setup lang="ts">
import type {
  BubbleListItemProps,
  BubbleListProps
} from 'vue-element-plus-x/types/BubbleList';

type listType = BubbleListItemProps & {
  key: number;
  role: 'user' | 'ai';
  isMarkdown?: boolean;
  typing?: boolean;
  isFog?: boolean;
};

// 示例调用
const list: BubbleListProps<listType>['list'] = generateFakeItems(5);

function generateFakeItems(count: number): listType[] {
  const messages: listType[] = [];
  for (let i = 0; i < count; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    const placement = role === 'ai' ? 'start' : 'end';
    const key = i + 1;
    const content =
      role === 'ai'
        ? '💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~'.repeat(
            5
          )
        : `哈哈哈，让我试试`;
    const loading = false;
    const shape = 'corner';
    const variant = role === 'ai' ? 'filled' : 'outlined';
    const isMarkdown = false;
    const typing = role === 'ai' ? i === count - 1 : false;
    const avatar =
      role === 'ai'
        ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        : 'https://avatars.githubusercontent.com/u/76239030?v=4';

    messages.push({
      key, // 唯一标识
      role, // user | ai 自行更据模型定义
      placement, // start | end 气泡位置
      content, // 消息内容 流式接受的时候，只需要改这个值即可
      loading, // 当前气泡的加载状态
      shape, // 气泡的形状
      variant, // 气泡的样式
      isMarkdown, // 是否渲染为 markdown
      typing, // 是否开启打字器效果 该属性不会和流式接受冲突
      isFog: role === 'ai', // 是否开启打字雾化效果，该效果 v1.1.6 新增，且在 typing 为 true 时生效，该效果会覆盖 typing 的 suffix 属性
      avatar,
      avatarSize: '24px', // 头像占位大小
      avatarGap: '12px' // 头像与气泡之间的距离
    });
  }
  return messages;
}
</script>

<template>
  <div class="story-stage">
    <BubbleList :list="list" />
  </div>
</template>

<style scoped lang="scss">
.story-stage {
  height: 450px;
  padding: 8px 10px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
</style>

```

### mixed-nodes

```vue
<docs>
---
title: 混合节点（#item 插槽）
---

列表中除气泡消息外，可以混入任意类型的节点（日期分隔线、系统提示、历史加载标记等）。通过 `itemType` 属性或解析函数标记非气泡节点，命中后走 `#item` 插槽渲染，普通消息仍走默认 Bubble。

插槽上下文 `{ item, index, itemType }` 用于区分节点类型，渲染不同 UI。虚拟滚动中特殊节点的高度同样会自动测量。
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListItemContext,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface TimelineItem {
  key: number;
  role: 'user' | 'ai' | 'system';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
  avatarSize?: string;
  itemType?: 'date-divider' | 'history-divider' | 'system-tip';
  tone?: 'info' | 'success' | 'warning';
  noStyle?: boolean;
}

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<TimelineItem[]>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
let nextKey = 0;

function createMessage(
  key: number,
  role: 'user' | 'ai',
  content: string
): TimelineItem {
  const isUser = role === 'user';
  return {
    key,
    role,
    placement: isUser ? 'end' : 'start',
    content,
    avatar: isUser
      ? 'https://avatars.githubusercontent.com/u/76239030?v=4'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '32px',
    noStyle: false
  };
}

function createNode(
  itemType: TimelineItem['itemType'],
  content: string,
  tone: TimelineItem['tone'] = 'info'
): TimelineItem {
  nextKey += 1;
  return {
    key: nextKey,
    role: 'system',
    itemType,
    tone,
    content,
    placement: 'start',
    avatar: '',
    noStyle: true
  };
}

function buildInitialList(): TimelineItem[] {
  const base: TimelineItem[] = [];
  for (let i = 0; i < 6; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    base.push(
      createMessage(
        i + 1,
        role,
        role === 'ai'
          ? `初始 AI 消息 ${i + 1}：用于验证混合节点的滚动稳定性。`
          : `初始用户消息 ${i + 1}`
      )
    );
  }

  nextKey = base.length;
  base.splice(2, 0, createNode('history-divider', '以上为历史消息', 'info'));
  base.splice(
    6,
    0,
    createNode('date-divider', '2026 年 4 月 16 日 14:30', 'success')
  );
  base.push(
    createNode(
      'system-tip',
      '系统提示：当前会话已切换到新的回答策略。',
      'warning'
    )
  );

  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  return base;
}

function resetConversation() {
  bubbleItems.value = buildInitialList();
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function appendAiMessage() {
  bubbleItems.value.push(
    createMessage(
      ++nextKey,
      'ai',
      'AI 继续回复：验证特殊节点夹在普通消息之间时，自动滚底和未读计数是否准确。'
    )
  );
}

function appendDateDivider() {
  bubbleItems.value.push(
    createNode(
      'date-divider',
      `2026 年 4 月 16日 ${String(15 + (nextKey % 9))}:${String(nextKey % 60).padStart(2, '0')}`,
      'success'
    )
  );
}

function appendHistoryDivider() {
  bubbleItems.value.push(
    createNode('history-divider', '已切换到另一段历史消息', 'info')
  );
}

function appendSystemTip() {
  bubbleItems.value.push(
    createNode(
      'system-tip',
      '系统提示：模型正在整理更长的上下文，请稍候。',
      'warning'
    )
  );
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}
function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

function resolveToneClass(context: BubbleListItemContext<TimelineItem>) {
  if (context.itemType === 'date-divider') return 'is-success';
  return context.item.tone === 'warning' ? 'is-warning' : 'is-info';
}

onMounted(() => {
  resetConversation();
});
</script>

<template>
  <div class="mixed-nodes-demo">
    <div class="demo-note">
      <div class="demo-title">混合节点 / 统一 item 插槽</div>
      <p>
        普通消息继续使用默认 Bubble 渲染；当 item 中包含特殊标识符时，统一走
        <code>#item</code> 插槽。
        这里演示日期节点、历史分隔节点和系统提示节点共存于同一条时间线里。
      </p>
    </div>

    <div class="toolbar-group">
      <div class="btn-list">
        <el-button type="primary" plain @click="appendAiMessage">
          追加 AI 消息
        </el-button>
        <el-button type="success" plain @click="appendDateDivider">
          插入日期节点
        </el-button>
        <el-button type="info" plain @click="appendHistoryDivider">
          插入历史分隔
        </el-button>
        <el-button type="warning" plain @click="appendSystemTip">
          插入系统提示
        </el-button>
        <el-button type="info" plain @click="resetConversation">
          重置时间线
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-card">
        <span>滚动状态</span
        ><strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-card">
        <span>未读计数</span><strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-card">
        <span>节点总数</span><strong>{{ bubbleItems.length }}</strong>
      </div>
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #item="context">
          <div class="timeline-node" :class="[resolveToneClass(context)]">
            <div
              v-if="context.itemType === 'history-divider'"
              class="timeline-node__history-wrap"
            >
              <span class="timeline-node__line" /><span
                class="timeline-node__text"
                >{{ context.item.content }}</span
              ><span class="timeline-node__line" />
            </div>
            <span
              v-else-if="context.itemType === 'date-divider'"
              class="timeline-node__pill"
              >{{ context.item.content }}</span
            >
            <div v-else class="timeline-node__system-wrap">
              <span class="timeline-node__icon">i</span
              ><span class="timeline-node__text">{{
                context.item.content
              }}</span>
            </div>
          </div>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mixed-nodes-demo {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .demo-note {
    padding: 14px 16px;
    border-radius: 14px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;
    p {
      margin: 8px 0 0;
      color: #475569;
      line-height: 1.6;
    }
    code {
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.06);
      font-family: ui-monospace, monospace;
      font-size: 12px;
    }
  }

  .demo-title {
    font-weight: 700;
    color: #1e3a8a;
    font-size: 15px;
  }
  .toolbar-group {
    display: grid;
    gap: 10px;
  }
  .btn-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .status-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }

  .status-card {
    display: grid;
    gap: 4px;
    padding: 10px 14px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    span {
      font-size: 12px;
      color: #64748b;
    }
    strong {
      font-size: 14px;
      color: #0f172a;
      &.state-at_bottom {
        color: #67c23a;
      }
      &.state-scrolled_up {
        color: #e6a23c;
      }
      &.state-has_new_messages {
        color: #f56c6c;
      }
    }
  }

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
}

.timeline-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 40px;
  color: #475569;
}
.timeline-node__history-wrap,
.timeline-node__system-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.timeline-node__line {
  flex: 1;
  max-width: 120px;
  height: 1px;
  background: currentColor;
  opacity: 0.25;
}
.timeline-node__pill,
.timeline-node__text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.24);
  text-align: center;
}
.timeline-node__icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: currentColor;
  color: #fff;
}
.is-info {
  color: #475569;
}
.is-success {
  color: #0f766e;
}
.is-warning {
  color: #b45309;
}
</style>

```

### scroll-to

```vue
<docs>
---
title: 滚动控制方法
---

通过组件实例的三个方法精确控制滚动位置：`scrollToTop()`、`scrollToBottom()`、`scrollToBubble(index)`，均支持传入 `smooth` 参数控制是否平滑滚动。

同时暴露 `currentScrollState` 和 `currentUnreadCount` 实例属性，也可监听 `@scroll-state-change` / `@unread-count-change` 事件实时感知状态（`AT_BOTTOM` / `SCROLLED_UP` / `HAS_NEW_MESSAGES`）。
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface listType {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  loading: boolean;
  shape: string;
  variant: string;
  avatar: string;
  avatarSize: string;
}

const bubbleItems = ref<listType[]>([]);
const bubbleListRef = ref<BubbleListInstance | null>(null);
const targetIndex = ref(0);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const autoScrollEnabled = ref(true);
let nextKey = 0;

function generateFakeItems(count: number): listType[] {
  const messages: listType[] = [];
  for (let i = 0; i < count; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    const placement = role === 'ai' ? 'start' : 'end';
    const key = i + 1;
    const content =
      role === 'ai'
        ? '💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~'
        : `哈哈哈，让我试试`;
    messages.push({
      key,
      role,
      placement,
      content,
      loading: false,
      shape: 'corner',
      variant: role === 'ai' ? 'filled' : 'outlined',
      avatar:
        role === 'ai'
          ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          : 'https://avatars.githubusercontent.com/u/76239030?v=4',
      avatarSize: '32px'
    });
  }
  return messages;
}

function createMessage(role: 'user' | 'ai', content: string): listType {
  nextKey += 1;
  const isUser = role === 'user';
  return {
    key: nextKey,
    role,
    placement: isUser ? 'end' : 'start',
    content,
    loading: false,
    shape: 'corner',
    variant: isUser ? 'outlined' : 'filled',
    avatar: isUser
      ? 'https://avatars.githubusercontent.com/u/76239030?v=4'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '32px'
  };
}

function resetConversation() {
  bubbleItems.value = generateFakeItems(10);
  nextKey = bubbleItems.value.length;
  targetIndex.value = Math.max(bubbleItems.value.length - 1, 0);
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function addMessage() {
  const i = bubbleItems.value.length;
  const isUser = !!(i % 2);
  const content = isUser
    ? '哈哈哈，让我试试'
    : '💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~'.repeat(2);
  const msg = createMessage(isUser ? 'user' : 'ai', content);
  bubbleItems.value.push(msg);
  targetIndex.value = bubbleItems.value.length - 1;
}

function addUserMessage() {
  const msg = createMessage(
    'user',
    `用户补充问题 ${nextKey + 1}：请继续展开交互场景。`
  );
  bubbleItems.value.push(msg);
  targetIndex.value = bubbleItems.value.length - 1;
}

function addAiMessage() {
  const msg = createMessage(
    'ai',
    `AI 最新回复 ${nextKey + 1}：验证 autoScroll 开启时，消息自动滚动到底部。关闭后改为累计未读并显示回底按钮。`.repeat(
      (nextKey % 2) + 1
    )
  );
  bubbleItems.value.push(msg);
  targetIndex.value = bubbleItems.value.length - 1;
}

function addBurstMessages() {
  bubbleItems.value.push(
    createMessage('user', '连续追加：先插入一条短消息，观察列表锚点是否稳定。')
  );
  bubbleItems.value.push(
    createMessage(
      'ai',
      '第二条刻意拉长内容，验证多条消息一起追加时的滚动与动态高度表现。'.repeat(
        2
      )
    )
  );
  bubbleItems.value.push(
    createMessage('ai', '第三条保持较短，便于手动观察滚动位置是否贴底。')
  );
  targetIndex.value = bubbleItems.value.length - 1;
}

function clearMessage() {
  bubbleItems.value = [];
  nextKey = 0;
}

function scrollToTop() {
  bubbleListRef.value?.scrollToTop();
}

function scrollBottom() {
  bubbleListRef.value?.scrollToBottom();
}

function scrollToBubble() {
  const index = Math.min(
    targetIndex.value,
    Math.max(bubbleItems.value.length - 1, 0)
  );
  bubbleListRef.value?.scrollToBubble(index);
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}

function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

onMounted(() => {
  resetConversation();
});
</script>

<template>
  <div class="component-container">
    <div class="tip-banner">
      <span class="tip-icon">i</span>
      <span>
        <strong>V2 自动追底规则</strong>：<code>autoScroll</code>
        开启时（默认），追加消息会自动触底，未读计数始终为 0。
        <br />
        如需体验<strong>未读角标 + 回底按钮</strong>，请先将下方开关<strong
          >关闭 autoScroll</strong
        >，再手动向上滚动后追加消息——视图不动、未读 +1、回底按钮浮现，这正是 V2
        状态机的核心体验。
      </span>
    </div>

    <div class="top-wrap">
      <div class="btn-list" style="align-items: center">
        <span style="font-size: 13px; color: #606266"> autoScroll： </span>
        <el-switch
          v-model="autoScrollEnabled"
          active-text="开启（自动追底）"
          inactive-text="关闭（累计未读）"
        />
      </div>
      <div class="btn-list">
        <el-button type="primary" plain @click="addMessage">
          添加对话
        </el-button>
        <el-button type="primary" plain @click="addUserMessage">
          追加用户消息
        </el-button>
        <el-button type="primary" plain @click="addAiMessage">
          追加 AI 消息
        </el-button>
        <el-button type="warning" plain @click="addBurstMessages">
          连续追加 3 条
        </el-button>
        <el-button type="danger" plain @click="clearMessage">
          清空对话列表
        </el-button>
        <el-button type="primary" plain @click="scrollToTop">
          滚动到顶部
        </el-button>
        <el-button type="success" plain @click="scrollBottom">
          滚动到底部
        </el-button>
        <el-input-number
          v-model="targetIndex"
          :min="0"
          :max="Math.max(bubbleItems.length - 1, 0)"
          controls-position="right"
          size="default"
        />
        <el-button type="primary" plain @click="scrollToBubble">
          滚到第{{ targetIndex }}个气泡
        </el-button>
        <el-button type="info" plain @click="resetConversation">
          重置会话
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-chip">
        <span>滚动状态</span>
        <strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-chip">
        <span>未读计数</span>
        <strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-chip">
        <span>消息总数</span>
        <strong>{{ bubbleItems.length }}</strong>
      </div>
      <div class="status-chip">
        <span>目标索引</span>
        <strong>{{ targetIndex }}</strong>
      </div>
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :auto-scroll="autoScrollEnabled"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.component-container {
  padding: 12px;

  .tip-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ecf5ff 0%, #f0f9eb 100%);
    border: 1px solid #d9ecff;
    margin-bottom: 16px;
    font-size: 13px;
    color: #409eff;

    .tip-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #409eff;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
  }

  .btn-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .top-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #e4e7ed;

    span {
      font-size: 12px;
      color: #909399;
    }

    strong {
      font-size: 14px;
      color: #303133;
    }

    .state-at_bottom {
      color: #67c23a;
    }

    .state-scrolled_up {
      color: #e6a23c;
    }

    .state-has_new_messages {
      color: #f56c6c;
    }
  }

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
}
</style>

```

### streaming-follow

```vue
<docs>
---
title: 流式跟随
---

`autoScroll` 开启（默认）时，流式输出内容变高会自动贴底。用户上滑后跟随中断，回到底部后自动恢复——无需任何额外配置。

::: tip 自定义追底策略
如需自定义跟随逻辑（例如只有本端消息才强制追底），可通过 `shouldFollowContent` 回调接管决策。回调参数中的 `reason` 字段告知本次触发来源：`own-message`（本端发送）、`streaming`（流式增量）、`new-message`（新追加消息）。
:::
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface MessageItem {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
  avatarSize?: string;
  avatarGap?: string;
  shape?: string;
  variant?: string;
}

const STREAM_TICK_MS = 50;
const STREAM_CHARS_PER_TICK = 6;
const STREAM_TOTAL_TICKS = 120;

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<MessageItem[]>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const isStreaming = ref(false);
const streamTick = ref(0);
const emittedCharCount = ref(0);
const streamCharTotal = ref(0);
const round = ref(1);
const lastAction = ref(
  '点击"开始流式回复"，然后上滑观察跟随中断，回到底部观察自动恢复。'
);

let nextKey = 0;
let streamCharacters: string[] = [];
let streamOffset = 0;
let streamTimer: number | null = null;

function createMessage(
  key: number,
  role: 'user' | 'ai',
  content: string
): MessageItem {
  const isUser = role === 'user';
  return {
    key,
    role,
    placement: isUser ? 'end' : 'start',
    content,
    avatar: isUser
      ? 'https://avatars.githubusercontent.com/u/76239030?v=4'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '24px',
    avatarGap: '12px',
    shape: 'corner',
    variant: isUser ? 'outlined' : 'filled'
  };
}

function buildStreamingChars(currentRound: number): string[] {
  const total = STREAM_CHARS_PER_TICK * STREAM_TOTAL_TICKS;
  const paragraphs = Array.from({ length: STREAM_TOTAL_TICKS }, (_, idx) => {
    return `第${currentRound}轮第${idx + 1}次增量输出，用来持续观察气泡内容变高时是否始终贴底，用户上滑后是否只累计未读而不打断阅读，重新回到底部以后是否立刻恢复自动跟随。`;
  });
  return Array.from(paragraphs.join('')).slice(0, total);
}

function stopStreaming(reason = '已停止流式回复。') {
  if (streamTimer !== null) {
    window.clearInterval(streamTimer);
    streamTimer = null;
  }
  isStreaming.value = false;
  lastAction.value = reason;
}

function buildSeedList(): MessageItem[] {
  const list: MessageItem[] = [];
  for (let i = 0; i < 14; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    list.push(
      createMessage(
        i + 1,
        role,
        role === 'ai'
          ? `预热 AI 消息 ${i + 1}：这是用于流式跟随验证的种子数据。`
          : `预热用户消息 ${i + 1}`
      )
    );
  }

  nextKey = list.length;
  round.value = 1;
  streamTick.value = 0;
  emittedCharCount.value = 0;
  streamCharTotal.value = 0;
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  isStreaming.value = false;
  lastAction.value =
    '点击"开始流式回复"，然后上滑观察跟随中断，回到底部观察自动恢复。';
  streamCharacters = [];
  streamOffset = 0;

  return list;
}

function resetConversation() {
  stopStreaming('已重置当前流式会话。');
  bubbleItems.value = buildSeedList();
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function startStreaming() {
  if (isStreaming.value) return;

  const currentRound = round.value;
  round.value += 1;
  streamTick.value = 0;
  emittedCharCount.value = 0;
  streamOffset = 0;

  // 先追加一条用户提问
  bubbleItems.value.push(
    createMessage(
      ++nextKey,
      'user',
      `第 ${currentRound} 轮提问：请总结 BubbleList 在流式输出与分页场景下的关键升级点。`
    )
  );

  // 准备流式字符
  streamCharacters = buildStreamingChars(currentRound);
  streamCharTotal.value = streamCharacters.length;

  // 初始 chunk
  const initialChunk = streamCharacters
    .slice(0, STREAM_CHARS_PER_TICK)
    .join('');
  streamOffset = initialChunk.length;
  emittedCharCount.value = streamOffset;
  streamTick.value = initialChunk.length > 0 ? 1 : 0;

  // 追加 AI 消息
  bubbleItems.value.push(createMessage(++nextKey, 'ai', initialChunk));

  isStreaming.value = true;
  lastAction.value = `流式输出进行中：每 ${STREAM_TICK_MS}ms 追加 ${STREAM_CHARS_PER_TICK} 个字，总量约 ${streamCharTotal.value} 字。`;

  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });

  // 定时追加
  streamTimer = window.setInterval(() => {
    const currentItem = bubbleItems.value[bubbleItems.value.length - 1];
    if (!currentItem || currentItem.role !== 'ai') {
      stopStreaming('流式消息已丢失，已终止当前模拟。');
      return;
    }

    if (
      streamOffset >= streamCharacters.length ||
      streamTick.value >= STREAM_TOTAL_TICKS
    ) {
      stopStreaming('流式输出完成。');
      return;
    }

    const nextChunk = streamCharacters
      .slice(streamOffset, streamOffset + STREAM_CHARS_PER_TICK)
      .join('');

    if (!nextChunk) {
      stopStreaming('流式输出完成。');
      return;
    }

    currentItem.content += nextChunk;
    streamOffset += nextChunk.length;
    emittedCharCount.value = streamOffset;
    streamTick.value += 1;

    if (
      streamOffset >= streamCharacters.length ||
      streamTick.value >= STREAM_TOTAL_TICKS
    ) {
      stopStreaming('流式输出完成。');
    }
  }, STREAM_TICK_MS);
}

function simulateInterrupt() {
  if (!bubbleListRef.value) return;
  bubbleListRef.value.scrollToTop(false);
  lastAction.value = '已滚动到顶部，新 chunk 将暂停跟随。回到底部后自动恢复。';
}

function resumeFollow() {
  bubbleListRef.value?.scrollToBottom(false);
  lastAction.value = '已回到底部（scrollToBottom），流式内容将持续跟随。';
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}
function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

onMounted(() => {
  resetConversation();
});
onUnmounted(() => {
  stopStreaming('');
});
</script>

<template>
  <div class="streaming-follow-demo">
    <div class="tip-banner">
      <span class="tip-icon">~</span>
      <span
        ><strong>核心体验流程</strong>：① 点"开始流式回复" → ② 等 AI 开始输出 →
        ③ <strong>向上滚动</strong>打断 → ④ 观察未读增加、列表不再跳动 → ⑤
        点"回到底部恢复" → ⑥ 观察后续 chunk 自动跟随</span
      >
    </div>

    <div class="toolbar-group">
      <div class="btn-list">
        <el-button
          size="small"
          type="primary"
          plain
          :disabled="isStreaming"
          @click="startStreaming"
        >
          开始流式回复
        </el-button>
        <el-button
          size="small"
          type="warning"
          plain
          :disabled="!isStreaming"
          @click="simulateInterrupt"
        >
          滚动到顶部（模拟上滑）
        </el-button>
        <el-button size="small" type="success" plain @click="resumeFollow">
          回到底部恢复
        </el-button>
        <el-button
          size="small"
          type="danger"
          plain
          :disabled="!isStreaming"
          @click="stopStreaming('已手动停止')"
        >
          停止流式回复
        </el-button>
        <el-button size="small" type="info" plain @click="resetConversation">
          重置会话
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-chip">
        <span>滚动状态</span
        ><strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-chip">
        <span>未读计数</span><strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-chip">
        <span>流式状态</span
        ><strong :class="isStreaming ? 'streaming' : ''">{{
          isStreaming ? '进行中' : '空闲'
        }}</strong>
      </div>
      <div class="status-chip">
        <span>当前轮次</span><strong>{{ Math.max(round - 1, 0) }}</strong>
      </div>
      <div class="status-chip">
        <span>已输出字符</span
        ><strong>{{ emittedCharCount }}/{{ streamCharTotal }}</strong>
      </div>
      <div class="status-chip">
        <span>运行 tick</span
        ><strong>{{ streamTick }}/{{ STREAM_TOTAL_TICKS }}</strong>
      </div>
    </div>

    <div class="activity-bar">
      <span>最近动作</span><strong>{{ lastAction }}</strong>
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.streaming-follow-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;

  .tip-banner {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #fef0f0 0%, #fdf6ec 100%);
    border: 1px solid #fde2e2;
    font-size: 13px;
    color: #f56c6c;
    line-height: 1.7;
    .tip-icon {
      font-size: 18px;
      line-height: 1;
      margin-top: 2px;
    }
    strong {
      color: #303133;
    }
  }

  .toolbar-group {
    min-height: 0;
  }
  .btn-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #dbeafe;
    span {
      font-size: 12px;
      color: #64748b;
      line-height: 1;
    }
    strong {
      font-size: 13px;
      color: #0f172a;
      line-height: 1;
      &.state-at_bottom {
        color: #67c23a;
      }
      &.state-scrolled_up {
        color: #e6a23c;
      }
      &.state-has_new_messages {
        color: #f56c6c;
      }
      &.streaming {
        color: #409eff;
        animation: blink 1.2s ease-in-out infinite;
      }
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }

  .activity-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;
    span {
      font-size: 12px;
      color: #64748b;
    }
    strong {
      font-size: 13px;
      color: #1e3a8a;
    }
  }

  .story-stage {
    min-height: 520px;
    height: 520px;
    padding: 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
  }

  .story-stage :deep(.elx-bubble-list) {
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1 1 0;
    overflow: hidden;
  }
}
</style>

```

### streaming-replace-sse-extreme

```vue
<docs>
---
title: 极端场景：动态插槽高度与自动触底压力测试
---

::: warning 复现目的
这个 demo 用来覆盖更极端的组合场景：在 `#header`、`#topStatus`、`#item` 这些不同插槽里同时放入会随流式内容增高、并在思考结束后 `auto-collapse` 的 `Thinking` 组件。

用于观察：当多个非正文区域出现高度突变时，`BubbleList` 的自动触底是否仍然稳定，尤其是非虚拟列表模式和高速 SSE 全量替换模式。
:::

操作建议：
1. 关闭虚拟列表，保持「全量替换」模式，输出速度拉满
2. 依次打开/关闭 `#header`、`#topStatus`、`#item` 压力开关，观察滚动状态
3. 对比开启虚拟列表后的表现
</docs>

<script setup lang="ts">
import type {
  BubbleListBoundaryState,
  BubbleListInstance,
  BubbleListItemProps,
  BubbleListProps,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';
import {
  defineComponent,
  h,
  onBeforeUnmount as vOnBeforeUnmount,
  onMounted as vOnMounted,
  ref as vRef
} from 'vue';

interface MessageItem extends BubbleListItemProps {
  key: number;
  role: 'user' | 'ai' | 'system';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
  itemType?: 'stress-thinking';
}

type ThinkingStatus = 'start' | 'thinking' | 'end';

interface ParsedThink {
  thinking: string;
  body: string;
  status: ThinkingStatus;
}

function parseThink(raw: string): ParsedThink {
  if (!raw) return { thinking: '', body: '', status: 'start' };

  const open = raw.indexOf('<think>');
  if (open < 0) return { thinking: '', body: raw, status: 'start' };

  const close = raw.indexOf('</think>', open + 7);
  if (close < 0) {
    return {
      thinking: raw.slice(open + 7),
      body: '',
      status: 'thinking'
    };
  }

  const thinking = raw.slice(open + 7, close);
  const body = (raw.slice(0, open) + raw.slice(close + 8)).replace(/^\s+/, '');
  return { thinking, body, status: 'end' };
}

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;

  // @ts-expect-error style entry is runtime-only in x-markdown-vue
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value =
    (mod as any).MarkdownRenderer ?? (mod as any).default ?? mod;
});

const MyEchartsBlock = defineComponent({
  name: 'SseExtremeEchartsBlock',
  props: {
    option: { type: Object, required: true }
  },
  setup(props) {
    const chartEl = vRef<HTMLDivElement>();
    let chart: any = null;
    let resizeObserver: ResizeObserver | null = null;

    vOnMounted(async () => {
      if (!chartEl.value) return;

      try {
        const echarts = await import('echarts');
        chart = echarts.init(chartEl.value);
        chart.setOption(props.option);
        resizeObserver = new ResizeObserver(() => chart?.resize());
        resizeObserver.observe(chartEl.value);
      } catch (e) {
        console.warn('[streaming-replace-sse-extreme] echarts init failed', e);
      }
    });

    vOnBeforeUnmount(() => {
      resizeObserver?.disconnect();
      chart?.dispose();
    });

    return () =>
      h('div', {
        ref: chartEl,
        style: 'width:100%;height:320px;margin:16px 0;'
      });
  }
});

function safeJsonParse(raw: string) {
  try {
    return { ok: true as const, value: JSON.parse(raw) };
  } catch {
    return { ok: false as const };
  }
}

const codeXRender = {
  'my-echarts': (props: any) => {
    const parsed = safeJsonParse(props.raw.content);
    if (parsed.ok) return h(MyEchartsBlock, { option: parsed.value });

    return h('div', { class: 'chart-loading' }, '图表数据加载中...');
  }
};

const CF = '``​`';

const LONG_THINKING_DETAIL = Array.from({ length: 36 }, (_, i) => {
  const area = ['青秀区', '兴宁区', '江南区', '西乡塘区', '良庆区', '邕宁区'][
    i % 6
  ];
  const factor = ['PM2.5', 'PM10', 'NO2', 'O3', 'CODMn', '氨氮'][i % 6];
  const risk = ['低', '中', '中高', '高'][i % 4];

  return [
    `推理片段 ${i + 1}：正在比对 ${area} 的 ${factor} 监测指标。`,
    `- 临时样本量：${128 + i * 19} 条`,
    `- 异常点位：${(i % 5) + 1} 个`,
    `- 风险等级：${risk}`,
    `- 处理策略：先按小时聚合，再按站点类型回填缺失值，最后校验累计总数是否仍为 175。`,
    `- 高度压力：这一段会同时影响 header / topStatus / item 插槽中的 Thinking 展开高度。`
  ].join('\n');
}).join('\n\n');

const TOP_STATUS_THINKING_DETAIL = Array.from({ length: 16 }, (_, i) => {
  return `顶部插槽压力 ${i + 1}：模拟顶部加载区中存在动态高度组件，当前正在同步第 ${i + 1} 批监测站点上下文。`;
}).join('\n\n');

const ITEM_SLOT_THINKING_DETAIL = Array.from({ length: 18 }, (_, i) => {
  return `#item 插槽压力 ${i + 1}：这是一个非 Bubble 节点，由 itemType 命中 #item 插槽渲染，并在思考结束后自动折叠。`;
}).join('\n\n');

const FINAL_FULL_CONTENT = `<think>
正在理解问题中……本次用于测试多个插槽共同产生动态高度变化时，BubbleList 是否仍能持续追底。

第一步：在 Bubble 的 #header 中渲染 Thinking。
第二步：在 BubbleList 的 #topStatus 中渲染 Thinking。
第三步：插入一个 itemType=stress-thinking 的非气泡节点，在 #item 中渲染 Thinking。
第四步：正文继续输出 Markdown 表格、ECharts、Mermaid、数学公式和图片。

${LONG_THINKING_DETAIL}

准备就绪，开始输出最终回答。</think>

## 极端场景 SSE 输出报告

### 一、压力场景矩阵

| 插槽位置 | 动态组件 | 高度变化来源 | 预期行为 |
|:---------|:---------|:-------------|:---------|
| #header | Thinking | 流式展开 + 自动折叠 | 不打断 AI 回复追底 |
| #topStatus | Thinking | 顶部边界区域动态高度 | 不误判用户上滑 |
| #item | Thinking | 非气泡节点动态高度 | 不阻断后续流式追底 |
| #content | MarkdownRenderer | 表格/图表/公式/图片异步渲染 | 持续贴底 |

### 二、站点类型分布（ECharts）

${CF}my-echarts
{
  "title": { "text": "极端场景站点分布", "left": "center" },
  "tooltip": { "trigger": "item", "formatter": "{b}: {c} 个 ({d}%)" },
  "legend": { "bottom": "0" },
  "series": [{
    "type": "pie",
    "radius": ["42%", "72%"],
    "data": [
      { "value": 22, "name": "大气监测" },
      { "value": 51, "name": "水质监测" },
      { "value": 92, "name": "秸秆焚烧" },
      { "value": 10, "name": "酸雨监测" }
    ]
  }]
}
${CF}

### 三、动态高度触发链路（Mermaid）

${CF}mermaid
flowchart TD
  A[SSE 全量替换] --> B[AI item content 更新]
  B --> C[#header Thinking 增高]
  B --> D[#item Thinking 增高]
  B --> E[Markdown 正文增高]
  B --> F[#topStatus Thinking 增高]
  C --> G{是否仍在底部}
  D --> G
  E --> G
  F --> G
  G -->|是| H[继续自动触底]
  G -->|否| I[保持用户阅读位置]
${CF}

### 四、AQI 公式

$$AQI = \\frac{I_{hi} - I_{lo}}{C_{hi} - C_{lo}} \\times (C_p - C_{lo}) + I_{lo}$$

### 五、图片

![生态监测示意图](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80)

### 六、长段结论

${Array.from({ length: 14 }, (_, i) => `**结论段 ${i + 1}**：当前压力用例会同时让 header、topStatus、item 和 content 区域产生高度变化。理想情况下，只要用户没有主动上滑，BubbleList 都应该维持 AT_BOTTOM；一旦用户主动上滑，则应该进入 SCROLLED_UP 并停止追底。`).join('\n\n')}
`;

interface SSEEvent {
  content: string;
  completed: boolean;
}

function createMockSSE(
  finalContent: string,
  options: {
    onMessage: (e: SSEEvent) => void;
    onClose: () => void;
    tickMs?: number;
    charsPerTick?: number;
  }
) {
  const { onMessage, onClose, tickMs = 50, charsPerTick = 30 } = options;
  let offset = 0;
  const timer = window.setInterval(() => {
    offset = Math.min(offset + charsPerTick, finalContent.length);
    const accumulated = finalContent.slice(0, offset);
    const done = offset >= finalContent.length;
    onMessage({ content: accumulated, completed: done });
    if (done) {
      window.clearInterval(timer);
      onClose();
    }
  }, tickMs);
  return () => window.clearInterval(timer);
}

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<BubbleListProps<MessageItem>['list']>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const isStreaming = ref(false);
const hasStreamStarted = ref(false);
const mode = ref<'replace' | 'append'>('replace');
const lastEventLength = ref(0);
const eventCount = ref(0);
const virtualEnabled = ref(false);
const headerStressEnabled = ref(true);
const topStatusStressEnabled = ref(true);
const itemStressEnabled = ref(true);
const speed = ref(10);

let nextKey = 0;
let stopSSE: (() => void) | null = null;

const latestAiItem = computed(() => {
  for (let i = bubbleItems.value.length - 1; i >= 0; i--) {
    const item = bubbleItems.value[i];
    if (item?.role === 'ai') return item;
  }
  return undefined;
});

const currentStreamingThink = computed(() => {
  const item = latestAiItem.value;
  if (!item)
    return { thinking: '', body: '', status: 'start' as ThinkingStatus };

  return parseThink(item.content);
});

const topStatus = computed<BubbleListBoundaryState | null>(() => {
  if (!topStatusStressEnabled.value || !hasStreamStarted.value) return null;

  return { type: 'loading', text: '顶部动态 Thinking 压力区' };
});

const topStatusThinkingContent = computed(() => {
  if (currentStreamingThink.value.status === 'thinking') {
    return [
      'BubbleList #topStatus 动态高度压力测试。',
      TOP_STATUS_THINKING_DETAIL,
      currentStreamingThink.value.thinking
    ].join('\n\n');
  }

  return [
    'BubbleList #topStatus 动态高度压力测试。',
    TOP_STATUS_THINKING_DETAIL
  ].join('\n\n');
});

const itemSlotThinkingContent = computed(() => {
  if (currentStreamingThink.value.status === 'thinking') {
    return [
      'BubbleList #item 动态高度压力测试。',
      ITEM_SLOT_THINKING_DETAIL,
      currentStreamingThink.value.thinking
    ].join('\n\n');
  }

  return [
    'BubbleList #item 动态高度压力测试。',
    ITEM_SLOT_THINKING_DETAIL
  ].join('\n\n');
});

function speedToTiming(s: number) {
  const tickMs = Math.round(200 - (s - 1) * 20);
  const charsPerTick = Math.round(2 + (s - 1) * 6);
  return { tickMs, charsPerTick };
}

function createMessage(
  key: number,
  role: 'user' | 'ai',
  content: string
): MessageItem {
  const isUser = role === 'user';
  return {
    key,
    role,
    placement: isUser ? 'end' : 'start',
    content,
    avatar: isUser
      ? 'https://avatars.githubusercontent.com/u/76239030?v=4'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '24px',
    avatarGap: '12px',
    shape: 'corner',
    variant: isUser ? 'outlined' : 'filled',
    noStyle: true
  };
}

function createStressItem(): MessageItem {
  return {
    key: ++nextKey,
    role: 'system',
    placement: 'start',
    content: '',
    avatar: '',
    itemType: 'stress-thinking',
    noStyle: true
  };
}

function buildSeed() {
  bubbleItems.value = [];
  for (let i = 0; i < 6; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    bubbleItems.value.push(
      createMessage(
        ++nextKey,
        role,
        role === 'ai'
          ? `预热消息 ${i + 1}：用于把列表填到接近底部的状态。`
          : `用户预热消息 ${i + 1}`
      )
    );
  }
  hasStreamStarted.value = false;
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  eventCount.value = 0;
  lastEventLength.value = 0;
  nextTick(() => bubbleListRef.value?.scrollToBottom(false));
}

function stopStreaming() {
  stopSSE?.();
  stopSSE = null;
  isStreaming.value = false;
}

function startStreaming() {
  if (isStreaming.value) return;

  stopStreaming();
  hasStreamStarted.value = true;

  bubbleItems.value.push(
    createMessage(++nextKey, 'user', '请用极端插槽组合压测 SSE 自动触底能力。')
  );

  if (itemStressEnabled.value) bubbleItems.value.push(createStressItem());

  bubbleItems.value.push(createMessage(++nextKey, 'ai', ''));

  isStreaming.value = true;
  eventCount.value = 0;
  let lastReceivedContent = '';

  const { tickMs, charsPerTick } = speedToTiming(speed.value);
  stopSSE = createMockSSE(FINAL_FULL_CONTENT, {
    tickMs,
    charsPerTick,
    onMessage: e => {
      eventCount.value += 1;
      lastEventLength.value = e.content.length;
      const aiItem = latestAiItem.value;
      if (!aiItem) return;

      if (mode.value === 'replace') {
        aiItem.content = e.content;
      } else {
        const delta = e.content.slice(lastReceivedContent.length);
        aiItem.content += delta;
      }
      lastReceivedContent = e.content;
    },
    onClose: () => {
      isStreaming.value = false;
    }
  });
}

function resetConversation() {
  stopStreaming();
  nextKey = 0;
  buildSeed();
}

function toggleMode() {
  if (isStreaming.value) return;

  mode.value = mode.value === 'replace' ? 'append' : 'replace';
}

function handleScrollStateChange(s: BubbleListScrollState) {
  scrollState.value = s;
}

function handleUnreadCountChange(c: number) {
  unreadCount.value = c;
}

onMounted(buildSeed);
onUnmounted(stopStreaming);
</script>

<template>
  <div class="sse-extreme-demo">
    <div class="tip">
      <strong>极端场景：</strong>
      <span :class="`mode-tag mode-${mode}`">
        {{ mode === 'replace' ? '全量替换' : '增量追加' }}
      </span>
      <span class="hint">
        同时压测 #header、#topStatus、#item 与 Markdown 正文的动态高度变化。
      </span>
    </div>

    <div class="toolbar">
      <el-button
        size="small"
        type="primary"
        plain
        :disabled="isStreaming"
        @click="startStreaming"
      >
        开始极端 SSE 流
      </el-button>
      <el-button
        size="small"
        type="warning"
        plain
        :disabled="!isStreaming"
        @click="stopStreaming"
      >
        停止
      </el-button>
      <el-button
        size="small"
        type="info"
        plain
        :disabled="isStreaming"
        @click="toggleMode"
      >
        切换为「{{ mode === 'replace' ? '增量追加' : '全量替换' }}」模式
      </el-button>
      <el-button size="small" type="danger" plain @click="resetConversation">
        重置会话
      </el-button>
      <div class="speed-control">
        <span class="speed-label">输出速度</span>
        <el-slider
          v-model="speed"
          :min="1"
          :max="10"
          :step="1"
          :disabled="isStreaming"
          show-stops
          style="width: 180px"
        />
        <span class="speed-hint">{{
          speed <= 3 ? '慢' : speed >= 8 ? '快（极端）' : '中'
        }}</span>
      </div>
    </div>

    <div class="switch-row">
      <div class="chip switch-chip">
        虚拟列表：
        <el-switch
          v-model="virtualEnabled"
          size="small"
          :disabled="isStreaming"
          inline-prompt
          active-text="开"
          inactive-text="关"
        />
      </div>
      <div class="chip switch-chip">
        #header Thinking：
        <el-switch
          v-model="headerStressEnabled"
          size="small"
          :disabled="isStreaming"
          inline-prompt
          active-text="开"
          inactive-text="关"
        />
      </div>
      <div class="chip switch-chip">
        #topStatus Thinking：
        <el-switch
          v-model="topStatusStressEnabled"
          size="small"
          :disabled="isStreaming"
          inline-prompt
          active-text="开"
          inactive-text="关"
        />
      </div>
      <div class="chip switch-chip">
        #item Thinking：
        <el-switch
          v-model="itemStressEnabled"
          size="small"
          :disabled="isStreaming"
          inline-prompt
          active-text="开"
          inactive-text="关"
        />
      </div>
    </div>

    <div class="status-row">
      <div class="chip">
        滚动状态：<strong :class="`s-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="chip">
        未读：<strong>{{ unreadCount }}</strong>
      </div>
      <div class="chip">
        SSE 事件数：<strong>{{ eventCount }}</strong>
      </div>
      <div class="chip">
        最后事件 content 长度：<strong>{{ lastEventLength }}</strong>
      </div>
      <div class="chip">
        流式状态：<strong>{{ isStreaming ? '进行中' : '空闲' }}</strong>
      </div>
    </div>

    <div class="stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :virtual="virtualEnabled"
        :top-status="topStatus"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #topStatus>
          <div class="top-status-stress">
            <Thinking
              :content="topStatusThinkingContent"
              :status="
                currentStreamingThink.status === 'thinking' ? 'thinking' : 'end'
              "
              auto-collapse
              max-width="100%"
            />
          </div>
        </template>

        <template #header="{ item }">
          <Thinking
            v-if="
              headerStressEnabled &&
              item.role === 'ai' &&
              (parseThink(item.content).thinking ||
                parseThink(item.content).status === 'thinking')
            "
            class="message-thinking"
            :content="parseThink(item.content).thinking"
            :status="
              parseThink(item.content).status === 'thinking'
                ? 'thinking'
                : 'end'
            "
            auto-collapse
            max-width="100%"
          />
        </template>

        <template #content="{ item }">
          <template v-if="item.role === 'ai'">
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer && parseThink(item.content).body"
              :markdown="parseThink(item.content).body"
              :code-x-render="codeXRender"
              :enable-mermaid="true"
              :enable-animate="isStreaming"
            />
            <span
              v-else-if="
                !parseThink(item.content).body &&
                parseThink(item.content).status !== 'thinking'
              "
              class="waiting-text"
              >正在等待回复...</span
            >
          </template>
          <template v-else>
            <span class="user-msg-text">{{ item.content }}</span>
          </template>
        </template>

        <template #item="{ item }">
          <div v-if="item.itemType === 'stress-thinking'" class="item-stress">
            <div class="item-stress-title">#item 插槽动态高度节点</div>
            <Thinking
              :content="itemSlotThinkingContent"
              :status="
                currentStreamingThink.status === 'thinking' ? 'thinking' : 'end'
              "
              auto-collapse
              max-width="100%"
            />
          </div>
          <div v-else class="item-stress">
            {{ item.content }}
          </div>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sse-extreme-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}
.tip {
  padding: 12px 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  font-size: 13px;
  color: #92400e;
  line-height: 1.7;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mode-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 600;
  &.mode-replace {
    background: #fecaca;
    color: #991b1b;
  }
  &.mode-append {
    background: #bbf7d0;
    color: #166534;
  }
}
.hint {
  color: #78350f;
  font-size: 12px;
}
.toolbar,
.switch-row,
.status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.speed-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  padding: 0 12px;
  height: 28px;
  border-radius: 999px;
  background: #f1f5f9;
}
.speed-label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}
.speed-hint {
  font-size: 12px;
  color: #64748b;
  min-width: 64px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
  strong {
    color: #0f172a;
    font-size: 13px;
    &.s-at_bottom {
      color: #16a34a;
    }
    &.s-scrolled_up {
      color: #d97706;
    }
    &.s-has_new_messages {
      color: #dc2626;
    }
  }
}
.switch-chip {
  padding-right: 8px;
}
.stage {
  min-height: 560px;
  height: 560px;
  padding: 10px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
}
.stage :deep(.elx-bubble-list) {
  width: 100%;
  height: 100%;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}
.top-status-stress {
  padding: 8px 12px 6px;
  border-bottom: 1px solid #dbeafe;
  background: #eff6ff;
}
.message-thinking {
  margin-bottom: 8px;
}
.item-stress {
  width: min(720px, calc(100% - 40px));
  margin: 8px auto;
  padding: 12px;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
  background: #fff;
}
.item-stress-title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}
.chart-loading {
  margin: 16px 0;
  padding: 12px;
  border: 1px dashed #dbeafe;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
}
.waiting-text {
  color: #999;
}
.user-msg-text {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  font-size: 14px;
  line-height: 1.5;
}
</style>

```

### streaming-replace-sse

```vue
<docs>
---
title: 模拟真实 SSE（全量累计）复现自动触底失效
---

::: warning 复现目的
某些后端为了简化前端处理，会把每次 SSE 事件的 `data.content` 设计为**已拼接好的累计全量内容**，前端只需在每次 `onmessage` 里把最后一次的 `content` 直接 **赋值（替换）** 到 AI 气泡上即可，无需自己拼接。

这种「全量替换」模式与示例库里常见的「增量追加（`content += chunk`）」模式行为非常接近，但在某些情况下会导致 `BubbleList` 的自动触底/流式跟随失效。这个 demo 用来稳定复现该问题。
:::

**关键差异**：
- 常规 demo：`currentItem.content += chunk`（字符串原地变长）
- 本 demo：`currentItem.content = latestSSEEvent.content`（每次都替换为新的完整字符串）

操作步骤：
1. 点击「开始模拟 SSE 流」
2. 观察 AI 气泡内容持续变长 —— **预期**：列表始终贴底；**实际**：列表停在初始位置，不会跟随
3. 如需对比，可点击「切换到增量追加模式」再试一次
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListItemProps,
  BubbleListProps,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';
import {
  defineComponent,
  h,
  onBeforeUnmount as vOnBeforeUnmount,
  onMounted as vOnMounted,
  ref as vRef
} from 'vue';

interface MessageItem extends BubbleListItemProps {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
}

// ============== <think> 解析 ==============
type ThinkingStatus = 'start' | 'thinking' | 'end';
interface ParsedThink {
  thinking: string;
  body: string;
  status: ThinkingStatus;
}

function parseThink(raw: string): ParsedThink {
  if (!raw) return { thinking: '', body: '', status: 'start' };
  const open = raw.indexOf('<think>');
  if (open < 0) return { thinking: '', body: raw, status: 'start' };
  const close = raw.indexOf('</think>', open + 7);
  if (close < 0) {
    // 思考进行中：还没看到闭合标签，全部内容都是思考
    return {
      thinking: raw.slice(open + 7),
      body: '',
      status: 'thinking'
    };
  }
  const thinking = raw.slice(open + 7, close);
  const body = (raw.slice(0, open) + raw.slice(close + 8)).replace(/^\s+/, '');
  return { thinking, body, status: 'end' };
}

// ============== 异步加载 MarkdownRenderer ==============
const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  // @ts-expect-error style entry is runtime-only in x-markdown-vue
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value =
    (mod as any).MarkdownRenderer ?? (mod as any).default ?? mod;
});

const MyEchartsBlock = defineComponent({
  name: 'SseReplaceEchartsBlock',
  props: {
    option: { type: Object, required: true }
  },
  setup(props) {
    const chartEl = vRef<HTMLDivElement>();
    let chart: any = null;
    let resizeObserver: ResizeObserver | null = null;

    vOnMounted(async () => {
      if (!chartEl.value) return;
      try {
        const echarts = await import('echarts');
        chart = echarts.init(chartEl.value);
        chart.setOption(props.option);
        resizeObserver = new ResizeObserver(() => chart?.resize());
        resizeObserver.observe(chartEl.value);
      } catch (e) {
        console.warn('[streaming-replace-sse] echarts init failed', e);
      }
    });

    vOnBeforeUnmount(() => {
      resizeObserver?.disconnect();
      chart?.dispose();
    });

    return () =>
      h('div', {
        ref: chartEl,
        style: 'width:100%;height:320px;margin:16px 0;'
      });
  }
});

function safeJsonParse(raw: string) {
  try {
    return { ok: true as const, value: JSON.parse(raw) };
  } catch {
    return { ok: false as const };
  }
}

const codeXRender = {
  'my-echarts': (props: any) => {
    const parsed = safeJsonParse(props.raw.content);
    if (parsed.ok) {
      return h(MyEchartsBlock, { option: parsed.value });
    }

    return h('div', { class: 'chart-loading' }, '图表数据加载中...');
  }
};

// ============== 代码围栏符号（避免模板字面量嵌套三反引号）==============
const CF = '``​`';

const LONG_THINKING_DETAIL = Array.from({ length: 28 }, (_, i) => {
  const area = ['青秀区', '兴宁区', '江南区', '西乡塘区', '良庆区', '邕宁区'][
    i % 6
  ];
  const factor = ['PM2.5', 'PM10', 'NO2', 'O3', 'CODMn', '氨氮'][i % 6];
  const risk = ['低', '中', '中高', '高'][i % 4];

  return [
    `推理片段 ${i + 1}：正在比对 ${area} 的 ${factor} 监测指标。`,
    `- 临时样本量：${128 + i * 17} 条`,
    `- 异常点位：${(i % 5) + 1} 个`,
    `- 风险等级：${risk}`,
    `- 处理策略：先按小时聚合，再按站点类型回填缺失值，最后校验累计总数是否仍为 175。`,
    `- 备注：这是一段专门用于拉高 Thinking 高度的假数据，观察 think 闭合标签出现后自动折叠是否会影响 BubbleList 追底。`
  ].join('\n');
}).join('\n\n');

// ============== 模拟后端：包含多种 Markdown 要素的「最终全量内容」 ==============
const FINAL_FULL_CONTENT = `<think>
正在理解问题中……用户需要查看南宁市环境监测站点综合统计，包含数据表、图表、流程图、数学公式与参考图片。

第一步：整理站点数量汇总表格。
第二步：构建 ECharts 环形图，可视化各类站点占比。
第三步：用 Mermaid 流程图描述监测数据处理流程。
第四步：给出 AQI 空气质量指数计算公式（LaTeX）。
第五步：附上南宁市区位示意图。

下面开始模拟较长的内部思考过程，用于测试 Thinking 内容很长时自动折叠造成的高度突变：

${LONG_THINKING_DETAIL}

准备就绪，开始输出……</think>

## 南宁市环境监测站点统计报告

### 一、站点数量汇总

| 监测类型 | 站点数量 | 细分说明 | 占比 |
|:---------|:-------:|:---------|-----:|
| 大气监测 | 22 | 国控 4 / 省控 8 / 市控 10 | 12.6% |
| 地表水手动站 | 18 | 邕江沿线为主 | 10.3% |
| 地表水自动站 | 18 | 实时在线 | 10.3% |
| 饮用水手动站 | 15 | 水厂取水口 | 8.6% |
| 秸秆焚烧监测 | 92 | 覆盖全市 12 个县区 | 52.6% |
| 酸雨监测 | 10 | 均匀分布 | 5.7% |
| **合计** | **175** | — | **100%** |

### 二、站点类型分布（ECharts 环形图）

${CF}my-echarts
{
  "title": { "text": "南宁市监测站点类型分布", "left": "center" },
  "tooltip": { "trigger": "item", "formatter": "{b}: {c} 个 ({d}%)" },
  "legend": { "orient": "vertical", "left": "left", "top": "middle" },
  "series": [{
    "type": "pie",
    "radius": ["40%", "70%"],
    "avoidLabelOverlap": false,
    "label": { "show": false, "position": "center" },
    "emphasis": { "label": { "show": true, "fontSize": 14, "fontWeight": "bold" } },
    "labelLine": { "show": false },
    "data": [
      { "value": 22, "name": "大气监测" },
      { "value": 36, "name": "地表水监测" },
      { "value": 15, "name": "饮用水监测" },
      { "value": 92, "name": "秸秆焚烧监测" },
      { "value": 10, "name": "酸雨监测" }
    ]
  }]
}
${CF}

### 三、监测数据处理流程（Mermaid）

${CF}mermaid
flowchart TD
  A[传感器采集原始数据] --> B{数据校验}
  B -- 通过 --> C[写入实时数据库]
  B -- 异常 --> D[触发告警通知]
  C --> E[实时看板展示]
  C --> F[历史数据归档]
  D --> G[人工复核]
  G --> B
  F --> H[统计分析报告]
  E --> I[公众发布平台]
${CF}

### 四、AQI 空气质量指数计算公式

AQI 采用分段线性插值方法：

$$AQI = \\frac{I_{hi} - I_{lo}}{C_{hi} - C_{lo}} \\times (C_p - C_{lo}) + I_{lo}$$

**参数说明：**

- $C_p$：污染物实测浓度（μg/m³）
- $C_{hi}$、$C_{lo}$：浓度分段上下断点
- $I_{hi}$、$I_{lo}$：对应 AQI 分段上下断点

各等级区间：$0 \\sim 50$ 优；$51 \\sim 100$ 良；$101 \\sim 150$ 轻度污染；$151 \\sim 200$ 中度污染。

### 五、南宁市区位示意图

![生态监测示意图](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80)

> 图：生态环境监测场景示意

### 六、综合结论

南宁市各类环境监测站点共 **175 个**，形成覆盖大气、水质、秸秆焚烧和酸雨四大领域的综合监测网络。

${Array.from({ length: 10 }, (_, i) => `**详细说明 ${i + 1}**：秸秆焚烧监测站点数量最多（92 个，占 52.6%），主要因广西农业规模大，监管需求强烈。水质监测站点合计 51 个，沿邕江、左江、右江主要水体分布。酸雨监测站点 10 个均匀覆盖全市。大气监测站 22 个中，国控/省控/市控三级网络数据实时上传国家平台，支持智能告警联动。`).join('\n\n')}
`;

// ============== 模拟后端 SSE：每次推送都是「拼接好的全量内容」 ==============
interface SSEEvent {
  content: string;
  completed: boolean;
}

function createMockSSE(
  finalContent: string,
  options: {
    onMessage: (e: SSEEvent) => void;
    onClose: () => void;
    tickMs?: number;
    charsPerTick?: number;
  }
) {
  const { onMessage, onClose, tickMs = 50, charsPerTick = 30 } = options;
  let offset = 0;
  const timer = window.setInterval(() => {
    offset = Math.min(offset + charsPerTick, finalContent.length);
    const accumulated = finalContent.slice(0, offset); // 关键：每次发出的是「累计后的完整字符串」
    const done = offset >= finalContent.length;
    onMessage({ content: accumulated, completed: done });
    if (done) {
      window.clearInterval(timer);
      onClose();
    }
  }, tickMs);
  return () => window.clearInterval(timer);
}

// ============== 组件状态 ==============
const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<BubbleListProps<MessageItem>['list']>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const isStreaming = ref(false);
const mode = ref<'replace' | 'append'>('replace');
const lastEventLength = ref(0);
const eventCount = ref(0);
const virtualEnabled = ref(false);

// 速度档位 1~10（1 最慢，10 最快）
const speed = ref(4);
function speedToTiming(s: number) {
  // tickMs: 200ms (s=1) -> 20ms (s=10)
  // charsPerTick: 2 (s=1) -> 56 (s=10)
  const tickMs = Math.round(200 - (s - 1) * 20);
  const charsPerTick = Math.round(2 + (s - 1) * 6);
  return { tickMs, charsPerTick };
}

let nextKey = 0;
let stopSSE: (() => void) | null = null;

function createMessage(
  key: number,
  role: 'user' | 'ai',
  content: string
): MessageItem {
  const isUser = role === 'user';
  return {
    key,
    role,
    placement: isUser ? 'end' : 'start',
    content,
    avatar: isUser
      ? 'https://avatars.githubusercontent.com/u/76239030?v=4'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '24px',
    avatarGap: '12px',
    shape: 'corner',
    variant: isUser ? 'outlined' : 'filled',
    noStyle: true
  };
}

function buildSeed() {
  bubbleItems.value = [];
  for (let i = 0; i < 6; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    bubbleItems.value.push(
      createMessage(
        ++nextKey,
        role,
        role === 'ai'
          ? `预热消息 ${i + 1}：用于把列表填到接近底部的状态。`
          : `用户预热消息 ${i + 1}`
      )
    );
  }
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  eventCount.value = 0;
  lastEventLength.value = 0;
  nextTick(() => bubbleListRef.value?.scrollToBottom(false));
}

function stopStreaming() {
  stopSSE?.();
  stopSSE = null;
  isStreaming.value = false;
}

function startStreaming() {
  if (isStreaming.value) return;
  stopStreaming();

  // 用户消息
  bubbleItems.value.push(
    createMessage(++nextKey, 'user', '请用 SSE 流式输出南宁市监测站点统计。')
  );

  // AI 占位消息（content 初始为空）
  bubbleItems.value.push(createMessage(++nextKey, 'ai', ''));

  isStreaming.value = true;
  eventCount.value = 0;
  let lastReceivedContent = ''; // 用于 append 模式计算 delta

  const { tickMs, charsPerTick } = speedToTiming(speed.value);
  stopSSE = createMockSSE(FINAL_FULL_CONTENT, {
    tickMs,
    charsPerTick,
    onMessage: e => {
      eventCount.value += 1;
      lastEventLength.value = e.content.length;
      const aiItem = bubbleItems.value[bubbleItems.value.length - 1];
      if (!aiItem || aiItem.role !== 'ai') return;

      if (mode.value === 'replace') {
        // ❗ 复现模式：每次 SSE 都是「全量累计内容」，前端直接整体替换
        aiItem.content = e.content;
      } else {
        // 对照模式：按 delta 增量追加（这才是 demo 库默认演示的方式）
        const delta = e.content.slice(lastReceivedContent.length);
        aiItem.content += delta;
      }
      lastReceivedContent = e.content;
    },
    onClose: () => {
      isStreaming.value = false;
    }
  });
}

function resetConversation() {
  stopStreaming();
  nextKey = 0;
  buildSeed();
}

function toggleMode() {
  if (isStreaming.value) return;
  mode.value = mode.value === 'replace' ? 'append' : 'replace';
}

function handleScrollStateChange(s: BubbleListScrollState) {
  scrollState.value = s;
}
function handleUnreadCountChange(c: number) {
  unreadCount.value = c;
}

onMounted(buildSeed);
onUnmounted(stopStreaming);
</script>

<template>
  <div class="sse-replace-demo">
    <div class="tip">
      <strong>当前接收模式：</strong>
      <span :class="`mode-tag mode-${mode}`">
        {{ mode === 'replace' ? '全量替换（复现 Bug）' : '增量追加（正常）' }}
      </span>
      <span class="hint">
        全量替换模式下，预期 BubbleList 应当持续贴底，但实际可能不会自动滚动。
      </span>
    </div>

    <div class="toolbar">
      <el-button
        size="small"
        type="primary"
        plain
        :disabled="isStreaming"
        @click="startStreaming"
      >
        开始模拟 SSE 流
      </el-button>
      <el-button
        size="small"
        type="warning"
        plain
        :disabled="!isStreaming"
        @click="stopStreaming"
      >
        停止
      </el-button>
      <el-button
        size="small"
        type="info"
        plain
        :disabled="isStreaming"
        @click="toggleMode"
      >
        切换为「{{ mode === 'replace' ? '增量追加' : '全量替换' }}」模式
      </el-button>
      <el-button size="small" type="danger" plain @click="resetConversation">
        重置会话
      </el-button>
      <div class="speed-control">
        <span class="speed-label">输出速度</span>
        <el-slider
          v-model="speed"
          :min="1"
          :max="10"
          :step="1"
          :disabled="isStreaming"
          show-stops
          style="width: 180px"
        />
        <span class="speed-hint">{{
          speed <= 3 ? '慢（看清过程）' : speed >= 8 ? '快（接近真实）' : '中'
        }}</span>
      </div>
    </div>

    <div class="status-row">
      <div class="chip">
        滚动状态：<strong :class="`s-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="chip">
        未读：<strong>{{ unreadCount }}</strong>
      </div>
      <div class="chip">
        SSE 事件数：<strong>{{ eventCount }}</strong>
      </div>
      <div class="chip">
        最后事件 content 长度：<strong>{{ lastEventLength }}</strong>
      </div>
      <div class="chip">
        流式状态：<strong>{{ isStreaming ? '进行中' : '空闲' }}</strong>
      </div>
      <div class="chip switch-chip">
        虚拟列表：
        <el-switch
          v-model="virtualEnabled"
          size="small"
          :disabled="isStreaming"
          inline-prompt
          active-text="开"
          inactive-text="关"
        />
      </div>
    </div>

    <div class="stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :virtual="virtualEnabled"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #header="{ item }">
          <Thinking
            v-if="
              item.role === 'ai' &&
              (parseThink(item.content).thinking ||
                parseThink(item.content).status === 'thinking')
            "
            class="message-thinking"
            :content="parseThink(item.content).thinking"
            :status="
              parseThink(item.content).status === 'thinking'
                ? 'thinking'
                : 'end'
            "
            auto-collapse
            max-width="100%"
          />
        </template>
        <template #content="{ item }">
          <template v-if="item.role === 'ai'">
            <!-- 正文：用 Markdown 渲染 -->
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer && parseThink(item.content).body"
              :markdown="parseThink(item.content).body"
              :code-x-render="codeXRender"
              :enable-mermaid="true"
              :enable-animate="isStreaming"
            />
            <span
              v-else-if="
                !parseThink(item.content).body &&
                parseThink(item.content).status !== 'thinking'
              "
              style="color: #999"
              >正在等待回复...</span
            >
          </template>
          <template v-else>
            <span class="user-msg-text">{{ item.content }}</span>
          </template>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sse-replace-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}
.tip {
  padding: 12px 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  font-size: 13px;
  color: #92400e;
  line-height: 1.7;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mode-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 600;
  &.mode-replace {
    background: #fecaca;
    color: #991b1b;
  }
  &.mode-append {
    background: #bbf7d0;
    color: #166534;
  }
}
.hint {
  color: #78350f;
  font-size: 12px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.speed-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  padding: 0 12px;
  height: 28px;
  border-radius: 999px;
  background: #f1f5f9;
}
.speed-label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}
.speed-hint {
  font-size: 12px;
  color: #64748b;
  min-width: 64px;
}
.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
  strong {
    color: #0f172a;
    font-size: 13px;
    &.s-at_bottom {
      color: #16a34a;
    }
    &.s-scrolled_up {
      color: #d97706;
    }
    &.s-has_new_messages {
      color: #dc2626;
    }
  }
}
.stage {
  min-height: 520px;
  height: 520px;
  padding: 10px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
}
.stage :deep(.elx-bubble-list) {
  width: 100%;
  height: 100%;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}
.switch-chip {
  padding-right: 8px;
}
.message-thinking {
  margin-bottom: 8px;
}
.chart-loading {
  margin: 16px 0;
  padding: 12px;
  border: 1px dashed #dbeafe;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
}
.user-msg-text {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  font-size: 14px;
  line-height: 1.5;
}
</style>

```

### theme-overrides

```vue
<docs>
---
title: 自定义主题
---

通过 `ConfigProvider.themeOverrides` 覆盖 `BubbleList` 的 `--elx-*` 变量，并联动 `Bubble` 的主题变量，开关前后会有明显反差。
</docs>

<script setup lang="ts">
import { computed, ref } from 'vue';

const enabled = ref(true);

const list = ref(
  Array.from({ length: 18 }).map((_, i) => ({
    content: `第 ${i + 1} 条消息：用于演示 BubbleList 的滚动与返回按钮。`,
    placement: i % 2 === 0 ? 'start' : 'end'
  }))
);

const themeOverrides = computed(() => {
  if (!enabled.value) return {};
  return {
    common: {
      'color-primary': '#f97316',
      'border-color': 'rgba(249, 115, 22, 0.38)',
      'fill-color': 'rgba(249, 115, 22, 0.10)',
      'box-shadow': '0 18px 54px rgba(249, 115, 22, 0.22)'
    },
    components: {
      BubbleList: {
        'bubble-list-max-height': '260px',
        'bubble-list-btn-size': '38px'
      },
      Bubble: {
        'bubble-content-max-width': '420px',
        'bubble-bg':
          'linear-gradient(135deg, rgba(249, 115, 22, 0.16), rgba(245, 158, 11, 0.10))',
        'bubble-border-color': 'rgba(249, 115, 22, 0.30)',
        'bubble-text-color': 'rgba(15, 23, 42, 0.86)',
        'bubble-radius': '18px',
        'bubble-padding-y': '14px',
        'bubble-padding-x': '18px',
        'bubble-shadow': '0 18px 52px rgba(249, 115, 22, 0.18)',
        'bubble-dot-color': '#f97316'
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
      <div>滚动列表，观察最大高度与返回按钮尺寸变化。</div>
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
          height: 360px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--elx-border-color);
          background:
            radial-gradient(
              1200px 280px at 0% 0%,
              rgba(249, 115, 22, 0.22),
              transparent 60%
            ),
            radial-gradient(
              900px 240px at 100% 20%,
              rgba(245, 158, 11, 0.14),
              transparent 55%
            ),
            rgba(0, 0, 0, 0.02);
          box-shadow: var(--elx-box-shadow);
        "
      >
        <BubbleList :list="list" always-show-scrollbar />
      </div>
    </ConfigProvider>
  </div>
</template>

```

### with-markdown

```vue
<docs>
---
title: 流式 Markdown 渲染（V2 升级）
---

支持公式、代码块、任务列表的列表渲染，并模拟 AI 逐段输出 Markdown 的实时效果。

::: tip V2 版本升级提示
- **流式跟随**：V2 在流式输出（内容持续变高）时，自动贴底跟随。用户上滑后中断，回到底部后自动恢复。V1 需要手动管理滚动位置。
- **虚拟滚动兼容**：V2 虚拟滚动 + 动态高度测量，流式变高时自动重新测量 item 高度，不会出现滚动位置跳动。
- **状态感知**：通过 `scroll-state-change` 和 `unread-count-change` 事件可实时感知流式输出期间的滚动状态变化。
:::
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';
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

interface MessageItem {
  key: number;
  role: 'user' | 'ai' | 'system';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
}

// ---- 流式输出相关 ----
const STREAM_TICK_MS = 70;
const STREAM_CHARS_PER_TICK = 8;

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<MessageItem[]>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const isStreaming = ref(false);
const emittedCharCount = ref(0);
const streamCharTotal = ref(0);
const round = ref(1);
const lastAction = ref(
  '点击"开始流式 Markdown"，观察 AI 消息逐段渲染与滚动跟随效果。'
);

let nextKey = 0;
let streamCharacters: string[] = [];
let streamOffset = 0;
let streamTimer: number | null = null;

function buildStaticMessages(): MessageItem[] {
  return [
    {
      key: 1,
      role: 'ai',
      placement: 'start',
      avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
      content: `### 行内公式
1. 欧拉公式：$e^{i\\pi} + 1 = 0$
2. 二次方程求根公式：$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

### []包裹公式
\\[ e^{i\\pi} + 1 = 0 \\]
\\[\\boxed{boxed包裹}\\]`
    },
    {
      key: 2,
      role: 'user',
      placement: 'end',
      avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
      content: '请问有什么可以帮助您的？'
    },
    {
      key: 3,
      role: 'ai',
      placement: 'start',
      avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
      content: `### 块级公式与代码块

傅里叶变换：
$$
F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt
$$

矩阵乘法：
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

任务列表：
- [x] Add some task
- [ ] Do some task

\`\`\`typescript
const greeting: string = "Hello World";
console.log(greeting);
\`\`\``
    }
  ];
}

function buildStreamingMarkdown(currentRound: number): string {
  return `### 第 ${currentRound} 轮流式 Markdown 回复

这是一个 **流式输出 + Markdown 渲染** 演示，验证 V2 升级后的能力：

- 输出内容持续变高时，贴底状态是否稳定
- 用户上滑后，是否只累计未读而不强制跳回
- 回到底部后，后续 chunk 是否继续自动跟随

#### 结构化摘要

1. BubbleList 负责虚拟滚动与跟随策略。
2. MarkdownRenderer 负责富文本渲染（标题、列表、代码、公式）。
3. 两者结合后可覆盖真实聊天场景中的长回复。

#### 代码片段

\`\`\`ts
type StreamChunk = {
  text: string;
  index: number;
};

const followWhenAtBottom = (distance: number) => distance <= 4;
\`\`\`

#### 数学公式

$$
F(\\omega) = \\int_{-\\infty}^{\\infty} f(t)e^{-i\\omega t}\\,dt
$$

> 结论：当消息是持续增量更新时，滚动边界判断需要考虑状态区高度与容差。`;
}

function stopStreaming(reason = '已停止流式 Markdown 输出。') {
  if (streamTimer !== null) {
    window.clearInterval(streamTimer);
    streamTimer = null;
  }

  isStreaming.value = false;
  lastAction.value = reason;
}

function resetConversation() {
  stopStreaming('已重置当前 Markdown 流式会话。');
  bubbleItems.value = buildStaticMessages();
  nextKey = 3;
  round.value = 1;
  emittedCharCount.value = 0;
  streamCharTotal.value = 0;
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  lastAction.value =
    '点击"开始流式 Markdown"，观察 AI 消息逐段渲染与滚动跟随效果。';
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function startStreaming() {
  if (isStreaming.value) return;

  const currentRound = round.value;
  round.value += 1;
  emittedCharCount.value = 0;
  streamOffset = 0;

  // 先追加一条用户提问
  nextKey += 1;
  bubbleItems.value.push({
    key: nextKey,
    role: 'user',
    placement: 'end',
    avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
    content: `请用 Markdown 解释第 ${currentRound} 轮 BubbleList 流式跟随验证结论。`
  });

  // 准备流式 Markdown 内容
  const markdown = buildStreamingMarkdown(currentRound);
  streamCharacters = Array.from(markdown);
  streamCharTotal.value = streamCharacters.length;

  // 初始 chunk
  const initialChunk = streamCharacters
    .slice(0, STREAM_CHARS_PER_TICK)
    .join('');
  streamOffset = initialChunk.length;
  emittedCharCount.value = streamOffset;

  // 追加 AI 消息（初始内容）
  nextKey += 1;
  bubbleItems.value.push({
    key: nextKey,
    role: 'ai',
    placement: 'start',
    avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
    content: initialChunk
  });

  isStreaming.value = true;
  lastAction.value = `流式 Markdown 进行中：每 ${STREAM_TICK_MS}ms 追加 ${STREAM_CHARS_PER_TICK} 个字符。`;

  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });

  // 定时追加
  streamTimer = window.setInterval(() => {
    const currentItem = bubbleItems.value[bubbleItems.value.length - 1];
    if (!currentItem || currentItem.role !== 'ai') {
      stopStreaming('流式消息已丢失，已终止当前模拟。');
      return;
    }

    if (streamOffset >= streamCharacters.length) {
      stopStreaming('流式 Markdown 输出完成。');
      return;
    }

    const nextChunk = streamCharacters
      .slice(streamOffset, streamOffset + STREAM_CHARS_PER_TICK)
      .join('');

    if (!nextChunk) {
      stopStreaming('流式 Markdown 输出完成。');
      return;
    }

    currentItem.content += nextChunk;
    streamOffset += nextChunk.length;
    emittedCharCount.value = streamOffset;

    if (streamOffset >= streamCharacters.length) {
      stopStreaming('流式 Markdown 输出完成。');
    }
  }, STREAM_TICK_MS);
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}

function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

onMounted(() => {
  resetConversation();
});

onUnmounted(() => {
  stopStreaming('组件卸载，已清理 Markdown 流式定时器。');
});
</script>

<template>
  <div class="markdown-demo-container">
    <div class="tip-banner">
      <span class="tip-icon">▶</span>
      <span
        >先点击"开始流式
        Markdown"，然后尝试<strong>向上滚动</strong>打断跟随，再点"回到底部恢复"观察自动恢复。</span
      >
    </div>

    <div class="toolbar">
      <div class="btn-list">
        <el-button
          type="primary"
          plain
          :disabled="isStreaming"
          @click="startStreaming"
        >
          开始流式 Markdown
        </el-button>
        <el-button
          type="warning"
          plain
          :disabled="!isStreaming"
          @click="bubbleListRef?.scrollToTop(false)"
        >
          模拟上滑中断
        </el-button>
        <el-button
          type="success"
          plain
          @click="bubbleListRef?.scrollToBottom(false)"
        >
          回到底部恢复
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="!isStreaming"
          @click="stopStreaming('已手动停止')"
        >
          停止输出
        </el-button>
        <el-button type="info" plain @click="resetConversation">
          重置会话
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-chip">
        <span>滚动状态</span>
        <strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-chip">
        <span>未读计数</span>
        <strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-chip">
        <span>流式状态</span>
        <strong :class="isStreaming ? 'streaming' : ''">{{
          isStreaming ? '输出中...' : '空闲'
        }}</strong>
      </div>
      <div class="status-chip">
        <span>已输出字符</span>
        <strong>{{ emittedCharCount }}/{{ streamCharTotal }}</strong>
      </div>
      <div class="status-chip">
        <span>当前轮次</span>
        <strong>{{ Math.max(round - 1, 0) }}</strong>
      </div>
    </div>

    <div class="activity-bar">
      <span>最近动作</span>
      <strong>{{ lastAction }}</strong>
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #content="{ item }">
          <div v-if="item.role === 'ai'" class="markdown-content-wrapper">
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer"
              :markdown="item.content || ''"
            />
            <pre v-else>{{ item.content }}</pre>
          </div>
          <span v-else>{{ item.content }}</span>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.markdown-demo-container {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .tip-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ecf5ff 0%, #fef0f0 100%);
    border: 1px solid #d9ecff;
    font-size: 13px;
    color: #409eff;

    .tip-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #409eff;
      color: #fff;
      font-size: 11px;
      flex-shrink: 0;
    }

    strong {
      color: #f56c6c;
    }
  }

  .toolbar {
    .btn-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #e4e7ed;

    span {
      font-size: 12px;
      color: #909399;
    }
    strong {
      font-size: 13px;
      color: #303133;
    }

    .state-at_bottom {
      color: #67c23a;
    }
    .state-scrolled_up {
      color: #e6a23c;
    }
    .state-has_new_messages {
      color: #f56c6c;
    }
    .streaming {
      color: #409eff;
      animation: blink 1s ease-in-out infinite;
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .activity-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;

    span {
      font-size: 12px;
      color: #909399;
    }
    strong {
      font-size: 13px;
      color: #1e3a8a;
    }
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
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
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
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 14px;
      line-height: 1.5;
      .line {
        display: block;
        min-height: 1rem;
      }
    }
  }
}
</style>

```

## API 参考

### 滚动控制方法

### 自动触底控制

### 返回底部按钮

### 流式跟随

### 模拟真实 SSE（全量累计）复现自动触底失效

### 极端场景：动态插槽高度与自动触底压力测试

### 双向分页加载

### 混合节点

### 插槽自定义

### 自定义主题

通过 `ConfigProvider.themeOverrides` 覆盖 `BubbleList` 的主题变量。完整变量表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens#bubblelist)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

### 与 x-markdown-vue 结合使用

从 `v2.0.0` 开始，组件库不再内置 `XMarkdown` / `XMarkdownAsync`。如需 Markdown 渲染，请使用独立包 [x-markdown-vue](https://www.npmjs.com/package/x-markdown-vue)，或查看专属文档：[XMarkdown](/zh/components/xMarkdown/)。

#### 安装

```bash
pnpm add x-markdown-vue
pnpm add katex
pnpm add shiki shiki-stream
```

::: tip
如果需要代码块语法高亮功能，请安装 `shiki` 和 `shiki-stream`。否则控制台可能会报错：`Streaming highlighter initialization failed: Error: Failed to load shiki-stream module`
:::

#### 基础用法

#### 雾化效果

## 属性

| 属性名                    | 类型                 | 是否必填 | 默认值                                         | 说明                                                                                                                                      |
| ------------------------- | -------------------- | -------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `list`                    | `Array`              | 是       | -                                              | 消息数组，每个对象透传给内置 `Bubble` 组件，支持所有 `Bubble` 属性。                                                                      |
| `autoScroll`              | `Boolean`            | 否       | `true`                                         | 追加新消息时是否自动滚到底部。关闭后新消息累计未读计数。                                                                                  |
| `maxHeight`               | `String`             | 否       | -                                              | 列表最大高度，默认撑满父容器。                                                                                                            |
| `virtual`                 | `Boolean`            | 否       | `true`                                         | 是否开启虚拟滚动（基于 `virtua/vue`），大数据量场景推荐保持开启。                                                                         |
| `smoothScroll`            | `Boolean`            | 否       | `false`                                        | 编程式滚动是否默认使用平滑动画。                                                                                                          |
| `itemKey`                 | `string \| Function` | 否       | `'key'`                                        | 节点唯一标识，可传字段名或 `(item, index) => key` 函数。                                                                                  |
| `itemType`                | `string \| Function` | 否       | -                                              | 非气泡节点类型标识，命中后走 `#item` 插槽渲染；可传字段名或函数。                                                                         |
| `showBackButton`          | `Boolean`            | 否       | `true`                                         | 是否显示回底按钮。                                                                                                                        |
| `backButtonThreshold`     | `Number`             | 否       | `80`                                           | 触发显示回底按钮的阈值（距底部 px）。                                                                                                     |
| `backButtonPosition`      | `Object`             | 否       | `{ bottom: '20px', left: 'calc(50% - 19px)' }` | 回底按钮的 CSS 定位，可配置 `top / right / bottom / left / transform`。                                                                   |
| `backButtonSmoothScroll`  | `Boolean`            | 否       | `true`                                         | 点击回底按钮时是否平滑滚动。                                                                                                              |
| `alwaysShowScrollbar`     | `Boolean`            | 否       | `false`                                        | 是否一直显示滚动条。                                                                                                                      |
| `btnLoading`              | `Boolean`            | 否       | `true`                                         | 是否在内置回底按钮上显示 loading 状态。                                                                                                   |
| `btnColor`                | `String`             | 否       | `'#409EFF'`                                    | 内置回底按钮颜色。                                                                                                                        |
| `btnIconSize`             | `Number`             | 否       | `24`                                           | 内置回底按钮图标大小（px）。                                                                                                              |
| `topStatus`               | `{ type, text? }`    | 否       | -                                              | 顶部边界状态，`type` 可选 `idle / loading / no-more / error`。                                                                            |
| `bottomStatus`            | `{ type, text? }`    | 否       | -                                              | 底部边界状态，同 `topStatus`。                                                                                                            |
| `loadMoreTopThreshold`    | `Number`             | 否       | `100`                                          | 触发 `@load-more-top` 的距顶阈值（px）。                                                                                                  |
| `loadMoreBottomThreshold` | `Number`             | 否       | `100`                                          | 触发 `@load-more-bottom` 的距底阈值（px）。                                                                                               |
| `shouldFollowContent`     | `Function`           | 否       | -                                              | 自定义内容跟随策略，返回 `true` 则触底，`false` 则累计未读。回调参数含 `reason / item / index / scrollState / unreadCount / autoScroll`。 |

## 事件

| 事件名                 | 参数                                                          | 说明                                                 |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| `@load-more-top`       | -                                                             | 向上滚到顶部达到阈值时触发，可在此请求加载历史消息。 |
| `@load-more-bottom`    | -                                                             | 向下滚到底部达到阈值时触发，可在此请求加载更多消息。 |
| `@scroll-state-change` | `(state: 'AT_BOTTOM' \| 'SCROLLED_UP' \| 'HAS_NEW_MESSAGES')` | 滚动状态变化时触发。                                 |
| `@unread-count-change` | `(count: number)`                                             | 未读计数变化时触发。                                 |

## Ref 实例方法

| 方法 / 属性              | 签名                                        | 说明                                                                      |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------- |
| `scrollToTop`            | `(smooth?: boolean) => void`                | 滚动到顶部，`smooth` 控制是否平滑动画（默认由 `smoothScroll` 属性决定）。 |
| `scrollToBottom`         | `(smooth?: boolean) => void`                | 滚动到底部，同时清零未读计数并重置状态机。                                |
| `scrollToBubble`         | `(index: number, smooth?: boolean) => void` | 滚动到指定索引的消息。                                                    |
| `loadMoreTopComplete`    | `() => void`                                | 顶部数据加载完成后调用，组件自动修复滚动位置。                            |
| `loadMoreBottomComplete` | `() => void`                                | 底部数据加载完成后调用。                                                  |
| `currentScrollState`     | `BubbleListScrollState`                     | 当前滚动状态：`AT_BOTTOM / SCROLLED_UP / HAS_NEW_MESSAGES`。              |
| `currentUnreadCount`     | `number`                                    | 当前未读消息数量。                                                        |

## 插槽

| 插槽名          | 上下文类型                    | 说明                                                                                                                   |
| --------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `#avatar`       | `BubbleListItemContext`       | 自定义气泡头像。                                                                                                       |
| `#header`       | `BubbleListItemContext`       | 自定义气泡顶部区域。                                                                                                   |
| `#content`      | `BubbleListItemContext`       | 自定义气泡内容区域。                                                                                                   |
| `#footer`       | `BubbleListItemContext`       | 自定义气泡底部区域。                                                                                                   |
| `#loading`      | `BubbleListItemContext`       | 自定义气泡加载状态。                                                                                                   |
| `#backToBottom` | `BubbleListBackButtonContext` | 自定义回底按钮，上下文含 `unreadCount / scrollState / label / autoScroll / virtualEnabled / scrollToBottom(smooth?)`。 |
| `#topStatus`    | `BubbleListBoundaryContext`   | 自定义顶部边界状态区，上下文含 `status / position / scrollState / unreadCount / autoScroll`。                          |
| `#bottomStatus` | `BubbleListBoundaryContext`   | 自定义底部边界状态区，同 `#topStatus`。                                                                                |
| `#item`         | `BubbleListItemContext`       | 非气泡类型节点的自定义渲染，由 `itemType` 命中后触发。                                                                 |
---

