<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { useMessenger, type ChannelData, type MessageData } from '@/composables/messanger';
import { useGetUser } from '@/composables/getUser';
import Message from './Message.vue';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MoreVertical } from 'lucide-vue-next';

interface EnhancedMessage extends MessageData {
    senderName: string;
    senderAvatar: string;
}

const props = defineProps<{
    channelId: string;
    channelData: ChannelData;
}>();

// Composables
const { user } = useGetUser();
const {
    getMessages,
    fetchMessages,
    sendMessage,
    isChannelLoading,
    getMessagesError,
    isSendingMessage,
    getChannelDisplayName,
    getChannelAvatar,
    getSenderName,
    getSenderAvatar
} = useMessenger();

// State
const newMessage = ref('');
const messagesContainer = ref<HTMLElement>();
const enhancedMessages = ref<EnhancedMessage[]>([]);

// Computed
const messages = computed(() => getMessages(props.channelId));
const isLoading = isChannelLoading(props.channelId);
const error = computed(() => getMessagesError(props.channelId));

const channelDisplayName = computed(() => getChannelDisplayName(props.channelData));
const channelAvatar = computed(() => getChannelAvatar(props.channelData));

const canSendMessage = computed(() => {
    return newMessage.value.trim().length > 0 &&
        newMessage.value.trim().length <= 500 &&
        !isSendingMessage.value;
});

// Methods
async function handleSendMessage() {
    if (!canSendMessage.value) return;

    const content = newMessage.value.trim();
    newMessage.value = '';

    const result = await sendMessage(content, props.channelId);

    if (result.success) {
        // Scroll to bottom after sending
        await nextTick();
        scrollToBottom();
    } else {
        // Show error 
        newMessage.value = content;
        console.error('Failed to send message:', result.error);
    }
}

function scrollToBottom() {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
}

function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
}

// Inject sender info into messages
async function enhanceMessages(messages: MessageData[]): Promise<EnhancedMessage[]> {
    const enhanced = await Promise.all(
        messages.map(async (message) => ({
            ...message,
            senderName: (await getSenderName(message)) || 'Unknown User',
            senderAvatar: (await getSenderAvatar(message)) || ''
        }))
    );
    return enhanced;
}

// Keep injecting sender info
watch(messages, async (newMessages) => {
    if (newMessages && newMessages.length > 0) enhancedMessages.value = await enhanceMessages(newMessages);
    else enhancedMessages.value = [];
}, { immediate: true });

watch(() => props.channelId, async (newChannelId) => {
    if (newChannelId) {
        await fetchMessages(newChannelId);
        await nextTick();
        scrollToBottom();
    }
}, { immediate: true });

// Initial load
onMounted(async () => {
    if (props.channelId) {
        await fetchMessages(props.channelId);
        await nextTick();
        scrollToBottom();
    }
});
</script>

<template>
    <div class="tw-h-full tw-flex tw-flex-col">
        <!-- Chat Header -->
        <div class="tw-p-4 tw-border-b tw-border-border tw-bg-background">
            <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-flex tw-items-center tw-space-x-3">
                    <Avatar :src="channelAvatar" :size-px="40" />
                    <div>
                        <h3 class="tw-font-semibold tw-text-lg">{{ channelDisplayName }}</h3>
                        <p class="tw-text-sm tw-text-muted-foreground">
                            {{ channelData.otherUsers.length === 1 ? 'Online' : `${channelData.otherUsers.length}
                            members` }}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="sm">
                    <MoreVertical class="tw-w-5 tw-h-5" />
                </Button>
            </div>
        </div>

        <!-- Messages Container -->
        <div ref="messagesContainer" class="tw-flex-1 tw-overflow-y-auto tw-p-4 tw-space-y-4">
            <!-- Loading State -->
            <div v-if="isLoading" class="tw-space-y-4">
                <div v-for="i in 8" :key="i" class="tw-flex tw-space-x-3"
                    :class="i % 3 === 0 ? 'tw-justify-end' : 'tw-justify-start'">
                    <div v-if="i % 3 !== 0" class="tw-flex tw-space-x-3">
                        <Skeleton class="tw-w-8 tw-h-8 tw-rounded-full tw-flex-shrink-0" />
                        <div class="tw-space-y-2">
                            <Skeleton class="tw-w-48 tw-h-4" />
                            <Skeleton class="tw-w-32 tw-h-3" />
                        </div>
                    </div>
                    <div v-else class="tw-space-y-2 tw-text-right">
                        <Skeleton class="tw-w-48 tw-h-4 tw-ml-auto" />
                        <Skeleton class="tw-w-32 tw-h-3 tw-ml-auto" />
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="tw-text-center tw-py-8">
                <p class="tw-text-sm tw-text-muted-foreground tw-mb-2">Failed to load messages</p>
                <p class="tw-text-xs tw-text-red-500 tw-mb-4">{{ error }}</p>
                <Button @click="() => fetchMessages(channelId)" variant="secondary" outline size="sm">
                    Try Again
                </Button>
            </div> 
            
            <!-- Messages -->
            <div v-else-if="enhancedMessages.length > 0" class="tw-space-y-4">
                <Message v-for="message in enhancedMessages" :key="message.messageId" :author-name="message.senderName"
                    :author-pfp="message.senderAvatar" :content="message.content"
                    :timestamp="new Date(message.createdAt)" :is-own-message="message.senderUserId === user?.userId" />
            </div>

            <!-- Empty State -->
            <div v-else class="tw-text-center tw-py-8">
                <p class="tw-text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
        </div>

        <!-- Message Input -->
        <div class="tw-p-4 tw-border-t tw-border-border tw-bg-background">
            <div class="tw-flex tw-space-x-2">
                <div class="tw-flex-1 tw-relative">
                    <textarea v-model="newMessage" @keypress="handleKeyPress" placeholder="Type a message..." rows="1"
                        class="tw-w-full tw-px-4 tw-py-3 tw-bg-muted tw-border-0 tw-rounded-lg tw-text-sm tw-resize-none focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary"
                        :disabled="isSendingMessage" />
                    <div class="tw-absolute tw-bottom-2 tw-right-2 tw-text-xs tw-text-muted-foreground">
                        {{ newMessage.length }}/500
                    </div>
                </div>
                <Button @click="handleSendMessage" :disabled="!canSendMessage" class="tw-self-end" size="sm">
                    <Send class="tw-w-4 tw-h-4" />
                </Button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Auto-resize textarea */
textarea {
    min-height: 44px;
    max-height: 120px;
    overflow-y: auto;
}
</style>
