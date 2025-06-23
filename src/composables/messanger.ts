import { ref, computed, triggerRef, watch } from 'vue';
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
    latestMessage: MessageData | null;
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

// SSE Related interfaces
interface SSEMessage {
    type: 'connected' | 'message' | 'heartbeat';
    data?: MessageData;
    channelId: string;
    message?: string;
    timestamp: string;
}

interface SSEConnection {
    eventSource: EventSource;
    channelId: string;
    connected: boolean;
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

    // SSE State
    const sseConnections = ref<Map<string, SSEConnection>>(new Map());
    const sseConnectionStatus = ref<Map<string, boolean>>(new Map());

    // Computed
    const hasChannels = computed(() => channels.value.length > 0);

    // Cache
    const CACHE = {
        users: new Map<string, User>(),
        cachingUsers: new Set<string>()
    }

    // Helpers
    async function getUserFromId(userId: string): Promise<User | null> {
        // Check cache
        const cachedUser = CACHE.users.get(userId);
        if (cachedUser) return cachedUser;

        // Fetch from server
        try {
            if (CACHE.cachingUsers.has(userId)) {
                return new Promise((resolve) => {
                    // TODO: add more optimized way some day
                    const interval = setInterval(() => {
                        if (!CACHE.cachingUsers.has(userId)) {
                            clearInterval(interval);
                            resolve(CACHE.users.get(userId) || null);
                        }
                    }, 100);
                });
            }

            CACHE.cachingUsers.add(userId);

            const response = await api.request(`/api/public/user?userId=${userId}`);
            if (!response.ok) {
                CACHE.cachingUsers.delete(userId);
                throw new Error(`Failed to fetch user with ID ${userId}`);
            }

            const userData = await response.json();
            if (!userData.success) {
                CACHE.cachingUsers.delete(userId);
                throw new Error(userData.message || 'Failed to fetch user data');
            }

            CACHE.cachingUsers.delete(userId);
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

    /** Fetch messages from server */
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
            if (!result.success) throw new Error(result.message || 'Failed to send message');

            const newMessage = result.data;
            const messageChannelId = newMessage.channelId;
            addMessageToLocalState(messageChannelId, newMessage, true);

            return { success: true, message: newMessage };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while sending message';
            console.error('Error sending message:', err);
            return { success: false, error: errorMessage };
        } finally {
            isSendingMessage.value = false;
        }
    }

    /** Fetch messages from cache */
    function getMessages(channelId: string): MessageData[] {
        return messages.value.get(channelId) || [];
    }

    function getMessagesError(channelId: string): string | null {
        return messagesError.value.get(channelId) || null;
    }

    function isChannelLoading(channelId: string) {
        return computed(() => isLoadingMessages.value.get(channelId) || false);
    }

    /** Helper function for making it easy to connection to message SSE endpoints */
    async function subscribeToMessageSSE(connectionId: string, endpoint: string): Promise<EventSource | null> {
        try {
            const baseUrl = import.meta.env.PUBLIC_BACKEND_URL || '';
            const sseUrl = `${baseUrl}${endpoint}`;

            const eventSource = new EventSource(sseUrl, { withCredentials: true });
            const connection: SSEConnection = { eventSource, channelId: connectionId, connected: false };

            // Handle connection events
            eventSource.onopen = () => {
                connection.connected = true;
                sseConnectionStatus.value.set(connectionId, true);
            };

            eventSource.onmessage = (event) => {
                try {
                    const data: SSEMessage = JSON.parse(event.data);
                    handleSSEMessage(data);
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                }
            };

            eventSource.onerror = (event) => {
                console.error('SSE error for connection:', connectionId, event);
                connection.connected = false;
                sseConnectionStatus.value.set(connectionId, false);

                // Only attempt reconnection if the connection still exists in our map
                setTimeout(() => {
                    if (sseConnections.value.has(connectionId)) {
                        console.log('Attempting to reconnect to subscription endpoint:', endpoint);
                        subscribeToMessageSSE(connectionId, endpoint);
                    }
                }, 5000);
            };

            // Store connection
            sseConnections.value.set(connectionId, connection);

            return eventSource;
        } catch (error) {
            console.error('Failed to subscribe to SSE:', error);
            return null;
        }
    }

