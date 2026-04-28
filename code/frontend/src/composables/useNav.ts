/**
 * 导航状态管理 Composable
 *
 * 提供导航菜单状态管理、激活项切换功能
 */
import { ref, computed } from 'vue'

export interface NavItem {
  name: string
  icon: string
  active: boolean
}

// 默认导航菜单
const DEFAULT_NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: 'dashboard', active: true },
  { name: '店铺管理', icon: 'storefront', active: false },
  { name: '用户管理', icon: 'group', active: false },
  { name: '订单管理', icon: 'receipt', active: false },
  { name: '消息通知', icon: 'notifications', active: false },
  { name: '个人中心', icon: 'person', active: false },
]

// 响应式状态
const navItems = ref<NavItem[]>([...DEFAULT_NAV_ITEMS])
const searchQuery = ref('')

// 导航切换回调
let onNavChangeCallback: ((index: number, item: NavItem) => void) | null = null

// 设置当前激活的导航项
function setActive(index: number) {
  navItems.value.forEach((item, i) => {
    item.active = i === index
  })
  if (onNavChangeCallback) {
    onNavChangeCallback(index, navItems.value[index])
  }
}

// 获取当前激活的导航项
const activeNavItem = computed(() => {
  return navItems.value.find(item => item.active) || navItems.value[0]
})

// 获取当前激活索引
const activeIndex = computed(() => {
  return navItems.value.findIndex(item => item.active)
})

// 设置导航切换回调
function onNavChange(callback: (index: number, item: NavItem) => void) {
  onNavChangeCallback = callback
}

// 重置导航到默认状态
function resetNav() {
  navItems.value = DEFAULT_NAV_ITEMS.map(item => ({ ...item, active: false }))
  DEFAULT_NAV_ITEMS[0].active = true
}

// 自定义导航项
function setNavItems(items: NavItem[]) {
  navItems.value = items
}

// 导出 composable
export function useNav() {
  return {
    navItems,
    searchQuery,
    activeNavItem,
    activeIndex,
    setActive,
    onNavChange,
    resetNav,
    setNavItems,
    DEFAULT_NAV_ITEMS,
  }
}
