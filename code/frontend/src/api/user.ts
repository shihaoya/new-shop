import request from '@/utils/request'
import type { ApiResponse, UserInfo, LoginRequest, LoginResponse } from '@/types'

// 登录
export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return request.post('/auth/login', data)
}

// 登出
export function logout(): Promise<ApiResponse> {
  return request.post('/auth/logout')
}

// 获取当前用户信息
export function getCurrentUser(): Promise<ApiResponse<UserInfo>> {
  return request.get('/auth/current-user')
}

// 获取用户列表（管理员）
export function getUserList(params: { page: number; page_size: number; keyword?: string }): Promise<ApiResponse> {
  return request.get('/users', { params })
}

// 更新用户信息
export function updateUser(id: number, data: Partial<UserInfo>): Promise<ApiResponse> {
  return request.put(`/users/${id}`, data)
}
