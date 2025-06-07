<script setup lang="ts">
import { Avatar } from '@/components/ui/Avatar';

const props = defineProps<{
    authorPfp?: string;
    authorName: string;
    content: string;
    timestamp: Date;
}>();
</script>

<template>
    <div class="tw-w-fit tw-h-fit tw-flex tw-flex-row tw-gap-2.5">
        <Avatar class="tw-w-12 tw-h-12 tw-rounded-full" :src="authorPfp" />

        <div class="tw-w-fit tw-h-fit tw-flex tw-flex-col tw-gap-0.5">
            <div class="tw-w-fit tw-h-fit tw-flex tw-items-end tw-flex-row tw-gap-2">
                <span class="tw-text-md tw-font-semibold">{{ authorName }}</span>
                <span class="tw-text-xs tw-text-gray-500 tw-mb-0.5">
                    {{ `${timestamp.toLocaleTimeString(undefined, {
                        hour12: false, hour: '2-digit', minute: '2-digit'
                    })}` }}
                </span>
            </div>
            <div class="tw-w-fit tw-h-fit tw-flex tw-flex-col tw-gap-2">
                <span class="tw-text-base tw-text-gray-200">{{ content }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped></style>