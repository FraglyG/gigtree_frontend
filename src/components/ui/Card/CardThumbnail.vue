<template>
    <div class="card-thumbnail">
        <slot></slot>
    </div>
</template>

<style scoped>
.card-thumbnail {
    width: 100%;
    max-height: 100px;
    overflow: hidden;
}

.card-thumbnail img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
}
</style>
