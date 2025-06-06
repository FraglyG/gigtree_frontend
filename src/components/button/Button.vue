<script setup lang="ts">
import { computed, toRefs } from 'vue';

const variantList = {
    primary: {
        base: "tw-bg-primary hover:tw-bg-primary/90",
        outline: "tw-bg-background hover:tw-bg-primary/90 tw-border tw-border-solid tw-border-primary tw-text-primary hover:tw-text-white",
    },
    secondary: {
        base: "tw-bg-secondary hover:tw-bg-secondary/90",
        outline: "tw-bg-background hover:tw-bg-secondary/90 tw-border tw-border-solid tw-border-secondary tw-text-secondary hover:tw-text-white",
    },
}

const sizeList = {
    sm: "tw-text-xs tw-p-3 tw-pt-1 tw-pb-1",
    md: "tw-text-sm tw-p-3 tw-pt-1 tw-pb-1",
    lg: "tw-text-lg tw-p-3 tw-pt-1 tw-pb-1"
}

const props = withDefaults(defineProps<{
    variant?: keyof typeof variantList;
    size?: "sm" | "md" | "lg";
    outline?: boolean;
}>(), {
    variant: "primary",
    size: "md",
    outline: false,
})

const { variant } = toRefs(props);

const variantClass = computed(() => {
    const currentVariantStyle = variantList[props.variant] || variantList.primary;
    const sizeStyle = sizeList[props.size] || sizeList.md;
    const variantStyle = props.outline ? currentVariantStyle.outline : currentVariantStyle.base;
    return `${variantStyle} ${sizeStyle}`;
}); 
</script>

<template>
    <!-- remake .button in tw- tailwind classes -->
    <button :class="['tw-rounded', variantClass]">
        <slot></slot>
    </button>
</template>

<style scoped>
.button {
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    overflow: hidden;
    background-color: hsl(var(--card));
}
</style>