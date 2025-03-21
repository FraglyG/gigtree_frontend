<script setup lang="ts">
import { cn } from '@/lib/utils'
import { NavigationMenuList, type NavigationMenuListProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<NavigationMenuListProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <NavigationMenuList
    v-bind="forwardedProps"
    :class="
      cn(
        'tw-group tw-flex tw-flex-1 tw-list-none tw-items-center tw-justify-center tw-gap-x-1',
        props.class,
      )
    "
  >
    <slot />
  </NavigationMenuList>
</template>
