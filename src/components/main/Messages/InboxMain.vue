<script setup lang="ts">
import { Button } from '@/components/ui/Button';
import { useMessenger, type ChannelData } from '@/composables/messanger';
import { ArrowLeft, MessageCircle } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ChannelList from './ChannelList.vue';
import ChatWindow from './ChatWindow.vue';

// Use messaging composable
// const { getChannelById, fetchChannels, unsubscribeFromAllChannels } = useMessenger();
const messageData = useMessenger();

// State
const selectedChannelId = ref<string | null>(null);
const selectedChannelData = ref<ChannelData | null>(null);
const isLoadingChannelFromUrl = ref(false);
const showMobileChannelList = ref(true);
const isInitializing = ref(true);

// Computed
const hasSelectedChannel = computed(() => selectedChannelId.value && selectedChannelData.value);

// URL Management
function getChannelIdFromUrl(): string | null {
    if (typeof window === 'undefined') return null;

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('channel');
}

function updateUrlWithChannel(channelId: string | null) {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (channelId) url.searchParams.set('channel', channelId);
    else url.searchParams.delete('channel');

    window.history.replaceState({}, '', url.toString());
}

// Methods
async function fetchChannelDataById(channelId: string): Promise<ChannelData | null> {
    try {
        // Try from cache
        const existingChannel = messageData.getChannelById(channelId);
        if (existingChannel) return existingChannel;

        // Otherwise refresh channels
        const success = await messageData.fetchChannels();
        if (success) return messageData.getChannelById(channelId) || null;

        return null;
    } catch (error) {
        console.error('Error fetching channel data:', error);
        return null;
    }
}

async function handleChannelSelect(channelId: string, channelData: ChannelData) {
    selectedChannelId.value = channelId;
    selectedChannelData.value = channelData;
    showMobileChannelList.value = false;
    updateUrlWithChannel(channelId);
}

function clearSelection() {
    selectedChannelId.value = null;
    selectedChannelData.value = null;
    showMobileChannelList.value = true;
    updateUrlWithChannel(null);
}

function handleBackToChannels() {
    showMobileChannelList.value = true;
    clearSelection();
}

function handlePopState() {
    const channelIdFromUrl = getChannelIdFromUrl();

    if (channelIdFromUrl && channelIdFromUrl !== selectedChannelId.value) loadChannelFromUrl(channelIdFromUrl);
    else if (!channelIdFromUrl && selectedChannelId.value) clearSelection();
}

async function loadChannelFromUrl(channelId: string) {
    isLoadingChannelFromUrl.value = true;

    try {
        const channelData = await fetchChannelDataById(channelId);
        if (channelData) {
            selectedChannelId.value = channelId;
            selectedChannelData.value = channelData;
            showMobileChannelList.value = false;
        } else {
            console.warn(`Channel ${channelId} not found or user doesn't have access`);
            updateUrlWithChannel(null);
        }
    } catch (error) {
        console.error('Error loading channel from URL:', error);
        updateUrlWithChannel(null);
    } finally {
        isLoadingChannelFromUrl.value = false;
    }
}

// Initialize component
onMounted(async () => {
    const channelIdFromUrl = getChannelIdFromUrl();
    if (channelIdFromUrl) await loadChannelFromUrl(channelIdFromUrl);
    await messageData.subscribeToAllChannels();

    isInitializing.value = false;
    window.addEventListener('popstate', handlePopState);
});

// Cleanup
onMounted(() => {
    return () => window.removeEventListener('popstate', handlePopState);
});

// Cleanup SSE connections
onUnmounted(() => {
    messageData.unsubscribeFromAllChannels();
    window.removeEventListener('popstate', handlePopState);
});
</script>

