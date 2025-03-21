<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '../../brand/logo.vue';
import RibbonNav from "./ribbon_nav.vue";
import { User } from 'lucide-vue-next';

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
                <Avatar class="tw-w-14 tw-h-14">
                    <AvatarImage src="https://isdev.co/pfp.png" />
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
            </div>
            <!-- Navigation -->
            <div class="tw-col-span-2 tw-flex tw-justify-center tw-mt-3">
                <RibbonNav />
            </div>
        </div>

        <!-- Desktop layout: 3 columns -->
        <div class="tw-hidden md:tw-grid md:tw-grid-cols-3 tw-items-center">
            <Logo />
            <div class="tw-flex tw-justify-center">
                <RibbonNav />
            </div>
            <div class="tw-flex tw-justify-end">
                <Avatar class="tw-w-14 tw-h-14">
                    <AvatarImage src="https://isdev.co/pfp.png" />
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
            </div>
        </div>
    </div>
</template>

<style scoped></style>