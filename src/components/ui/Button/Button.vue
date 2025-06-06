<script setup lang="ts">
import { computed, toRefs } from 'vue';

const variantList = {
    primary: {
        base: "tw-bg-primary hover:tw-bg-primary/90",
        outline: "tw-bg-zinc-800/20 hover:tw-bg-primary/90 tw-border tw-border-solid tw-border-primary tw-text-primary hover:tw-text-white",
    },
    secondary: {
        base: "tw-bg-secondary hover:tw-bg-secondary/90",
        outline: "tw-bg-zinc-800/20 hover:tw-bg-secondary/90 tw-border tw-border-solid tw-border-secondary tw-text-secondary hover:tw-text-white",
    },
    information: {
        base: "tw-bg-information hover:tw-bg-information/90",
        outline: "tw-bg-zinc-800/20 hover:tw-bg-information/90 tw-border tw-border-solid tw-border-information tw-text-information hover:tw-text-white",
    },
    success: {
        base: "tw-bg-success hover:tw-bg-success/90",
        outline: "tw-bg-zinc-800/20 hover:tw-bg-success/90 tw-border tw-border-solid tw-border-success tw-text-success hover:tw-text-white",
    },
    muted: {
        base: "tw-bg-muted hover:tw-bg-muted/90",
        outline: "tw-bg-zinc-800/20 hover:tw-bg-muted/90 tw-border tw-border-solid tw-border-muted tw-text-muted hover:tw-text-white",
    }
}

const sizeList = {
    sm: "tw-text-xs tw-p-2 tw-pt-1 tw-pb-1",
    md: "tw-text-sm tw-p-3 tw-pt-1 tw-pb-1",
    lg: "tw-text-lg tw-p-4 tw-pt-1 tw-pb-1"
}

const props = withDefaults(defineProps<{
    variant?: keyof typeof variantList;
    size?: "sm" | "md" | "lg";
    outline?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    class?: string;
    id?: string;
    href?: string;
}>(), {
    variant: "primary",
    size: "md",
    outline: false,
    disabled: false,
})

const { variant, disabled, type, class: customClass } = toRefs(props);

const variantClass = computed(() => {
    const currentVariantStyle = variantList[variant.value] || variantList.primary;
    const sizeStyle = sizeList[props.size] || sizeList.md;
    const variantStyle = props.outline ? currentVariantStyle.outline : currentVariantStyle.base;
    return `${variantStyle} ${sizeStyle}`;
}); 
</script>

<template>
    <!-- remake .button in tw- tailwind classes -->
    <component :is="href ? 'a' : 'button'"
        :class="['tw-rounded tw-font-semibold tw-transition-colors', variantClass, customClass]"
        :disabled="href ? undefined : disabled" :type="href ? undefined : type" :id="id" :href="href">
        <slot></slot>
    </component>
</template>