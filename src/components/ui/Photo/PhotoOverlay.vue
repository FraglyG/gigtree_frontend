<script setup lang="ts">
const props = defineProps<{
    class?: string
    position?: 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}>()

const positionClasses = {
    'center': 'tw-items-center tw-justify-center',
    'top': 'tw-items-start tw-justify-center',
    'bottom': 'tw-items-end tw-justify-center',
    'top-left': 'tw-items-start tw-justify-start',
    'top-right': 'tw-items-start tw-justify-end',
    'bottom-left': 'tw-items-end tw-justify-start',
    'bottom-right': 'tw-items-end tw-justify-end'
}

const overlayClass = [
    'tw-absolute tw-inset-0 tw-flex tw-pointer-events-none',
    positionClasses[props.position || 'center'],
    props.class
].join(' ')
</script>

<template>
    <div :class="overlayClass">
        <div class="tw-w-full tw-h-full tw-pointer-events-auto tw-overflow-hidden">
            <slot />
        </div>
    </div>
</template>
