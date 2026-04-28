# 前端开发指南

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`) + TypeScript
- **UI 组件**: reka-ui
- **原子 CSS**: unocss
- **构建工具**: Vite
- **类型检查**: vue-tsc

## 开发命令

```bash
pnpm dev      # 启动 Vite 开发服务器 (HMR)
pnpm build    # vue-tsc -b 类型检查 + vite build
pnpm preview  # 预览 dist/ 构建产物
```

**注意**：必须使用 pnpm，禁止使用 npm

## 入口

- `src/main.ts` → `createApp(App).mount('#app')`
- `index.html` 挂载点：`<div id="app">`

## 目录结构

```
src/
├── App.vue              # 根组件
├── main.ts              # 应用入口
├── style.css            # 全局样式
├── assets/              # 静态资源
└── components/           # Vue 组件
```

## UI 规范

- **设计风格**: 液态玻璃（Glassmorphism）
  - 毛玻璃：`backdrop-filter: blur(12px)`
  - 透明度：`background: rgba(255,255,255,0.15)`
  - 光泽边框：`border: 1px solid rgba(255,255,255,0.3)`

- **设计资产位置**:
  - CSS 变量：`UI/template/variables.css`
  - 组件样式：`UI/ui/glassmorphism_multi_store_points_mall/`
  - 页面风格指导：`UI/00_UI页面提示词.md`

- **主题系统**: 6 种颜色主题（科技蓝/清新绿/浪漫紫/活力粉/纯净白/经典黑）

## 已知限制

- 无 ESLint / Prettier（最小模板）
- 无测试框架（需自行添加）
- 无 opencode.json 自定义指令