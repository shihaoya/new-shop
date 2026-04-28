// 用户角色类型
export type Role = 'admin' | 'shop_owner' | 'user'

// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  nickname: string
  role: Role
  avatar?: string
  shop_id?: number // 店铺ID，shop_owner 角色特有
  phone?: string
  email?: string
  created_at?: string
}

// API 响应统一格式
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页参数
export interface PaginationParams {
  page: number
  page_size: number
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user_info: UserInfo
}
