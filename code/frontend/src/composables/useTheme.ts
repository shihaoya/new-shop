/**
 * 主题管理 Composable
 *
 * 提供主题切换、暗色模式切换、主题状态持久化功能
 */
import { ref } from 'vue'

export type ThemeName = '' | 'fresh-green' | 'romantic-purple' | 'vibrant-pink' | 'pure-white' | 'classic-black'

export interface ThemeOption {
  name: ThemeName
  label: string
  color: string
}

// 可用的主题选项
export const THEME_OPTIONS: ThemeOption[] = [
  { name: '', label: '科技蓝', color: '#004ac6' },
  { name: 'fresh-green', label: '清新绿', color: '#10B981' },
  { name: 'romantic-purple', label: '浪漫紫', color: '#8B5CF6' },
  { name: 'vibrant-pink', label: '活力粉', color: '#EC4899' },
  { name: 'pure-white', label: '纯净白', color: '#1F2937' },
  { name: 'classic-black', label: '经典黑', color: '#000000' },
]

// 响应式状态
const isDark = ref(false)
const currentTheme = ref<ThemeName>('')

// 从 localStorage 恢复主题状态
function restoreThemeState() {
  const savedTheme = localStorage.getItem('theme-color') as ThemeName | null
  const savedDark = localStorage.getItem('theme-dark')

  if (savedTheme !== null) {
    setTheme(savedTheme)
  }

  if (savedDark === 'true') {
    isDark.value = true
    document.documentElement.setAttribute('data-mode', 'dark')
  }
}

// 保存主题状态到 localStorage
function saveThemeState() {
  localStorage.setItem('theme-color', currentTheme.value)
  localStorage.setItem('theme-dark', isDark.value.toString())
}

// 设置主题颜色
function setTheme(theme: ThemeName) {
  currentTheme.value = theme
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme)
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  saveThemeState()
}

// 切换暗色模式
function toggleDarkMode() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.setAttribute('data-mode', 'dark')
  } else {
    document.documentElement.removeAttribute('data-mode')
  }
  saveThemeState()
}

// 初始化主题
function initTheme() {
  restoreThemeState()
}

// 导出 composable
export function useTheme() {
  return {
    isDark,
    currentTheme,
    themeOptions: THEME_OPTIONS,
    setTheme,
    toggleDarkMode,
    initTheme,
  }
}