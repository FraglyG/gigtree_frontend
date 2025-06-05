<script setup lang="ts">

const props = defineProps<{
    class?: string;
}>();

const customClass = props.class;

</script>

<template>
    <div class="tw-w-full tw-h-full tw-bg-black">
        <div :class="['tw-animate-pulse tw-bg-gray-800', customClass]"></div>
    </div>
</template>

<style scoped></style>