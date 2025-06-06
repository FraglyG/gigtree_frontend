type ServerStatus = "online" | "offline" | "unknown"

class ApiClient {
    constructor(private baseUrl: string) { }

    private async internalRequest(endpoint: string, options: RequestInit = {}, meta: { isInternalRetry: boolean }): Promise<Response> {
        const { isInternalRetry } = meta;

        const requestOptions: RequestInit = {
            ...options,
            credentials: 'include',
            headers: {
                ...options.headers,
                'Content-Type': 'application/json',
            }
        };

        let response: Response;
        try {
            response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
        } catch (error) {
            const isOffline = error instanceof TypeError && error.message === 'Failed to fetch';
            if (isOffline) return new Response(null, { status: 503 });
            throw error;
        }

        if (response.status === 401 && !isInternalRetry) {
            // Token expired, try refresh
            const refreshed = await this.refreshTokens();
            if (refreshed) return this.internalRequest(endpoint, options, { isInternalRetry: true });
        }

        return response;
    }

    async request(endpoint: string, options: RequestInit = {}, apiKey?: string): Promise<Response> {
        // console.log(`Making request using API key: ${apiKey || 'N/A'}`)

        if (apiKey) options.headers = {
            ...options.headers,
            "authorization": `Bearer ${apiKey}`
        }

        return this.internalRequest(endpoint, options, { isInternalRetry: false });
    }

    private async refreshTokens() {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
            });

            return response.ok;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    async status(): Promise<ServerStatus> {
        try {
            const response = await api.request("/api/healthcheck");
            if (response.ok) return "online";
            if (response.status == 503) return "offline";
            return "unknown";
        } catch (error) {
            const err = error as Error;
            console.warn(`Unknown server status: ${err.message}`);
            return "unknown";
        }
    }
}

if (!import.meta.env.PUBLIC_BACKEND_URL) throw new Error('Missing env var: PUBLIC_BACKEND_URL');
export const api = new ApiClient(import.meta.env.PUBLIC_BACKEND_URL);