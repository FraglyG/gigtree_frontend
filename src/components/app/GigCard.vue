<script setup lang="ts">
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BriefcaseBusiness, IdCard } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';

const props = defineProps<{
    userId: string;
    thumbnailUrl: string;
    name: string;
    description: string;
    tags: string[];
}>();

const shortenDescription = ref(props.description.length > 100);
const paddedDescription = shortenDescription.value
    ? `${props.description.slice(0, 100)}...`
    : props.description;

// Track image loading state
const imageRef = ref<HTMLImageElement | null>(null);
const imageLoaded = ref(false);
const handleImageLoaded = () => imageLoaded.value = true;

onMounted(() => {
    if (imageRef.value && imageRef.value.complete) imageLoaded.value = true;
});
</script>

<template>
    <Card class="tw-overflow-hidden tw-min-w-56 tw-max-w-56">
        <div class="tw-relative tw-w-full tw-h-24">
            <!-- Skeleton loader -->
            <div v-if="!imageLoaded" class="tw-w-full tw-h-24 tw-bg-gray-800 tw-animate-pulse"></div>

            <!-- Actual image with loading handler -->
            <img ref="imageRef" :src="thumbnailUrl" class="tw-w-full tw-max-w-56 tw-h-24 tw-object-cover"
                alt="Gig Image" @load="handleImageLoaded"
                :class="{ 'tw-opacity-0': !imageLoaded, 'tw-opacity-100': imageLoaded }" />
        </div>
        <CardHeader class="tw-p-5 tw-pt-4">
            <CardTitle>{{ name }}</CardTitle>
            <CardDescription>
                {{ paddedDescription }}
                <a v-if="shortenDescription" class="link" href="#">read more</a>
            </CardDescription>
        </CardHeader>
        <CardContent class="tw-p-5 tw-flex tw-flex-wrap tw-gap-1">
            <Badge variant="outline" v-for="tag in tags">{{ tag }}</Badge>
        </CardContent>
        <CardFooter class="tw-p-5 tw-flex tw-flex-row tw-gap-2">
            <Button size="sm" variant="default" as-child>
                <a href="">
                    <BriefcaseBusiness /> Hire
                </a>
            </Button>
            <Button size="sm" variant="secondary" as-child>
                <a href="">
                    <IdCard /> Profile
                </a>
            </Button>
        </CardFooter>
    </Card>
</template>

<style scoped>
img {
    transition: opacity 0.3s ease;
}
</style>