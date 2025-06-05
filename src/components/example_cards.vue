<script setup lang="ts">
import { useRandomGigCardData } from '@/composables/random_gigcard_data';
import { GigCard } from './ui/GigCard';
import { Card, CardThumbnail, CardHeader, CardFooter, CardBody } from '@/components/ui/Card';

const { generateDetails } = useRandomGigCardData();
const CARDS_TO_GENERATE = 20;
</script>

<template>
    <GigCard v-for="index in CARDS_TO_GENERATE" :key="index" v-bind="generateDetails()" :userId="`${index}`"
        :thumbnailUrl="`https://picsum.photos/500/300.webp?random=${index}`" />

    <!-- <Card hoverable class="tw-w-[230px]">
        <CardThumbnail>
            <img src="https://picsum.photos/500/300.webp?random=1" alt="Random Image" />
        </CardThumbnail>

        <CardBody class="tw-p-5 tw-pt-2">
            <h2 class="tw-font-semibold">Card Title</h2>

            <p class="tw-text-sm tw-text-muted-foreground">This is the main content of the card. You can put any content
                here.</p>
        </CardBody>

        <CardFooter class="tw-p-5 tw-pt-2">
            <button class="btn btn-primary">Action</button>
            <button class="btn btn-secondary">Secondary Action</button>
        </CardFooter>
    </Card> -->
</template>

<style scoped></style>