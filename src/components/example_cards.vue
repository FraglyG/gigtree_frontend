<script setup lang="ts">
import { useRandomGigCardData } from '@/composables/random_gigcard_data';
import { GigCard } from './ui/gigcard';
import { Card, CardThumbnail, CardHeader, CardFooter, CardBody } from '@/components/ui/card';

const { generateDetails } = useRandomGigCardData();
const CARDS_TO_GENERATE = 20;
</script>

<template>
    <GigCard v-for="index in CARDS_TO_GENERATE" :key="index" v-bind="generateDetails()" :userId="`${index}`"
        :thumbnailUrl="`https://picsum.photos/500/300.webp?random=${index}`" />
</template>

<style scoped></style>