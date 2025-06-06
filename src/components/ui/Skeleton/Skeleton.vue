<script setup lang="ts">
import { toRefs } from 'vue';


const props = withDefaults(defineProps<{
    class?: string;
    containerClass?: string;
}>(), {
    class: "tw-w-full tw-h-full",
    containerClass: "tw-w-fit tw-h-fit"
});

const customClass = toRefs(props).class;

</script>

<template>
    <div :class="['tw-bg-black tw-overflow-hidden', customClass]">
        <div :class="['tw-animate-pulse tw-bg-gray-800', 'tw-w-full tw-h-full']"></div>
    </div>
</template>

<style scoped></style>