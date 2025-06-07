import { ref, computed } from 'vue';
import { api } from '@/lib/api';

export interface MessageData {
    messageId: string;
    channelId: string;
    senderUserId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    sender?: {
        userId: string;
        username: string;
        profile?: {
            firstName: string;
            lastName: string;
            profilePicture?: string;
        };
    };
}

export interface ChannelData {
    channelId: string;
    ownerUserIds: string[];
    createdAt: string;
    updatedAt: string;
    latestMessage: {
        messageId: string;
        channelId: string;
        senderUserId: string;
        content: string;
        createdAt: string;
        updatedAt: string;
    } | null;
    otherUsers: {
        userId: string;
        username: string;
        profile?: {
            firstName: string;
            lastName: string;
            profilePicture?: string;
        };
    }[];
}

interface ChannelsApiResponse {
    success: boolean;
    data: ChannelData[];
    error?: string;
    message?: string;
}

interface MessagesApiResponse {
    success: boolean;
    data: MessageData[];
    error?: string;
    message?: string;
}

interface SendMessageApiResponse {
    success: boolean;
    message: string;
    data: MessageData;
    error?: string;
}

interface CreateChannelApiResponse {
    success: boolean;
    channel: ChannelData;
    error?: string;
    message?: string;
}

interface CreateChannelApiResponse {
    success: boolean;
    data: {
        channelId: string;
        channelData: ChannelData;
    };
    error?: string;
    message?: string;
}

