<script setup lang="ts">
import { inject, type Ref } from 'vue'

const photoLoaded = inject<Ref<boolean>>('photoLoaded')
const photoError = inject<Ref<boolean>>('photoError')
const isLoading = inject<Ref<boolean>>('isLoading')
</script>

<template>
    <div v-if="isLoading && !photoError && !photoLoaded" class="photo-loading">
        <slot></slot>
    </div>
</template>

<style scoped>
.photo-loading {
    top: 0;
    left: 0;
    min-height: fit-content;
    min-width: fit-content;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    overflow: hidden;
}

.is-hidden {
    display: none;
}
</style>