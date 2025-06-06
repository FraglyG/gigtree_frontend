<script lang="ts" setup>
import { Card, CardThumbnail, CardHeader, CardFooter, CardBody } from '@/components/ui/Card';
import { Photo, PhotoFallback, PhotoLoading } from '../Photo';
import { Skeleton } from '../Skeleton';
import ImageLoadFail from "@/assets/image_load_fail.svg";

defineProps<{
    userId: string;
    name: string;
    description: string;
    thumbnailUrl: string;
}>();
</script>

<template>
    <Card class="tw-w-[230px]">
        <CardThumbnail v-if="thumbnailUrl">
            <Photo skeleton :src="thumbnailUrl" :fallbackSrc="ImageLoadFail.src" alt="Gig Thumbnail">
                <PhotoLoading>
                    <Skeleton class="tw-w-full tw-h-[100px]" />
                </PhotoLoading>
            </Photo>
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