export function useMessenger() {
    // State
    const channels = ref<ChannelData[]>([]);
    const messages = ref<Map<string, MessageData[]>>(new Map());
    const isLoadingChannels = ref(false);
    const isLoadingMessages = ref<Map<string, boolean>>(new Map());
    const isSendingMessage = ref(false);
    const isCreatingChannel = ref(false);
    const channelsError = ref<string | null>(null);
    const messagesError = ref<Map<string, string | null>>(new Map());

    // Computed
    const hasChannels = computed(() => channels.value.length > 0);

    // Cache
    const CACHE = {
        users: new Map<string, User>()
    }

    // Helpers
    async function getUserFromId(userId: string): Promise<User | null> {
        // Check cache
        const cachedUser = CACHE.users.get(userId);
        if (cachedUser) return cachedUser;

        // Fetch from server
        try {
            const response = await api.request(`/api/public/user?userId=${userId}`);
            if (!response.ok) throw new Error(`Failed to fetch user with ID ${userId}`);

            const userData = await response.json();
            if (!userData.success) throw new Error(userData.message || 'Failed to fetch user data');

            CACHE.users.set(userId, userData.user);
            return userData;
        } catch (err) {
            console.error('Error fetching user:', err);
            return null;
        }
    }

    // Channel Management
    async function fetchChannels(limit: number = 50): Promise<boolean> {
        isLoadingChannels.value = true;
        channelsError.value = null;

        try {
            const response = await api.request(`/api/message/channels?limit=${limit}`);
            const result: ChannelsApiResponse = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch channels');
            }

            channels.value = result.data;
            return true;
        } catch (err) {
            channelsError.value = err instanceof Error ? err.message : 'An error occurred while fetching channels';
            console.error('Error fetching channels:', err);
            return false;
        } finally {
            isLoadingChannels.value = false;
        }
    }

    async function createChannel(targetUserId: string): Promise<{ success: boolean; channel?: ChannelData; error?: string }> {
        isCreatingChannel.value = true;

        try {
            const response = await api.request('/api/message/channel/create', {
                method: 'POST',
                body: JSON.stringify({ targetUserId: targetUserId })
            });

            const result: CreateChannelApiResponse = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to create channel');
            }

            return {
                success: true,
                channel: result.channel
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating channel';
            console.error('Error creating channel:', err);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            isCreatingChannel.value = false;
        }
    }

    function getChannelById(channelId: string): ChannelData | undefined {
        return channels.value.find(channel => channel.channelId === channelId);
    }

    function getChannelByUserId(userId: string): ChannelData | undefined {
        return channels.value.find(channel =>
            channel.otherUsers.some(user => user.userId === userId)
        );
    }

    // Message Management
    async function fetchMessages(channelId: string, limit: number = 50): Promise<boolean> {
        isLoadingMessages.value.set(channelId, true);
        messagesError.value.set(channelId, null);

        try {
            const response = await api.request(`/api/message/messages?limit=${limit}&channelId=${channelId}`);
            const result: MessagesApiResponse = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch messages');
            }

            // Go through messages and cache the sender user data
            const alreadyRequested = new Set<string>();
            await Promise.all(result.data.map(async (message) => {
                if (alreadyRequested.has(message.senderUserId)) return;
                await getUserFromId(message.senderUserId)
                alreadyRequested.add(message.senderUserId);
            }));

            // Store messages in reverse order (oldest first for display)
            messages.value.set(channelId, result.data.reverse());
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching messages';
            messagesError.value.set(channelId, errorMessage);
            console.error('Error fetching messages:', err);
            return false;
        } finally {
            isLoadingMessages.value.set(channelId, false);
        }
    }

    async function sendMessage(content: string, channelId?: string, targetUserId?: string): Promise<{ success: boolean; message?: MessageData; error?: string }> {
        if (!content.trim()) {
            return { success: false, error: 'Message content cannot be empty' };
        }

        if (content.length > 500) {
            return { success: false, error: 'Message content cannot exceed 500 characters' };
        }

        if (!channelId && !targetUserId) {
            return { success: false, error: 'Either channelId or targetUserId must be provided' };
        }

        if (channelId && targetUserId) {
            return { success: false, error: 'Cannot provide both channelId and targetUserId' };
        }

        isSendingMessage.value = true;

        try {
            const requestBody: any = { content: content.trim() };
            if (channelId) requestBody.channelId = channelId;
            if (targetUserId) requestBody.targetUserId = targetUserId;

            const response = await api.request('/api/message/send', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            const result: SendMessageApiResponse = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to send message');
            }

            const newMessage = result.data;
            const messageChannelId = newMessage.channelId;

            // Add message to local state
            const existingMessages = messages.value.get(messageChannelId) || [];
            messages.value.set(messageChannelId, [...existingMessages, newMessage]);

            // Update the channel's latest message in the channels list
            const channelIndex = channels.value.findIndex(c => c.channelId === messageChannelId);
            if (channelIndex !== -1) {
                channels.value[channelIndex].latestMessage = {
                    messageId: newMessage.messageId,
                    channelId: newMessage.channelId,
                    senderUserId: newMessage.senderUserId,
                    content: newMessage.content,
                    createdAt: newMessage.createdAt,
                    updatedAt: newMessage.updatedAt
                };
                channels.value[channelIndex].updatedAt = newMessage.createdAt;

                // Re-sort channels by latest message
                channels.value.sort((a, b) => {
                    const aTime = a.latestMessage?.createdAt || a.createdAt;
                    const bTime = b.latestMessage?.createdAt || b.createdAt;
                    return new Date(bTime).getTime() - new Date(aTime).getTime();
                });
            }

            return { success: true, message: newMessage };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while sending message';
            console.error('Error sending message:', err);
            return { success: false, error: errorMessage };
        } finally {
            isSendingMessage.value = false;
        }
    }

    function getMessages(channelId: string): MessageData[] {
        return messages.value.get(channelId) || [];
    }

    function getMessagesError(channelId: string): string | null {
        return messagesError.value.get(channelId) || null;
    } function isChannelLoading(channelId: string) {
        return computed(() => isLoadingMessages.value.get(channelId) || false);
    }

    // Utility functions
    function getChannelDisplayName(channel: ChannelData): string {
        if (channel.otherUsers.length === 1) {
            const user = channel.otherUsers[0];
            if (user.profile?.firstName && user.profile?.lastName) {
                return `${user.profile.firstName} ${user.profile.lastName}`;
            }
            return user.username;
        } else if (channel.otherUsers.length > 1) {
            return channel.otherUsers.map(u => u.profile?.firstName || u.username).join(', ');
        }
        return 'Unknown Chat';
    }

    function getChannelAvatar(channel: ChannelData): string | undefined {
        if (channel.otherUsers.length === 1) {
            return channel.otherUsers[0].profile?.profilePicture;
        }
        return undefined;
    }

    function formatMessageTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Today - show time
            return date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString(undefined, { weekday: 'short' });
        } else {
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    async function getSenderName(message: MessageData) {
        const user = await getUserFromId(message.senderUserId);
        if (user) return user.username;
        return "Unknown Sender";
    }

    async function getSenderAvatar(message: MessageData) {
        const user = await getUserFromId(message.senderUserId);
        if (user) return user.profile?.profilePicture;
        return "Unknown Sender";
    }

    // Search functionality
    function searchChannels(query: string): ChannelData[] {
        if (!query.trim()) return channels.value;

        const searchTerm = query.toLowerCase();
        return channels.value.filter(channel => {
            // Search by names or latest messages
            const userMatch = channel.otherUsers.some(user =>
                user.username.toLowerCase().includes(searchTerm) ||
                (user.profile?.firstName && user.profile.firstName.toLowerCase().includes(searchTerm)) ||
                (user.profile?.lastName && user.profile.lastName.toLowerCase().includes(searchTerm))
            );

            const messageMatch = channel.latestMessage?.content.toLowerCase().includes(searchTerm);
            return userMatch || messageMatch;
        });
    }

    // Cleanup function
    function clearState() {
        channels.value = [];
        messages.value.clear();
        isLoadingChannels.value = false;
        isLoadingMessages.value.clear();
        isSendingMessage.value = false;
        isCreatingChannel.value = false;
        channelsError.value = null;
        messagesError.value.clear();
        CACHE.users.clear();
    }

    return {
        // State
        channels: computed(() => channels.value),
        hasChannels,
        isLoadingChannels: computed(() => isLoadingChannels.value),
        isSendingMessage: computed(() => isSendingMessage.value),
        isCreatingChannel: computed(() => isCreatingChannel.value),
        channelsError: computed(() => channelsError.value),

        // Channel methods
        fetchChannels,
        createChannel,
        getChannelById,
        getChannelByUserId,

        // Message methods
        fetchMessages,
        sendMessage,
        getMessages,
        getMessagesError,
        isChannelLoading,

        // Utility methods
        getChannelDisplayName,
        getChannelAvatar,
        formatMessageTime,
        getSenderName,
        getSenderAvatar,
        searchChannels,

        // Cleanup
        clearState
    };
}