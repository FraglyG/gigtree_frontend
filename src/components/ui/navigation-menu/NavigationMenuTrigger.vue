<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-vue-next'
import {
  NavigationMenuTrigger,
  type NavigationMenuTriggerProps,
  useForwardProps,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { navigationMenuTriggerStyle } from '.'

const props = defineProps<NavigationMenuTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <NavigationMenuTrigger
    v-bind="forwardedProps"
    :class="cn(navigationMenuTriggerStyle(), 'tw-group', props.class)"
  >
    <slot />
    <ChevronDown
      class="tw-relative tw-top-px tw-ml-1 tw-h-3 tw-w-3 tw-transition tw-duration-300 group-data-[state=open]:tw-rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuTrigger>
</template>
