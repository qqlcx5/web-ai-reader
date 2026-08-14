import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [presetWind3()],
  // 仅扫描 src 源码目录，排除 node_modules / dist 等
  content: {
    pipeline: {
      include: [
        /\.(vue|ts|html|css)($|\?)/,
      ],
    },
    filesystem: [
      'src/**/*.{ts,vue,html,css}',
      'index.html',
    ],
  },
  shortcuts: {
    'glass': 'bg-white/78 backdrop-blur-[16px]',
    'soft-shadow': 'shadow-[0_18px_50px_rgba(24,24,27,0.16),0_2px_8px_rgba(24,24,27,0.08)]',
    'no-scrollbar': '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
    'flex-center': 'flex items-center justify-center',
    'flex-col-center': 'flex flex-col items-center justify-center',
  },
  theme: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    colors: {
      brand: '#6366F1',
      primary: '#6C5CE7',
      secondary: '#00B894',
      accent: '#FDCB6E',
      surface: '#FAFAFA',
      // rechat 设计 token（组件可用，与 brand 配合）
      ink: '#172033',
      muted: '#667085',
      line: '#e5e7eb',
      panel: '#f8fafc',
    },
    boxShadow: {
      panel: '0 1px 3px rgba(16,24,40,.06)',
      modal: '0 24px 70px rgba(16,24,40,.24)',
    },
  },
})
