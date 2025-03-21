<script setup lang="ts">
import { cn } from '@/lib/utils'
import { NavigationMenuIndicator, type NavigationMenuIndicatorProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<NavigationMenuIndicatorProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <NavigationMenuIndicator
    v-bind="forwardedProps"
    :class="cn('tw-top-full tw-z-[1] tw-flex tw-h-1.5 tw-items-end tw-justify-center tw-overflow-hidden data-[state=visible]:tw-animate-in data-[state=hidden]:tw-animate-out data-[state=hidden]:tw-fade-out data-[state=visible]:tw-fade-in', props.class)"
  >
    <div class="tw-relative tw-top-[60%] tw-h-2 tw-w-2 tw-rotate-45 tw-rounded-tl-sm tw-bg-border tw-shadow-md" />
  </NavigationMenuIndicator>
</template>
