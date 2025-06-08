import { api } from "@/lib/api";

export interface AdminUser {
    userId: string;
    username: string;
    primaryEmail: string;
    emailVerified: boolean;
    profile: {
        bio?: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    createdAt: string;
    updatedAt: string;
    moderation?: {
        ban?: {
            isBanned: boolean;
            bannedAt?: string;
            banReason?: string;
            unbannedAt?: string;
        };
        muted?: {
            isMuted: boolean;
            mutedAt?: string;
            muteReason?: string;
            unmutedAt?: string;
        };
        jobListingBan?: {
            isBanned: boolean;
            bannedAt?: string;
            banReason?: string;
            unbannedAt?: string;
        };
    };
}

export interface AdminListing {
    id: string;
    listingId: string;
    ownerUserId: string;
    thumbnailUrl?: string;
    shortDescription?: string;
    createdAt: string;
    updatedAt: string;
    owner?: AdminUser;
    status?: string;
    title?: string;
    description?: string;
}

export interface AdminMessage {
    id: string;
    messageId: string;
    senderId: string;
    channelId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    sender: AdminUser;
    channel: AdminChannel;
    isEdited?: boolean;
    attachments?: {
        id: string;
        filename: string;
        fileSize: string;
    }[];
}

export interface AdminChannel {
    id: string;
    channelId: string;
    name: string;
    description?: string;
    participants: string[];
    createdAt: string;
    messageCount: number;
    memberCount: number;
    participantDetails?: AdminUser[];
    isActive: boolean;
}

export interface ModerationAction {
    id: string;
    actionId: string;
    userId: string;
    type: 'ban' | 'unban' | 'mute' | 'unmute' | 'warn' | 'job-listing-ban' | 'job-listing-unban';
    actionType: 'ban' | 'unban' | 'mute' | 'unmute' | 'warn' | 'job-listing-ban' | 'job-listing-unban';
    reason?: string;
    duration?: number;
    createdAt: string;
    expiresAt?: string;
    adminId: string;
    targetUser: AdminUser;
    moderator: AdminUser;
    isActive: boolean;
}

export interface BannedUser {
    id: string;
    user: AdminUser;
    reason: string;
    bannedBy: AdminUser;
    bannedAt: string;
    expiresAt?: string;
}

export interface MutedUser {
    id: string;
    user: AdminUser;
    reason: string;
    mutedBy: AdminUser;
    mutedAt: string;
    expiresAt?: string;
}

export interface JobListingBannedUser {
    id: string;
    user: AdminUser;
    reason: string;
    bannedBy: AdminUser;
    bannedAt: string;
    expiresAt?: string;
}

export interface DashboardOverview {
    totals: {
        users: number;
        listings: number;
        channels: number;
        messages: number;
    };
    userStats: {
        verified: number;
        banned: number;
        muted: number;
        jobListingBanned: number;
        unverified: number;
    };
    recentActivity: {
        newUsers: number;
        newListings: number;
        newMessages: number;
    };
    userGrowth: any[];
    topMessageSenders: any[];
    recentModerations: any[];
}

export interface SystemHealth {
    database: {
        status: "connected" | "disconnected";
        responseTime: number;
    };
    server: {
        uptime: number;
        memoryUsage: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
        };
        cpuUsage: number;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        itemsPerPage: number;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export class AdminApiClient {
    async getUsers(params?: {
        page?: number;
        limit?: number;
        search?: string;
        sort?: "asc" | "desc";
        sortBy?: "createdAt" | "updatedAt" | "username" | "primaryEmail";
    }): Promise<PaginatedResponse<AdminUser>> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        const response = await api.request(`/api/admin/users?${searchParams}`);
        const result = await response.json();
        return {
            data: result.users,
            pagination: result.pagination
        };
    }

    async getUser(userId: string): Promise<AdminUser> {
        const response = await api.request("/api/admin/users/get", {
            method: "POST",
            body: JSON.stringify({ userId })
        });
        const result = await response.json();
        return result.user;
    }

    async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
        const response = await api.request("/api/admin/users/update", {
            method: "PUT",
            body: JSON.stringify({ userId, ...updates }),
        });
        const result = await response.json();
        return result.user;
    }

    async deleteUser(userId: string): Promise<void> {
        const response = await api.request("/api/admin/users/delete", {
            method: "DELETE",
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error(`Failed to delete user: ${response.statusText}`);
    }

    async getModerationActions(page: number = 1, limit: number = 20): Promise<{ actions: ModerationAction[]; total: number }> {
        throw new Error("getModerationActions endpoint is not implemented in the server");
    }

    async getBannedUsers(params?: {
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
        sortBy?: "bannedAt" | "username" | "primaryEmail";
        includeExpired?: boolean;
    }): Promise<{ users: BannedUser[] }> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        const response = await api.request(`/api/admin/moderation/banned?${searchParams}`);
        if (!response.ok) throw new Error(`Failed to fetch banned users: ${response.statusText}`);
        const result = await response.json();
        return { users: result.bannedUsers };
    }

    async getMutedUsers(params?: {
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
        sortBy?: "mutedAt" | "username" | "primaryEmail";
        includeExpired?: boolean;
    }): Promise<{ users: MutedUser[] }> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        const response = await api.request(`/api/admin/moderation/muted?${searchParams}`);
        if (!response.ok) throw new Error(`Failed to fetch muted users: ${response.statusText}`);
        const result = await response.json();
        return { users: result.mutedUsers };
    }

