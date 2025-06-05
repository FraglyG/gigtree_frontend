<script setup lang="ts">
// PhotoFallback is now just a simple styling wrapper
// The show/hide logic is handled by the parent Photo component
</script>

<template>
    <div class="photo-fallback">
        <slot></slot>
    </div>
</template>

<style scoped>
.photo-fallback {
    width: 100%;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
}

.is-hidden {
    display: none;
}
</style>