<script setup lang="ts">
import { Photo, PhotoFallback, PhotoLoading } from '@/components/ui/Photo';
import Logo from '../../brand/logo.vue';
// import RibbonNav from "./ribbon_nav.vue";
import { User } from 'lucide-vue-next';
import { Skeleton } from '@/components/ui/Skeleton';

</script>

<template>
    <div class="tw-w-full tw-p-5">
        <!-- Mobile layout: 2 rows -->
        <div class="md:tw-hidden tw-grid tw-grid-cols-2 tw-gap-3">
            <!-- Logo and Account -->
            <div class="tw-col-span-1">
                <Logo />
            </div>
            <div class="tw-col-span-1 tw-flex tw-justify-end">
                <Photo src="https://isdev.co/pfp.png" alt="User Avatar" class="tw-w-14 tw-h-14 tw-rounded-full">
                    <PhotoFallback>
                        <User class="tw-w-14 tw-h-14" />
                    </PhotoFallback>
                    <PhotoLoading>
                        <Skeleton class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-gray-200" />
                    </PhotoLoading>
                </Photo>
            </div>
            <!-- Navigation -->
            <div class="tw-col-span-2 tw-flex tw-justify-center tw-mt-3">
                <!-- <RibbonNav /> -->
            </div>
        </div>

        <!-- Desktop layout: 3 columns -->
        <div class="tw-hidden md:tw-grid md:tw-grid-cols-3 tw-items-center">
            <Logo />
            <div class="tw-flex tw-justify-center">
                <!-- <RibbonNav /> -->
                <div>Soon:tm:</div>
            </div>
            <div class="tw-flex tw-justify-end">
                <Photo src="https://isdev.co/pfp.png" class="tw-w-14 tw-h-14 tw-rounded-full">
                    <PhotoFallback>
                        <User class="tw-w-14 tw-h-14" />
                    </PhotoFallback>
                    <PhotoLoading>
                        <Skeleton class="tw-w-14 tw-h-14 tw-rounded-full" />
                    </PhotoLoading>
                </Photo>
            </div>
        </div>
    </div>
</template>

<style scoped></style>