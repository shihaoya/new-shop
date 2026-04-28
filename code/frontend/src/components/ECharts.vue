<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

interface Props {
  option: Record<string, any>
  width?: string | number
  height?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '300px',
})

const chartOption = computed(() => props.option)
const chartStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))
</script>

<template>
  <v-chart
    ref="chartRef"
    :option="chartOption"
    :style="chartStyle"
    autoresize
  />
</template>
