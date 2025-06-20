<script lang="ts" setup>
import { Card, CardThumbnail, CardHeader, CardFooter, CardBody } from '@/components/ui/Card';
import { Photo, PhotoFallback, PhotoLoading } from '../Photo';
import { Skeleton } from '../Skeleton';
import ImageLoadFail from "@/assets/image_load_fail.svg";
import { Button } from '@/components/ui/Button';
import { BriefcaseBusiness, Mail, User } from 'lucide-vue-next';
import { api } from '@/lib/api';
import { useMessenger } from '@/composables/messanger';

const props = defineProps<{
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

const { createChannel } = useMessenger();

async function handleTalkClick() {
    const result = await createChannel(props.userId);
    if (result && result.channel) {
        window.location.href = `${window.location.origin}/inbox?channel=${result.channel.channelId}`;
    } else {
        console.error('Failed to create or navigate to channel');
    }
}

async function handleProfileClick() {
    window.location.href = `${window.location.origin}/profile?user=${props.userId}`;
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
                    <span class="tw-text-muted-foreground tw-text-lg">{{name.split(" ").map(c =>
                        c.charAt(0).toUpperCase()).join("")}}</span>
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

        <CardFooter class="tw-p-5 tw-pt-2 tw-mt-auto tw-flex tw-flex-row-reverse tw-gap-2">
            <Button size="sm" variant="information" outline @click="handleTalkClick">
                <div>
                    <Mail class="tw-w-4 tw-h-4 tw-inline-block tw-mr-1 tw-mb-0.5" />
                    <span class="tw-text-sm">Contact</span>
                </div>
            </button>
            <Button size="sm" variant="primary" outline @click="handleProfileClick">
                <div>
                    <User class="tw-w-4 tw-h-4 tw-inline-block tw-mr-1 tw-mb-0.5" />
                    <span class="tw-text-sm">Profile</span>
                </div>
            </button>
        </CardFooter>
    </Card>
</template>