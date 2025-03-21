<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  NavigationMenuRoot,
  type NavigationMenuRootEmits,
  type NavigationMenuRootProps,
  useForwardPropsEmits,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import NavigationMenuViewport from './NavigationMenuViewport.vue'

const props = defineProps<NavigationMenuRootProps & { class?: HTMLAttributes['class'] }>()

const emits = defineEmits<NavigationMenuRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <NavigationMenuRoot
    v-bind="forwarded"
    :class="cn('tw-relative tw-z-10 tw-flex tw-max-w-max tw-flex-1 tw-items-center tw-justify-center', props.class)"
  >
    <slot />
    <NavigationMenuViewport />
  </NavigationMenuRoot>
</template>
