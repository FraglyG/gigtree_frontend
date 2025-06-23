<script setup lang="ts">
import { User } from 'lucide-vue-next';
import { Photo, PhotoFallback, PhotoLoading } from '../Photo';
import { Skeleton } from '../Skeleton';
import { toRefs, ref, watch, onMounted } from 'vue';

const props = withDefaults(defineProps<{
    src?: string | Promise<string | undefined>;
    alt?: string;
    class?: string;
    sizePx?: number;
}>(), {
    sizePx: 56,
});

const { src, alt, class: customClass, sizePx } = toRefs(props);
const resolvedSrc = ref<string | undefined>();

// Function to resolve the src
async function resolveSrc() {
    if (!src.value) {
        resolvedSrc.value = undefined;
        return;
    }

    try {
        if (src.value instanceof Promise) resolvedSrc.value = await src.value;
        else resolvedSrc.value = src.value;
    } catch (error) {
        console.warn('Failed to resolve avatar src:', error);
        resolvedSrc.value = undefined;
    }
}

watch(src, resolveSrc, { immediate: true });
onMounted(resolveSrc);

const getSize = (offset: number = 0) => `${sizePx.value + offset}px`;
</script>

<template>
    <Photo :key="resolvedSrc" :src="resolvedSrc" :alt="alt" :class="customClass"
        :style="{ width: getSize(), height: getSize() }" class="tw-rounded-full tw-object-cover">
        <PhotoFallback>
            <div :style="{ width: getSize(), height: getSize() }"
                class="tw-rounded-full tw-bg-input tw-p-2 tw-border tw-border-border">
                <User class="tw-w-full tw-h-full" />
            </div>
        </PhotoFallback>
        <PhotoLoading>
            <Skeleton :style="{ width: getSize(), height: getSize() }" class="tw-rounded-full" />
        </PhotoLoading>
    </Photo>
</template>

<style scoped></style>