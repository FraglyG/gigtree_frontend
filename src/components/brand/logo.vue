<script setup lang="ts">
import { Photo, PhotoLoading } from '../ui/Photo';
import { Skeleton } from '../ui/Skeleton';

defineProps<{
    hideName?: boolean;
    hideImage?: boolean;
}>();

</script>

<template>
    <div class="logo_container tw-flex tw-flex-row">
        <!-- <img src="/logo.svg" class="tw-aspect-square tw-w-auto tw-max-h-14" /> -->
        <Photo v-if="!hideImage" src="/logo.svg" alt="GigTree Logo" class="tw-aspect-square tw-w-auto tw-max-h-14">
            <PhotoLoading>
                <Skeleton class="tw-w-14 tw-h-14 tw-rounded-full" />
            </PhotoLoading>
        </Photo>
        <p v-if="!hideName" class="tw-max-h-16 tw-text-[2.5rem] tw-font-bold tw-ml-2">GigTree</p>
    </div>
</template>