    async banUser(userId: string, reason: string, duration?: number): Promise<any> {
        const response = await api.request("/api/admin/moderation/ban", {
            method: "POST",
            body: JSON.stringify({ userId, banReason: reason, duration }),
        });
        if (!response.ok) throw new Error(`Failed to ban user: ${response.statusText}`);
        const result = await response.json();
        return result.ban;
    }

    async unbanUser(userId: string): Promise<void> {
        const response = await api.request("/api/admin/moderation/unban", {
            method: "POST",
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error(`Failed to unban user: ${response.statusText}`);
    }

    async muteUser(userId: string, reason: string, duration?: number): Promise<any> {
        const response = await api.request("/api/admin/moderation/mute", {
            method: "POST",
            body: JSON.stringify({ userId, muteReason: reason, duration }),
        });
        if (!response.ok) throw new Error(`Failed to mute user: ${response.statusText}`);
        const result = await response.json();
        return result.mute;
    }

    async unmuteUser(userId: string): Promise<void> {
        const response = await api.request("/api/admin/moderation/unmute", {
            method: "POST",
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error(`Failed to unmute user: ${response.statusText}`);
    }

    async jobListingBanUser(userId: string, banReason: string, duration?: number): Promise<any> {
        const response = await api.request("/api/admin/moderation/job-listing-ban", {
            method: "POST",
            body: JSON.stringify({ userId, banReason, duration }),
        });
        if (!response.ok) throw new Error(`Failed to job listing ban user: ${response.statusText}`);
        const result = await response.json();
        return result.jobListingBan;
    }

    async jobListingUnbanUser(userId: string): Promise<void> {
        const response = await api.request("/api/admin/moderation/job-listing-unban", {
            method: "POST",
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error(`Failed to remove job listing ban: ${response.statusText}`);
    }

    async getUserModerationHistory(userId: string): Promise<{ user: AdminUser; moderation: any }> {
        const response = await api.request("/api/admin/moderation/history", {
            method: "POST",
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error(`Failed to fetch moderation history: ${response.statusText}`);
        const result = await response.json();
        return { user: result.user, moderation: result.moderation };
    }

    async getListings(params?: {
        page?: number;
        limit?: number;
        search?: string;
        sort?: "asc" | "desc";
        sortBy?: "createdAt" | "updatedAt" | "shortDescription";
    }): Promise<PaginatedResponse<AdminListing>> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        const response = await api.request(`/api/admin/listings?${searchParams}`);
        if (!response.ok) throw new Error(`Failed to fetch listings: ${response.statusText}`);
        const result = await response.json();
        return {
            data: result.listings,
            pagination: result.pagination
        };
    }

    async getListing(listingId: string): Promise<AdminListing> {
        const response = await api.request("/api/admin/listings/get", {
            method: "POST",
            body: JSON.stringify({ listingId }),
        });
        if (!response.ok) throw new Error(`Failed to fetch listing: ${response.statusText}`);
        const result = await response.json();
        return result.listing;
    }

    async updateListing(listingId: string, updates: { thumbnailUrl?: string; shortDescription?: string }): Promise<AdminListing> {
        const response = await api.request("/api/admin/listings/update", {
            method: "PUT",
            body: JSON.stringify({ listingId, ...updates }),
        });
        if (!response.ok) throw new Error(`Failed to update listing: ${response.statusText}`);
        const result = await response.json();
        return result.listing;
    }

    async deleteListing(listingId: string): Promise<void> {
        const response = await api.request("/api/admin/listings/delete", {
            method: "DELETE",
            body: JSON.stringify({ listingId }),
        });
        if (!response.ok) throw new Error(`Failed to delete listing: ${response.statusText}`);
    }

    async getUserListings(userId: string): Promise<{ user: AdminUser; listings: AdminListing[] }> {
        const response = await api.request("/api/admin/listings/user", {
            method: "POST",
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error(`Failed to fetch user listings: ${response.statusText}`);
        const result = await response.json();
        return { user: result.user, listings: result.listings };
    }

    async getChannels(params?: {
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
    }): Promise<{ channels: AdminChannel[]; total: number }> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        const response = await api.request(`/api/admin/channels?${searchParams}`);
        if (!response.ok) throw new Error(`Failed to fetch channels: ${response.statusText}`);
        const result = await response.json();
        return { channels: result.channels, total: result.pagination.totalCount };
    }

    async getMessages(params?: {
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
        channelId?: string;
    }): Promise<{ channel?: AdminChannel; participants?: AdminUser[]; messages: PaginatedResponse<AdminMessage> }> {
        if (params?.channelId) {
            return this.getChannelMessages(params.channelId, {
                page: params.page,
                limit: params.limit
            });
        } else {
            return this.getAllMessages({
                page: params?.page,
                limit: params?.limit,
                sort: params?.sort
            }).then(response => ({ messages: response }));
        }
    }

    async getAllMessages(params?: {
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
    }): Promise<PaginatedResponse<AdminMessage>> {
        const query = new URLSearchParams();
        if (params) {
            if (params.page) query.append("page", params.page.toString());
            if (params.limit) query.append("limit", params.limit.toString());
            if (params.sort) query.append("sort", params.sort);
        }
        const response = await api.request(`/api/admin/messages?${query}`);
        if (!response.ok) throw new Error(`Failed to fetch all messages: ${response.statusText}`);
        const result = await response.json();
        return {
            data: result.messages,
            pagination: result.pagination
        };
    }

    async getChannelMessages(channelId: string, params?: {
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
    }): Promise<{ channel: AdminChannel; participants: AdminUser[]; messages: PaginatedResponse<AdminMessage> }> {
        const response = await api.request("/api/admin/channels/messages", {
            method: "POST",
            body: JSON.stringify({ channelId, ...params }),
        });
        if (!response.ok) throw new Error(`Failed to fetch channel messages: ${response.statusText}`);
        const result = await response.json();
        return {
            channel: result.channel,
            participants: result.channel.participants,
            messages: {
                data: result.messages,
                pagination: result.pagination
            }
        };
    }

    async deleteMessage(messageId: string): Promise<void> {
        const response = await api.request("/api/admin/messages/delete", {
            method: "DELETE",
            body: JSON.stringify({ messageId }),
        });
        if (!response.ok) throw new Error(`Failed to delete message: ${response.statusText}`);
    }

    async searchMessages(params: {
        query: string;
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
    }): Promise<PaginatedResponse<AdminMessage>> {
        const response = await api.request("/api/admin/messages/search", {
            method: "POST",
            body: JSON.stringify(params),
        });
        if (!response.ok) throw new Error(`Failed to search messages: ${response.statusText}`);
        const result = await response.json();
        return {
            data: result.messages,
            pagination: result.pagination
        };
    }

    async getUserMessages(userId: string, params?: {
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
    }): Promise<{ user: AdminUser; messages: PaginatedResponse<AdminMessage> }> {
        const response = await api.request("/api/admin/messages/user", {
            method: "POST",
            body: JSON.stringify({ userId, ...params }),
        });
        if (!response.ok) throw new Error(`Failed to fetch user messages: ${response.statusText}`);
        const result = await response.json();
        return {
            user: result.user,
            messages: {
                data: result.messages,
                pagination: result.pagination
            }
        };
    }

    async getDashboardOverview(): Promise<DashboardOverview> {
        const response = await api.request("/api/admin/dashboard/overview");
        if (!response.ok) throw new Error(`Failed to fetch dashboard overview: ${response.statusText}`);
        const result = await response.json();
        return result.dashboard;
    }

    async getUserGrowthData(days: number = 30): Promise<{ date: string; count: number }[]> {
        try {
            const response = await api.request(`/api/admin/dashboard/user-growth?days=${days}`);
            if (!response.ok) {
                console.warn(`User growth data API returned ${response.status}, returning mock data`);
                return this.generateMockUserGrowthData(days);
            }
            const result = await response.json();
            return result.userGrowth || result.data || [];
        } catch (error) {
            console.warn('Failed to fetch user growth data, returning mock data:', error);
            return this.generateMockUserGrowthData(days);
        }
    }

    private generateMockUserGrowthData(days: number): { date: string; count: number }[] {
        const data = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            data.push({
                date: date.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 20) + 1
            });
        }
        return data;
    }

    async getSystemHealth(): Promise<SystemHealth> {
        const response = await api.request("/api/admin/dashboard/system-health");
        if (!response.ok) throw new Error(`Failed to fetch system health: ${response.statusText}`);
        const result = await response.json();
        return result.systemHealth;
    }

    async getHealthCheck(): Promise<any> {
        const response = await api.request("/api/admin/dashboard/health");
        if (!response.ok) throw new Error(`Failed to fetch health check: ${response.statusText}`);
        const result = await response.json();
        return result.health;
    }

    async getJobListingBannedUsers(params?: {
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
        sortBy?: "bannedAt" | "username" | "primaryEmail";
        includeExpired?: boolean;
    }): Promise<{ users: JobListingBannedUser[] }> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        const response = await api.request(`/api/admin/moderation/job-listing-banned?${searchParams}`);
        if (!response.ok) throw new Error(`Failed to fetch job listing banned users: ${response.statusText}`);
        const result = await response.json();
        return { users: result.jobListingBannedUsers };
    }
}

export const adminApi = new AdminApiClient();
