<script setup lang="ts">
import { nextTick, onMounted, provide, ref, toRefs } from 'vue';

const props = defineProps<{
    src?: string
    alt?: string
    fallbackSrc?: string
    class?: string
    skeleton?: boolean
}>()

const customClass = toRefs(props).class;
const imageLoaded = ref(false)
const imageError = ref(false)
const isLoading = ref(true)
const imgRef = ref<HTMLImageElement>()

// Provide states to the fallback component
provide('photoLoaded', imageLoaded)
provide('photoError', imageError)
provide('isLoading', isLoading)

// Image load handlers
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

onMounted(async () => {
    // no src -> assume error
    if (!props.src) return handleImageError();

    // Take a tea-break before checking the image again
    await nextTick()

    // Has image loaded already?
    // This is necassery because if image loads before the component loads then there's no way to check its state
    // which means it can get stuck in a load stage
    if (imgRef.value && imgRef.value.complete) {
        if (imgRef.value.naturalWidth > 0) handleImageLoaded()
        else handleImageError()
    }
})
</script>

<template>
    <div :class="['photo-container', { 'is-loading': isLoading, 'has-error': imageError }, customClass]">
        <img v-if="src && !imageError" ref="imgRef" :src="src" :alt="alt" class="photo"
            :class="{ 'tw-opacity-0': !imageLoaded, 'tw-opacity-100': imageLoaded, 'tw-absolute': !imageLoaded }"
            @load="handleImageLoaded" @error="handleImageError" />
        <img v-if="fallbackSrc && imageError" :src="fallbackSrc" :alt="alt" class="photo fallback-image" />
        <slot />
    </div>
</template>

<style scoped>
.photo-container {
    position: relative;
    overflow: hidden;
}

.photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.5s ease;
}

.is-loading {
    background-color: #f3f4f600;
}
</style>