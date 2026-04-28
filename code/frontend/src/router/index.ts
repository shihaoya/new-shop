import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { Role } from '@/types'
import { useUserStore } from '@/stores'

// 路由配置接口
export interface RouteConfig {
  path: string
  name: string
  component: () => Promise<any>
  meta: {
    title: string
    roles: Role[]
    icon: string
  }
}

// ==================== 页面组件（懒加载） ====================
const DashboardPage = () => import('@/pages/dashboard/index.vue')
const ShopPage = () => import('@/pages/shop/index.vue')
const UserPage = () => import('@/pages/user/index.vue')
const OrderPage = () => import('@/pages/order/index.vue')
const MessagePage = () => import('@/pages/message/index.vue')
const ProfilePage = () => import('@/pages/profile/index.vue')

// ==================== 路由模块（按角色分组） ====================

// 公共路由（所有角色可访问）
const commonRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: { title: '仪表盘', roles: ['admin', 'shop_owner', 'user'], icon: 'dashboard' },
  },
  {
    path: '/order',
    name: 'order',
    component: OrderPage,
    meta: { title: '订单管理', roles: ['admin', 'shop_owner', 'user'], icon: 'receipt' },
  },
  {
    path: '/message',
    name: 'message',
    component: MessagePage,
    meta: { title: '消息通知', roles: ['admin', 'shop_owner', 'user'], icon: 'notifications' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: { title: '个人中心', roles: ['admin', 'shop_owner', 'user'], icon: 'person' },
  },
]

// 管理员专属路由
const adminRoutes: RouteConfig[] = [
  {
    path: '/user',
    name: 'user',
    component: UserPage,
    meta: { title: '用户管理', roles: ['admin'], icon: 'group' },
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopPage,
    meta: { title: '店铺管理', roles: ['admin'], icon: 'storefront' },
  },
]

// 店主专属路由
const shopOwnerRoutes: RouteConfig[] = [
  {
    path: '/shop',
    name: 'shop',
    component: ShopPage,
    meta: { title: '我的店铺', roles: ['shop_owner'], icon: 'storefront' },
  },
]

// ==================== 路由表生成 ====================

// 获取基于角色的路由表
export function getRoutesByRole(role: Role): RouteConfig[] {
  const roleRoutes: Record<Role, RouteConfig[]> = {
    admin: [...commonRoutes, ...adminRoutes],
    shop_owner: [...commonRoutes, ...shopOwnerRoutes],
    user: commonRoutes,
  }
  return roleRoutes[role] || commonRoutes
}

// 生成 Vue Router 路由记录
function generateRoutes(role: Role): RouteRecordRaw[] {
  const routes = getRoutesByRole(role)

  return [
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: routes.map(route => ({
        path: route.path.replace(/^\//, ''),
        name: route.name,
        component: route.component,
        meta: route.meta,
      })),
    },
  ]
}

// ==================== 创建路由器 ====================

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

// ==================== 路由守卫 ====================

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const role = userStore.currentRole

  // 白名单路由
  const whiteList = ['/login']
  if (whiteList.includes(to.path)) {
    return next()
  }

  // 检查是否已登录
  if (!userStore.isLogin) {
    return next('/login')
  }

  // 获取该角色的可用路由
  const roleRoutes = getRoutesByRole(role)
  const path = '/' + (to.path.replace(/^\//, ''))

  // 检查是否有权限访问
  const hasPermission = roleRoutes.some(
    route => route.path === path || route.path === to.path
  )

  if (hasPermission) {
    next()
  } else {
    console.warn(`[Router] No permission: ${to.path}, role: ${role}`)
    next('/dashboard')
  }
})

// ==================== 路由初始化 ====================

// 根据角色动态加载路由
export function initRoutes(role: Role) {
  const routes = generateRoutes(role)

  // 清空现有路由并添加新路由
  router.getRoutes().forEach(route => {
    if (route.name) {
      router.removeRoute(route.name)
    }
  })

  routes.forEach(route => {
    if (route.children) {
      router.addRoute('root', route)
    } else {
      router.addRoute(route)
    }
  })

  console.log(`[Router] Routes initialized for role: ${role}`)
}

export { router }
export default router