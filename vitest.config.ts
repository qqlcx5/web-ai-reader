import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/components/**/*.test.ts',
      'src/stores/**/*.test.ts',
      'src/db/**/*.test.ts',
      'src/services/**/*.test.ts',
      'src/utils/**/*.test.ts',
      'src/types/**/*.test.ts',
    ],
  },
})
