<script setup lang="ts">
/**
 * 布局组件 - AppLayout
 *
 * 左侧边栏 + 顶部栏 + 中间内容区
 * 左侧根据路由动态生成
 */
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores'
import { useTheme, THEME_OPTIONS } from '@/composables/useTheme'
import type { RouteConfig } from '@/router'
import { getRoutesByRole } from '@/router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 主题
const { isDark, currentTheme, setTheme, toggleDarkMode, initTheme } = useTheme()
const showThemePanel = ref(false)

// 搜索
const searchQuery = ref('')

// 获取当前角色的路由
const navRoutes = computed<RouteConfig[]>(() => {
  return getRoutesByRole(userStore.currentRole).filter(r => !r.path.includes('/'))
})

// 当前激活的路径
const activePath = computed(() => '/' + route.path.split('/').filter(Boolean)[0])

// 导航点击
function handleNavClick(path: string) {
  router.push(path)
}

// 切换主题面板
function toggleThemePanel() {
  showThemePanel.value = !showThemePanel.value
}

// 退出登录
function handleLogout() {
  userStore.logout()
  router.push('/login')
}

// 初始化主题
initTheme()
</script>

<template>
  <div class="layout-wrapper">
    <!-- 背景 -->
    <div class="bg-mesh">
      <div class="bg-mesh-secondary"></div>
      <div class="bg-mesh-tertiary"></div>
    </div>

    <!-- 侧边栏 -->
    <aside class="sidebar-float">
      <!-- Logo -->
      <div class="p-6 border-b border-white/30">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004ac6] to-[#712ae2] flex items-center justify-center text-white">
            <Icon icon="material-symbols:stores" class="text-xl" />
          </div>
          <div>
            <span class="font-bold text-[#191b23] dark:text-white">ShopAdmin</span>
          </div>
        </div>
      </div>

      <!-- 导航 -->
      <nav class="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        <div
          v-for="item in navRoutes"
          :key="item.path"
          @click="handleNavClick(item.path)"
          :class="[
            'nav-item cursor-pointer',
            activePath === item.path ? 'active' : ''
          ]"
        >
          <Icon
            :icon="`material-symbols:${item.meta.icon}-outline`"
            class="nav-item-icon"
          />
          <span>{{ item.meta.title }}</span>
        </div>
      </nav>

      <!-- 底部 -->
      <div class="px-3 py-4 border-t border-white/30">
        <div class="nav-item text-[#737686] hover:text-red-500 cursor-pointer" @click="handleLogout">
          <Icon icon="material-symbols:logout" class="nav-item-icon" />
          <span>退出登录</span>
        </div>
      </div>
    </aside>

    <!-- 顶部栏 -->
    <header class="topbar-float">
      <div class="flex items-center gap-4">
        <span class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#004ac6] to-[#2563eb]">
          {{ userStore.userInfo?.nickname || '未登录' }}
        </span>
        <span class="text-xs px-2 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          {{ userStore.currentRole === 'admin' ? '管理员' : userStore.currentRole === 'shop_owner' ? '店主' : '用户' }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <!-- 搜索 -->
        <div class="relative">
          <Icon icon="material-symbols:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
          <input
            v-model="searchQuery"
            placeholder="搜索..."
            class="bg-white/50 dark:bg-white/10 border border-white/50 rounded-full py-2 pl-10 pr-4 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>

        <!-- 主题切换 -->
        <button @click="toggleThemePanel" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <Icon icon="material-symbols:palette-outline" class="text-xl text-[#737686]" />
        </button>

        <!-- 通知 -->
        <button class="p-2 rounded-xl hover:bg-white/20 transition-colors relative">
          <Icon icon="material-symbols:notifications-outline" class="text-xl text-[#737686]" />
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- 用户 -->
        <button class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <Icon icon="material-symbols:account-circle-outline" class="text-xl text-[#737686]" />
        </button>
      </div>
    </header>

    <!-- 内容区 -->
    <main class="content-area">
      <router-view />
    </main>

    <!-- 主题面板 -->
    <Transition name="fade">
      <div v-if="showThemePanel" class="theme-panel">
        <div class="mb-4">
          <p class="text-xs text-[#737686] mb-2">主题颜色</p>
          <div class="flex gap-2">
            <button
              v-for="option in THEME_OPTIONS"
              :key="option.name"
              @click="setTheme(option.name)"
              :style="{ backgroundColor: option.color }"
              :class="[
                'w-8 h-8 rounded-full border-2 transition-transform',
                currentTheme === option.name ? 'border-[var(--color-primary)] scale-110' : 'border-white'
              ]"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-[#737686]">暗色模式</span>
          <button
            @click="toggleDarkMode"
            :class="['w-12 h-6 rounded-full relative transition-colors', isDark ? 'bg-[var(--color-primary)]' : 'bg-gray-300']"
          >
            <span :class="['absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', isDark ? 'left-7' : 'left-1']" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}
</style>
