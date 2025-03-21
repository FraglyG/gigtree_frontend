import { cva } from 'class-variance-authority'

export { default as NavigationMenu } from './NavigationMenu.vue'
export { default as NavigationMenuContent } from './NavigationMenuContent.vue'
export { default as NavigationMenuIndicator } from './NavigationMenuIndicator.vue'
export { default as NavigationMenuItem } from './NavigationMenuItem.vue'
export { default as NavigationMenuLink } from './NavigationMenuLink.vue'
export { default as NavigationMenuList } from './NavigationMenuList.vue'
export { default as NavigationMenuTrigger } from './NavigationMenuTrigger.vue'
export { default as NavigationMenuViewport } from './NavigationMenuViewport.vue'

export const navigationMenuTriggerStyle = cva(
  'tw-group tw-inline-flex tw-h-9 tw-w-max tw-items-center tw-justify-center tw-rounded-md tw-bg-background tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-transition-colors hover:tw-bg-accent hover:tw-text-accent-foreground focus:tw-bg-accent focus:tw-text-accent-foreground focus:tw-outline-none disabled:tw-pointer-events-none disabled:tw-opacity-50 data-[active]:tw-bg-accent/50 data-[state=open]:tw-bg-accent/50',
)
