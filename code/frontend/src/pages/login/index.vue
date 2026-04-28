<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { initRoutes } from '@/router'
import type { Role } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const roles: { label: string; value: Role }[] = [
  { label: '管理员', value: 'admin' },
  { label: '店主', value: 'shop_owner' },
  { label: '普通用户', value: 'user' },
]

const selectedRole = ref<Role>('admin')

function handleLogin() {
  userStore.mockLogin(selectedRole.value)
  initRoutes(selectedRole.value)
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
    <div class="glass rounded-3xl p-8 w-96">
      <h1 class="font-headline-md text-center mb-6">多店铺积分商城</h1>

      <div class="mb-4">
        <label class="block text-sm text-[#737686] mb-2">选择角色登录</label>
        <div class="flex gap-2">
          <button
            v-for="role in roles"
            :key="role.value"
            @click="selectedRole = role.value"
            :class="[
              'flex-1 py-2 px-4 rounded-xl text-sm transition-all',
              selectedRole === role.value
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white/50 text-[#737686] hover:bg-white/70'
            ]"
          >
            {{ role.label }}
          </button>
        </div>
      </div>

      <button
        @click="handleLogin"
        class="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        登录
      </button>
    </div>
  </div>
</template>
