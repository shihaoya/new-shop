import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
} from 'unocss'

// https://unocss.dev/config/
export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      // 使用本地 material-symbols 图标集
      collections: {
        'material-symbols': () => import('@iconify-json/material-symbols/icons.json').then(i => i.default),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  theme: {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      danger: 'var(--color-danger)',
    },
  },
  shortcuts: {
    // 玻璃效果
    'glass': 'bg-white/40 backdrop-blur-xl border border-white/50',
    'glass-dark': 'bg-black/40 backdrop-blur-xl border border-white/10',
    // 按钮
    'btn': 'px-4 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer',
    'btn-primary': 'bg-[var(--color-primary)] text-white hover:opacity-90',
    'btn-ghost': 'bg-transparent hover:bg-white/20',
    // 图标
    'i-material-symbols': 'w-1em h-1em inline-block',
  },
})