    // SSE Management
    async function subscribeToAllChannels(): Promise<boolean> {
        const sseUrl = `/api/message/subscribe`;
        const connection = subscribeToMessageSSE('ALL_CHANNELS', sseUrl);

        if (!connection) {
            console.error('Failed to subscribe to all channels');
            return false;
        } else {
            sseConnectionStatus.value.set('ALL_CHANNELS', true);
            return true;
        }
    }

    async function subscribeToChannel(channelId: string): Promise<boolean> {
        const sseUrl = `/api/message/channel/subscribe?channelId=${channelId}`;
        const connection = await subscribeToMessageSSE(channelId, sseUrl);

        if (!connection) {
            console.error(`Failed to subscribe to channel ${channelId}`);
            return false;
        } else {
            sseConnectionStatus.value.set(channelId, true);
            return true;
        }
    }

    function handleSSEMessage(data: SSEMessage) {
        switch (data.type) {
            case 'connected':
                break;
            case 'message':
                if (data.data) addMessageToLocalState(data.channelId, data.data);
                break;

            case 'heartbeat':
                // Keep connection alive
                break;

            default:
                console.warn('Unknown SSE message type:', data.type);
        }
    }

    function unsubscribeFromChannel(channelId: string) {
        const connection = sseConnections.value.get(channelId);
        if (connection) {
            connection.eventSource.close();
            sseConnections.value.delete(channelId);
            sseConnectionStatus.value.delete(channelId);
        }
    }

    function unsubscribeFromAllChannels() {
        sseConnections.value.forEach((connection, channelId) => {
            connection.eventSource.close();
        });
        sseConnections.value.clear();
        sseConnectionStatus.value.clear();
    }

    function isChannelConnected(channelId: string): boolean {
        return sseConnectionStatus.value.get(channelId) || false;
    }

    function isAllChannelsConnected(): boolean {
        return sseConnectionStatus.value.get('ALL_CHANNELS') || false;
    }

    /**  Helper function to update channel's latest message and reorder channels */
    function updateChannelLatestMessage(channelId: string, message: MessageData) {
        const channelIndex = channels.value.findIndex(c => c.channelId === channelId);
        if (channelIndex !== -1) {
            // Update the channel's latest message
            channels.value[channelIndex].latestMessage = message;
            channels.value[channelIndex].updatedAt = message.createdAt;

            // Re-sort channels by latest message time (most recent first)
            channels.value.sort((a, b) => {
                const aTime = a.latestMessage?.createdAt || a.createdAt;
                const bTime = b.latestMessage?.createdAt || b.createdAt;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });

            triggerRef(channels);
        }
    }

    /** Helper function to add message to local state if needed */
    function addMessageToLocalState(channelId: string, message: MessageData, forceUpdate: boolean = false) {
        const existingMessages = messages.value.get(channelId) || [];

        // Prevent duplicates by checking if message already exists
        const messageExists = existingMessages.some(m => m.messageId === message.messageId);
        if (!messageExists || forceUpdate) {
            if (messageExists && forceUpdate) {
                // Replace existing message
                const updatedMessages = existingMessages.map(m => m.messageId === message.messageId ? message : m);
                messages.value.set(channelId, updatedMessages);
            } else {
                // Add new message
                messages.value.set(channelId, [...existingMessages, message]);
            }

            updateChannelLatestMessage(channelId, message);
        }
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

    async function getChannelAvatar(userId: string, channel: ChannelData): Promise<string | undefined> {
        // if (channel.otherUsers.length === 1) {
        //     return channel.otherUsers[0].profile?.profilePicture;
        // }

        const otherUserId = channel.ownerUserIds.find(userId => userId !== userId);
        if (!otherUserId) return undefined;

        const user = await getUserFromId(otherUserId);
        if (user) return user.profile?.profilePicture;

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
        unsubscribeFromAllChannels();
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
        channels: channels,
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
        isChannelLoading,        // SSE methods
        subscribeToChannel,
        subscribeToAllChannels,
        unsubscribeFromChannel,
        unsubscribeFromAllChannels,
        isChannelConnected,
        isAllChannelsConnected,

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