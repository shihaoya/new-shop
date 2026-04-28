<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
})

const iconName = computed(() => {
  // 转换格式: dashboard -> material-symbols:dashboard
  if (props.icon.includes(':')) {
    return props.icon
  }
  return `material-symbols:${props.icon}`
})
</script>

<template>
  <Icon :icon="iconName" :width="size" :height="size" />
</template>
