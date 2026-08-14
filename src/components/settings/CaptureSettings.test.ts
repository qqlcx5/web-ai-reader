import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CaptureSettings from './CaptureSettings.vue'
import { useSettingsStore } from '@/stores/settings.store'

const settingsDb = new Map()

vi.mock('@/db/repositories/settings.repository', () => ({
  SettingsRepository: {
    get: vi.fn(async () => settingsDb.get('app-settings') || null),
    save: vi.fn(async (s: any) => { settingsDb.set('app-settings', s) }),
  },
}))

describe('CaptureSettings', () => {
  beforeEach(() => {
    settingsDb.clear()
    setActivePinia(createPinia())
  })

  it('renders proxy address field and web extraction info', async () => {
    const store = useSettingsStore()
    await store.loadSettings()
    const wrapper = mount(CaptureSettings)
    expect(wrapper.text()).toContain('代理服务地址')
    expect(wrapper.text()).toContain('关于 Web 版提取')
  })

  it('renders description about proxy bypassing CORS', async () => {
    const store = useSettingsStore()
    await store.loadSettings()
    const wrapper = mount(CaptureSettings)
    expect(wrapper.text()).toContain('绕过浏览器 CORS')
    expect(wrapper.text()).toContain('Cloudflare Worker')
  })

  it('autoExtractOnOpen is enabled by default', async () => {
    const store = useSettingsStore()
    await store.loadSettings()
    expect(store.settings.capture.autoExtractOnOpen).toBe(true)
  })

  it('autoExtractOnTabChange is false by default', async () => {
    const store = useSettingsStore()
    await store.loadSettings()
    expect(store.settings.capture.autoExtractOnTabChange).toBe(false)
  })
})