<template>
    <!-- Loading skeleton while initializing -->
    <div v-if="isInitializing" class="tw-h-full tw-flex tw-bg-background">
        <div class="tw-w-80 tw-border-r tw-border-border tw-bg-muted/30 tw-p-4">
            <div class="tw-space-y-4">
                <!-- Skeleton for channel list items -->
                <div v-for="i in 5" :key="i" class="tw-flex tw-items-center tw-space-x-3 tw-p-3 tw-rounded-lg">
                    <div class="tw-w-10 tw-h-10 tw-bg-muted tw-rounded-full tw-animate-pulse"></div>
                    <div class="tw-flex-1">
                        <div class="tw-h-4 tw-bg-muted tw-rounded tw-animate-pulse tw-mb-2"></div>
                        <div class="tw-h-3 tw-bg-muted tw-rounded tw-animate-pulse tw-w-3/4"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tw-flex-1 tw-flex tw-items-center tw-justify-center">
            <div class="tw-text-center">
                <div
                    class="tw-animate-spin tw-w-8 tw-h-8 tw-border-2 tw-border-primary tw-border-t-transparent tw-rounded-full tw-mx-auto tw-mb-4">
                </div>
                <p class="tw-text-muted-foreground">Loading messages...</p>
            </div>
        </div>
    </div>    
    
    <!-- Main interface -->
    <div v-else class="tw-h-full tw-flex tw-bg-background tw-overflow-hidden tw-min-h-0"><!-- Channel List Sidebar -->
        <div class="tw-border-r tw-border-border tw-bg-muted/30 tw-flex tw-flex-col tw-overflow-hidden" :class="{
            'tw-hidden md:tw-block': !showMobileChannelList && hasSelectedChannel,
            'tw-w-full md:tw-w-80': showMobileChannelList,
            'tw-w-80': !showMobileChannelList && hasSelectedChannel
        }">
            <ChannelList :message-data="messageData" :selected-channel-id="selectedChannelId || undefined"
                @select-channel="handleChannelSelect" />
        </div>

        <!-- Chat Area -->
        <div class="tw-flex-1 tw-flex tw-flex-col tw-overflow-hidden" :class="{
            'tw-hidden md:tw-flex': showMobileChannelList && hasSelectedChannel,
            'tw-w-full': !showMobileChannelList
        }">

            <!-- Loading state when loading channel from URL -->
            <div v-if="isLoadingChannelFromUrl" class="tw-flex-1 tw-flex tw-items-center tw-justify-center">
                <div class="tw-text-center">
                    <div
                        class="tw-animate-spin tw-w-8 tw-h-8 tw-border-2 tw-border-primary tw-border-t-transparent tw-rounded-full tw-mx-auto tw-mb-4">
                    </div>
                    <p class="tw-text-muted-foreground">Loading conversation...</p>
                </div>
            </div>            
            
            <!-- Chat Window -->
            <div v-else-if="hasSelectedChannel" class="tw-flex-1 tw-flex tw-flex-col tw-min-h-0">
                <!-- Mobile Back Button -->
                <div
                    class="tw-flex md:tw-hidden tw-items-center tw-gap-2 tw-p-4 tw-border-b tw-border-border tw-flex-shrink-0">
                    <Button variant="ghost" size="sm" @click="handleBackToChannels">
                        <ArrowLeft class="tw-w-5 tw-h-5" />
                    </Button>
                    <span class="tw-text-lg tw-font-semibold">Back to Conversations</span>
                </div>

                <div class="tw-flex-1 tw-min-h-0">
                    <ChatWindow :message-data="messageData" :channel-id="selectedChannelId!"
                        :channel-data="selectedChannelData!" />
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-bg-muted/10">
                <div class="tw-text-center tw-max-w-md tw-mx-auto tw-p-8">
                    <MessageCircle class="tw-w-16 tw-h-16 tw-mx-auto tw-text-muted-foreground tw-mb-4" />
                    <h2 class="tw-text-xl tw-font-semibold tw-mb-2">Welcome to Messages</h2>
                    <p class="tw-text-muted-foreground tw-mb-6">
                        Select a conversation from the sidebar to start messaging, or create a new conversation with
                        someone.
                    </p>

                    <!-- Could add a "Start New Conversation" button here MAYBE but idk probably not we'll see -->
                    <!-- <Button variant="primary" class="tw-mt-4">
                        Start New Conversation
                    </Button> -->
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
