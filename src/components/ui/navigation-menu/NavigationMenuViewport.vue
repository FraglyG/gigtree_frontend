<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  NavigationMenuViewport,
  type NavigationMenuViewportProps,
  useForwardProps,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<NavigationMenuViewportProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <div class="tw-absolute tw-left-0 tw-top-full tw-flex tw-justify-center">
    <NavigationMenuViewport
      v-bind="forwardedProps"
      :class="
        cn(
          'tw-origin-top-center tw-relative tw-mt-1.5 tw-h-[--reka-navigation-menu-viewport-height] tw-w-full tw-overflow-hidden tw-rounded-md tw-border tw-bg-popover tw-text-popover-foreground tw-shadow data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-90 md:tw-w-[--reka-navigation-menu-viewport-width]',
          props.class,
        )
      "
    />
  </div>
</template>
