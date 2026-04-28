import request from '@/utils/request'
import type { ApiResponse } from '@/types'

// 订单状态
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

// 订单信息
export interface OrderInfo {
  id: number
  order_no: string
  user_id: number
  user_nickname: string
  shop_id: number
  shop_name: string
  total_points: number
  status: OrderStatus
  created_at: string
  updated_at: string
}

// 获取订单列表
export function getOrderList(params: {
  page: number
  page_size: number
  status?: OrderStatus
  shop_id?: number
  keyword?: string
}): Promise<ApiResponse> {
  return request.get('/orders', { params })
}

// 获取订单详情
export function getOrderDetail(id: number): Promise<ApiResponse<OrderInfo>> {
  return request.get(`/orders/${id}`)
}

// 更新订单状态
export function updateOrderStatus(id: number, status: OrderStatus): Promise<ApiResponse> {
  return request.put(`/orders/${id}/status`, { status })
}
