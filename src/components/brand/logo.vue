<script setup lang="ts">
import { Photo, PhotoLoading } from '../ui/photo';
import { Skeleton } from '../ui/skeleton';

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
        <p v-if="!hideName" class="name tw-max-h-16 tw-text-[2.5rem] tw-font-bold tw-ml-2"></p>
    </div>
</template>

<style scoped>
.name::before {
    content: 'Gig';
    display: inline-block;
}

.name::after {
    content: 'Tree';
    display: inline-block;
}


@media screen and (max-width: 640px) {
    .name {
        font-size: x-large;
    }

    /* Split into Gig\nTree */
    .name::before {
        content: 'Gig';
        display: block;
        line-height: 1.1;
    }

    .name::after {
        content: 'Tree';
        display: block;
        line-height: 1.1;
    }
}

@media screen and (max-width: 320px) {
    .name {
        display: none;
    }
}
</style>