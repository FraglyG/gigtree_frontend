<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ChannelList from './ChannelList.vue';
import ChatWindow from './ChatWindow.vue';
import { Card } from '@/components/ui/Card';
import { MessageCircle } from 'lucide-vue-next';
import { useMessenger, type ChannelData } from '@/composables/messanger';

// Use messaging composable
const { getChannelById, fetchChannels } = useMessenger();

// State
const selectedChannelId = ref<string | null>(null);
const selectedChannelData = ref<ChannelData | null>(null);
const isLoadingChannelFromUrl = ref(false);

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
    if (channelId) {
        url.searchParams.set('channel', channelId);
    } else {
        url.searchParams.delete('channel');
    }

    // Update URL without page reload
    window.history.replaceState({}, '', url.toString());
}

// Methods
async function fetchChannelDataById(channelId: string): Promise<ChannelData | null> {
    try {
        // First try to get from already loaded channels
        const existingChannel = getChannelById(channelId);
        if (existingChannel) {
            return existingChannel;
        }

        // If not found, fetch fresh channels
        const success = await fetchChannels();
        if (success) {
            return getChannelById(channelId) || null;
        }

        return null;
    } catch (error) {
        console.error('Error fetching channel data:', error);
        return null;
    }
}

async function handleChannelSelect(channelId: string, channelData: ChannelData) {
    selectedChannelId.value = channelId;
    selectedChannelData.value = channelData;
    updateUrlWithChannel(channelId);
}

function clearSelection() {
    selectedChannelId.value = null;
    selectedChannelData.value = null;
    updateUrlWithChannel(null);
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

    window.addEventListener('popstate', handlePopState);
});

// Cleanup
onMounted(() => {
    return () => window.removeEventListener('popstate', handlePopState);
});
</script>

<template>
    <div class="tw-h-full tw-flex tw-bg-background">
        <!-- Channel List Sidebar -->
        <div class="tw-w-80 tw-border-r tw-border-border tw-bg-muted/30">
            <ChannelList :selected-channel-id="selectedChannelId || undefined" @select-channel="handleChannelSelect" />
        </div> 
        
        <!-- Chat Area -->
        <div class="tw-flex-1 tw-flex tw-flex-col">
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
            <ChatWindow v-else-if="hasSelectedChannel" :channel-id="selectedChannelId!"
                :channel-data="selectedChannelData!" />

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
