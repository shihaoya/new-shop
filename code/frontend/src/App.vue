<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores'
import { initRoutes } from '@/router'

const userStore = useUserStore()

// 初始化路由
onMounted(() => {
  // 默认以 admin 角色初始化路由
  userStore.mockLogin('admin')
  initRoutes('admin')
})
</script>

<template>
  <router-view />
</template>
