import request from '@/utils/request'
import type { ApiResponse } from '@/types'

// 店铺审核状态
export type ShopStatus = 'pending' | 'approved' | 'rejected'

// 店铺信息
export interface ShopInfo {
  id: number
  name: string
  owner_id: number
  owner_name: string
  status: ShopStatus
  invite_code: string
  created_at: string
  updated_at: string
}

// 获取店铺列表
export function getShopList(params: { page: number; page_size: number; status?: ShopStatus; keyword?: string }): Promise<ApiResponse> {
  return request.get('/shops', { params })
}

// 获取店铺详情
export function getShopDetail(id: number): Promise<ApiResponse<ShopInfo>> {
  return request.get(`/shops/${id}`)
}

// 审核店铺
export function approveShop(id: number, approved: boolean, reason?: string): Promise<ApiResponse> {
  return request.post(`/shops/${id}/approve`, { approved, reason })
}

// 生成邀请码
export function generateInviteCode(shop_id: number): Promise<ApiResponse<{ invite_code: string }>> {
  return request.post('/invite-codes/generate', { shop_id })
}
