<script lang="ts" setup>
import { Card, CardThumbnail, CardHeader, CardFooter, CardBody } from '@/components/ui/Card';
import { Photo, PhotoFallback, PhotoLoading } from '../Photo';
import { Skeleton } from '../Skeleton';
import ImageLoadFail from "@/assets/image_load_fail.svg";

defineProps<{
    userId: string;
    name: string;
    description: string;
    thumbnailUrl?: string;
}>();

function createColorFromUsername(username: string): string {
    const hash = Array.from(username).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
}
</script>

<template>
    <Card class="tw-w-[240px]">
        <CardThumbnail>
            <Photo v-if="thumbnailUrl" skeleton :src="thumbnailUrl" :fallbackSrc="ImageLoadFail.src"
                alt="Gig Thumbnail">
                <PhotoLoading>
                    <Skeleton class="tw-w-full tw-h-[100px]" />
                </PhotoLoading>
            </Photo>
            <div v-else class="tw-w-full tw-h-[100px] tw-bg-muted tw-rounded">
                <!-- Random color based on user's username as seed -->
                <div class="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center"
                    :style="{ backgroundColor: createColorFromUsername(name) }">
                    <span class="tw-text-muted-foreground tw-text-lg">{{ name.split(" ").map(c => c.charAt(0).toUpperCase()).join("") }}</span>
                </div>
            </div>
        </CardThumbnail>

        <CardHeader class="tw-p-5 tw-pt-2">
            <h2 class="tw-font-semibold">{{ name }}</h2>
            <p class="tw-text-sm tw-text-muted-foreground">{{ description }}</p>
        </CardHeader>

        <!-- for tags later -->

        <!-- <CardBody class="tw-p-5 tw-pt-2">
            <h2 class="tw-font-semibold">{{ name }}</h2>
            <p class="tw-text-sm tw-text-muted-foreground">{{ description }}</p>
        </CardBody> -->

        <CardFooter class="tw-p-5 tw-pt-2">
            <button class="btn btn-primary">Action</button>
            <button class="btn btn-secondary">Secondary Action</button>
        </CardFooter>
    </Card>
</template>