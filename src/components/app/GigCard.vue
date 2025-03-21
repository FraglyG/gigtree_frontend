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
</script>

<template>
    <Card class="tw-overflow-hidden tw-w-56">
        <img src="https://img.freepik.com/free-photo/man-working-wall-with-paint-roller_23-2148384435.jpg"
            class="tw-w-full tw-max-w-56 tw-max-h-24 tw-object-cover" alt="Gig Image" />
        <CardHeader class="tw-p-5 tw-pt-4">
            <CardTitle>Jimmy Peterson</CardTitle>
            <CardDescription>With over 14 years of experience, I can guarantee... <a class="link" href="#">read
                    more</a></CardDescription>
        </CardHeader>
        <CardContent class="tw-p-5 tw-flex tw-flex-wrap tw-gap-1">
            <Badge variant="outline">Pretoria</Badge>
            <Badge variant="outline">Painter</Badge>
            <Badge variant="outline">Accepts Card</Badge>
        </CardContent>
        <CardFooter class="tw-p-5 tw-flex tw-flex-row tw-gap-2">
            <Button size="sm" variant="default" as-child>
                <a href="#">
                    <BriefcaseBusiness /> Hire
                </a>
            </Button>
            <Button size="sm" variant="secondary" as-child>
                <a href="#">
                    <IdCard /> Profile
                </a>
            </Button>
        </CardFooter>
    </Card>
</template>

<style scoped></style>