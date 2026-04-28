import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Role, UserInfo } from '@/types'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLogin = computed(() => !!token.value)
  const currentRole = computed<Role>(() => userInfo.value?.role || 'user')

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function logout() {
    userInfo.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user_info')
  }

  function mockLogin(role: Role = 'admin') {
    const mockUser: UserInfo = {
      id: 1,
      username: role === 'admin' ? 'admin' : role === 'shop_owner' ? 'owner01' : 'user01',
      nickname: role === 'admin' ? '超级管理员' : role === 'shop_owner' ? '店主张三' : '用户李四',
      role,
    }
    setUserInfo(mockUser)
    setToken('mock-token-' + Date.now())
  }

  return {
    userInfo,
    token,
    isLogin,
    currentRole,
    setUserInfo,
    setToken,
    logout,
    mockLogin,
  }
})