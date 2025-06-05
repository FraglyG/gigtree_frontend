<script setup lang="ts">
import { User } from 'lucide-vue-next';
import { Photo, PhotoFallback, PhotoLoading } from '../Photo';
import { Skeleton } from '../Skeleton';
import { toRefs } from 'vue';

const props = withDefaults(defineProps<{
    src?: string;
    alt?: string;
    class?: string;
    sizePx?: number;
}>(), {
    sizePx: 56,
});

const { src, alt, class: customClass, sizePx } = toRefs(props);

const getSize = () => {
    return `${sizePx.value}px`;
};

</script>

<template>
    <Photo :src="src" :alt="alt" :class="customClass">
        <PhotoFallback>
            <User :style="{ width: getSize(), height: getSize() }" />
        </PhotoFallback>
        <PhotoLoading>
            <Skeleton :style="{ width: getSize(), height: getSize() }" />
        </PhotoLoading>
    </Photo>
</template>

<style scoped></style>