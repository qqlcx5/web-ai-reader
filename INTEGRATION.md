# 集成说明文档

本项目已成功集成以下依赖：

## 📦 已安装的依赖

### 生产依赖
- **element-plus** `^2.13.3` - Vue 3 UI 组件库
- **lodash-es** `^4.17.23` - Lodash ES 模块版本

### 开发依赖
- **unocss** `^66.6.5` - 原子化 CSS 引擎
- **@iconify-json/tabler** `^1.2.29` - Tabler 图标集
- **sass-embedded** `^1.97.3` - 嵌入式 Sass 编译器
- **@types/lodash-es** `^4.17.12` - Lodash-ES TypeScript 类型定义

## ⚙️ 配置文件

### 1. Vite 配置 ([vite.config.ts](vite.config.ts))
已添加 UnoCSS 插件：
```typescript
import UnoCSS from 'unocss/vite'

plugins: [
  // ...
  UnoCSS(),
]
```

### 2. UnoCSS 配置 ([uno.config.ts](uno.config.ts))
包含以下预设和功能：
- **presetUno** - 默认原子类预设
- **presetAttributify** - 属性化模式
- **presetIcons** - 图标支持（Tabler 图标集）
- **presetTypography** - 排版预设
- **presetWebFonts** - Web 字体
- **transformerDirectives** - 指令转换器
- **transformerVariantGroup** - 变体组转换器

### 3. 主入口配置 ([src/main.ts](src/main.ts))
已添加：
```typescript
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:uno.css'

app.use(ElementPlus)
```

## 🎨 使用示例

### UnoCSS 原子类
```html
<!-- 布局 -->
<div class="flex items-center justify-center">
  <div class="grid grid-cols-3 gap-4">...</div>
</div>

<!-- 样式 -->
<div class="p-4 bg-blue-500 text-white rounded-lg">
  蓝色盒子
</div>
```

### Tabler 图标
```html
<!-- 使用图标 -->
<span class="i-tabler-home text-2xl text-primary"></span>
<span class="i-tabler-user text-success"></span>
<span class="i-tabler-settings text-warning"></span>
```

### Element Plus 组件
```html
<el-button type="primary">主要按钮</el-button>
<el-button type="success">成功按钮</el-button>
<el-card>
  <template #header>卡片标题</template>
  卡片内容
</el-card>
```

### Lodash-ES 工具函数
```typescript
import { cloneDeep, debounce, throttle } from 'lodash-es'

// 深拷贝
const cloned = cloneDeep(originalObject)

// 防抖
const debouncedFn = debounce(() => { ... }, 300)

// 节流
const throttledFn = throttle(() => { ... }, 300)
```

### Sass/SCSS 样式
```scss
<style scoped lang="scss">
$primary-color: #409eff;

.component {
  color: $primary-color;

  &:hover {
    opacity: 0.8;
  }
}
</style>
```

## 🚀 开发工具

### UnoCSS Inspector
开发模式下访问：`http://localhost:5174/__unocss/`
- 实时预览原子类
- 搜索和测试类名
- 查看生成的 CSS

### Vue DevTools
开发模式下访问：`http://localhost:5174/__devtools__/`
- 组件树查看
- 状态管理调试
- 性能分析

## 📝 自定义配置

### 修改主题颜色
编辑 [uno.config.ts](uno.config.ts)：
```typescript
theme: {
  colors: {
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    info: '#909399',
  },
}
```

### 添加快捷类
在 `uno.config.ts` 的 `shortcuts` 中添加：
```typescript
shortcuts: [
  {
    'flex-center': 'flex items-center justify-center',
    'card-base': 'p-4 bg-white rounded-lg shadow',
  },
]
```

## 🎯 最佳实践

1. **UnoCSS** - 优先使用原子类，避免自定义 CSS
2. **Element Plus** - 按需使用组件，已全局注册
3. **图标** - 使用 Tabler 图标集，保持风格统一
4. **Lodash-ES** - 使用 ES 模块导入，支持 Tree Shaking
5. **Sass** - 仅在需要复杂样式逻辑时使用

## 📚 参考文档

- [UnoCSS 文档](https://unocss.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [Tabler 图标](https://tabler.io/icons)
- [Lodash 文档](https://lodash.com/)
- [Sass 文档](https://sass-lang.com/)
