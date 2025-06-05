<script setup lang="ts">
import { inject } from 'vue';

const photoLoaded = inject('photoLoaded', false)
const photoError = inject('photoError', false)
</script>

<template>
    <div v-if="photoError && !photoLoaded" class="photo-fallback">
        <slot></slot>
    </div>
</template>

<style scoped>
.photo-fallback {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}
</style>