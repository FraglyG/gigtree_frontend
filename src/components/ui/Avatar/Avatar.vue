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

const getSize = (offset: number = 0) => {
    return `${sizePx.value + offset}px`;
};

</script>

<template>
    <Photo :src="src" :alt="alt" :class="customClass">
        <PhotoFallback>
            <div :style="{ width: getSize(), height: getSize() }" class="tw-rounded-full tw-bg-input tw-p-2 tw-border tw-border-border">
                <User class="tw-w-full tw-h-full" />
            </div>
        </PhotoFallback>
        <PhotoLoading>
            <Skeleton :style="{ width: getSize(), height: getSize() }" class="tw-rounded-full" />
        </PhotoLoading>
    </Photo>
</template>

<style scoped></style>