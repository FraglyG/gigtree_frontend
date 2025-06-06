<script setup lang="ts">
import { inject, type Ref } from 'vue';

const photoLoaded = inject<Ref<boolean>>('photoLoaded')
const photoError = inject<Ref<boolean>>('photoError')
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