<script setup>
defineProps({
    customClass: {
        type: String,
        default: ''
    }
});
</script>

<template>
    <div class="card" :class="[customClass]">
        <slot></slot>
    </div>
</template>

<style scoped>
.card {
    display: flex;
    flex-direction: column;
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    overflow: hidden;
    background-color: hsl(var(--card));
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>