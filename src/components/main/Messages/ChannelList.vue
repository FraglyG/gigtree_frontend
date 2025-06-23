<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useMessenger, type ChannelData } from '@/composables/messanger';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { MessageCircle, Search } from 'lucide-vue-next';
import { Button } from '@/components/ui/Button';
import { useGetUser } from '@/composables/getUser';

const props = defineProps<{
    selectedChannelId?: string;
    messageData: ReturnType<typeof useMessenger>;
}>();

const emit = defineEmits<{
    selectChannel: [channelId: string, channelData: ChannelData];
}>();

// Use messaging composable
const { user } = useGetUser();
const {
    channels,
    isLoadingChannels,
    channelsError,
    fetchChannels,
    getChannelDisplayName,
    getChannelAvatar,
    formatMessageTime,
    searchChannels,
    isChannelConnected
} = props.messageData;

// State
const searchQuery = ref('');

// Computed
const filteredChannels = computed(() => {
    if (!searchQuery.value.trim()) return channels.value;
    return searchChannels(searchQuery.value);
});

// Methods
function selectChannel(channel: ChannelData) {
    emit('selectChannel', channel.channelId, channel);
}

function truncateMessage(content: string, maxLength: number = 50): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
}

// Initial load
onMounted(() => {
    fetchChannels();
});

watch(channels, () => {
    console.log("CHANNEL UPDATED", channels.value);
})
</script>

<template>
    <div class="tw-h-full tw-flex tw-flex-col">
        <!-- Header -->
        <div class="tw-p-4 tw-border-b tw-border-border">
            <h2 class="tw-text-xl tw-font-semibold tw-mb-3">Messages</h2>

            <!-- Search -->
            <div class="tw-relative">
                <Search
                    class="tw-absolute tw-left-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-w-4 tw-h-4 tw-text-muted-foreground" />
                <input v-model="searchQuery" placeholder="Search conversations..."
                    class="tw-w-full tw-pl-10 tw-pr-4 tw-py-2 tw-bg-background tw-border tw-border-border tw-rounded-md tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary focus:tw-border-transparent" />
            </div>
        </div>

        <!-- Channel List -->
        <div class="tw-flex-1 tw-overflow-y-auto">
            <!-- Loading State -->
            <div v-if="isLoadingChannels" class="tw-p-2">
                <div v-for="i in 6" :key="i" class="tw-p-3 tw-flex tw-items-center tw-space-x-3">
                    <Skeleton class="tw-w-12 tw-h-12 tw-rounded-full" />
                    <div class="tw-flex-1">
                        <Skeleton class="tw-w-3/4 tw-h-4 tw-mb-2" />
                        <Skeleton class="tw-w-1/2 tw-h-3" />
                    </div>
                    <Skeleton class="tw-w-12 tw-h-3" />
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="channelsError" class="tw-p-4 tw-text-center">
                <MessageCircle class="tw-w-12 tw-h-12 tw-mx-auto tw-text-muted-foreground tw-mb-2" />
                <p class="tw-text-sm tw-text-muted-foreground tw-mb-2">Failed to load conversations</p>
                <p class="tw-text-xs tw-text-red-500">{{ channelsError }}</p>
                <button @click="() => fetchChannels()"
                    class="tw-mt-3 tw-px-4 tw-py-2 tw-bg-primary tw-text-primary-foreground tw-rounded-md tw-text-sm hover:tw-bg-primary/90">
                    Try Again
                </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredChannels.length === 0" class="tw-p-8 tw-text-center">
                <MessageCircle class="tw-w-16 tw-h-16 tw-mx-auto tw-text-muted-foreground tw-mb-4" />
                <h3 class="tw-text-lg tw-font-medium tw-mb-2">
                    {{ searchQuery ? 'No conversations found' : 'No conversations yet' }}
                </h3>
                <p class="tw-text-sm tw-text-muted-foreground">
                    {{ searchQuery ? 'Try adjusting your search terms.' : 'Start a conversation with someone!' }}
                </p>
            </div>

            <!-- Channels -->
            <div v-else>
                <div v-for="channel in filteredChannels" :key="channel.channelId" @click="selectChannel(channel)"
                    class="tw-p-3 tw-cursor-pointer tw-border-b tw-border-border/50 hover:tw-bg-muted/50 tw-transition-colors"
                    :class="{ 'tw-bg-muted': selectedChannelId === channel.channelId }">
                    <div class="tw-flex tw-items-center tw-space-x-3">                        <!-- Avatar -->
                        <Avatar :src="user && getChannelAvatar(user.userId, channel)" :size-px="48" class="tw-flex-shrink-0" />
                        <!-- Content -->
                        <div class="tw-flex-1 tw-min-w-0">
                            <div class="tw-flex tw-items-center tw-justify-between tw-mb-1">
                                <div class="tw-flex tw-items-center tw-gap-2 tw-min-w-0">
                                    <h4 class="tw-font-medium tw-text-sm tw-truncate">
                                        {{ getChannelDisplayName(channel) }}
                                    </h4>
                                    <span v-if="isChannelConnected(channel.channelId)"
                                        class="tw-w-2 tw-h-2 tw-bg-green-500 tw-rounded-full tw-flex-shrink-0"
                                        title="Connected">
                                    </span>
                                </div>
                                <span v-if="channel.latestMessage"
                                    class="tw-text-xs tw-text-muted-foreground tw-flex-shrink-0">
                                    {{ formatMessageTime(channel.latestMessage.createdAt) }}
                                </span>
                            </div>

                            <p class="tw-text-sm tw-text-muted-foreground tw-truncate">
                                <span v-if="channel.latestMessage">
                                    {{ truncateMessage(channel.latestMessage.content) }}
                                </span>
                                <span v-else class="tw-italic">
                                    No messages yet
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
