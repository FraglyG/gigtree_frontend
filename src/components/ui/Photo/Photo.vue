<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'

const props = defineProps<{
    src?: string
    alt?: string
    fallbackSrc?: string
}>()

const imageLoaded = ref(false)
const imageError = ref(false)
const isLoading = ref(true)

// Provide states to the fallback component
provide('photoLoaded', imageLoaded)
provide('photoError', imageError)
provide('isLoading', isLoading)

function handleImageLoaded() {
    imageLoaded.value = true
    imageError.value = false
    isLoading.value = false
}

function handleImageError() {
    imageLoaded.value = false
    imageError.value = true
    isLoading.value = false
}

onMounted(() => {
    // If no src is provided, treat as if the image errored
    if (!props.src) {
        imageError.value = true
        isLoading.value = false
    }
})
</script>

<template>
    <div class="photo-container" :class="{ 'is-loading': isLoading, 'has-error': imageError }">
        <img v-if="src && !imageError" :src="src" :alt="alt" class="photo" @load="handleImageLoaded"
            @error="handleImageError" :class="{ 'tw-opacity-0': isLoading, 'tw-opacity-100': !isLoading }" />
        <img v-if="fallbackSrc && imageError" :src="fallbackSrc" :alt="alt" class="photo fallback-image" />
        <div class="fallback-content" v-if="isLoading || imageError">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.photo-container {
    position: relative;
    width: 100%;
    height: fit-content;
    overflow: hidden;
}

.photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.5s ease;
}

.fallback-content {
    top: 0;
    left: 0;
    width: 100%;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
}

.is-loading {
    background-color: #f3f4f600;
}

.has-error .fallback-content {
    z-index: 10;
}
</style>