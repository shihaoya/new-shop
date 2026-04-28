<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import ECharts from '@/components/ECharts.vue'

const stats = ref([
  { label: '总订单', value: '1,234', icon: 'receipt', color: '#004ac6' },
  { label: '总用户', value: '5,678', icon: 'group', color: '#10B981' },
  { label: '总积分', value: '9,999,999', icon: 'stars', color: '#F59E0B' },
  { label: '待审核', value: '12', icon: 'pending', color: '#EF4444' },
])

// 折线图配置
const lineOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['订单量', '销售额'], bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '订单量',
      type: 'line',
      smooth: true,
      data: [120, 182, 191, 234, 290, 330, 310],
      areaStyle: { opacity: 0.2 },
    },
    {
      name: '销售额',
      type: 'line',
      smooth: true,
      data: [80, 132, 151, 184, 210, 260, 240],
      areaStyle: { opacity: 0.2 },
    },
  ],
})

// 饼图配置
const pieOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { bottom: 0 },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}' },
      data: [
        { value: 1048, name: '已完成' },
        { value: 735, name: '进行中' },
        { value: 580, name: '待发货' },
        { value: 484, name: '已取消' },
      ],
    },
  ],
})
</script>

<template>
  <div class="p-6">
    <h1 class="font-headline-md mb-6">仪表盘</h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div v-for="stat in stats" :key="stat.label" class="glass rounded-2xl p-5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white" :style="{ background: stat.color }">
            <Icon :icon="`material-symbols:${stat.icon}`" class="text-xl" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ stat.value }}</p>
            <p class="text-sm text-[#737686]">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="grid grid-cols-2 gap-4">
      <div class="glass rounded-2xl p-5">
        <h3 class="font-headline-sm mb-4">订单趋势</h3>
        <ECharts :option="lineOption" height="280px" />
      </div>
      <div class="glass rounded-2xl p-5">
        <h3 class="font-headline-sm mb-4">订单分布</h3>
        <ECharts :option="pieOption" height="280px" />
      </div>
    </div>
  </div>
</template>
