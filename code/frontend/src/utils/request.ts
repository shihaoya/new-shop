import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 token 到请求头
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加时间戳防止缓存（GET 请求）
    if (config.method === 'get' && config.params) {
      config.params._t = Date.now()
    }

    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    })

    return config
  },
  (error: AxiosError) => {
    console.error('[Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    console.log(`[Response] ${response.config.url}`, res)

    // 根据后端统一响应格式判断
    if (res.code !== 200 && res.code !== 0) {
      // 业务错误
      console.error(`[Business Error] ${res.code}: ${res.message}`)

      // Token 过期或无效
      if (res.code === 401 || res.code === 403) {
        // 清除本地存储并跳转登录
        localStorage.removeItem('token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }

      return Promise.reject(new Error(res.message || 'Request failed'))
    }

    return response
  },
  (error: AxiosError<ApiResponse>) => {
    console.error('[Response Error]', error)

    // 处理网络错误
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
      return Promise.reject(new Error('请求超时，请稍后重试'))
    }

    if (!navigator.onLine) {
      console.error('Network offline')
      return Promise.reject(new Error('网络连接已断开'))
    }

    // 处理 HTTP 错误状态码
    if (error.response) {
      const status = error.response.status

      switch (status) {
        case 400:
          return Promise.reject(new Error('请求参数错误'))
        case 401:
          localStorage.removeItem('token')
          localStorage.removeItem('user_info')
          window.location.href = '/login'
          return Promise.reject(new Error('登录已过期，请重新登录'))
        case 403:
          return Promise.reject(new Error('没有访问权限'))
        case 404:
          return Promise.reject(new Error('请求的资源不存在'))
        case 500:
          return Promise.reject(new Error('服务器内部错误'))
        case 502:
          return Promise.reject(new Error('网关错误'))
        case 503:
          return Promise.reject(new Error('服务不可用'))
        default:
          return Promise.reject(new Error(`请求失败 (${status})`))
      }
    }

    return Promise.reject(new Error(error.message || '网络异常'))
  }
)

// 导出 request 实例
export default request
