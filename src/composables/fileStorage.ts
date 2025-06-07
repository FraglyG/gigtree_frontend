export interface UploadResponse {
    success: boolean;
    url: string;
    filename: string;
}

export interface UploadError {
    error: string;
}

export class StorageApiError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'StorageApiError';
    }
}

export class StorageApi {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    async upload(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.baseUrl}/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = data as UploadError;
                throw new StorageApiError(errorData.error || 'Upload failed', response.status);
            }

            return data as UploadResponse;
        } catch (error) {
            if (error instanceof StorageApiError) throw error;
            throw new StorageApiError(error instanceof Error ? error.message : 'Network error occurred');
        }
    }
}

export default StorageApi;