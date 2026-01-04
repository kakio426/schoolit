import { API_URL } from './constants';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
    body?: any;
}

async function request<T>(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config: RequestInit = {
        ...options,
        method,
        headers,
    };

    if (options.body && method !== 'GET') {
        config.body = JSON.stringify(options.body);
    }

    // Ensure endpoint starts with /
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            // Handle unauthorized - potentially logout or redirect
            if (typeof window !== 'undefined' && !url.includes('/auth/login')) {
                // We don't want to throw during a login attempt
                // Cleanup will be handled by Context/Hooks usually
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Return empty object for 204 No Content
        if (response.status === 204) return {} as T;

        return await response.json();
    } catch (error) {
        console.error(`API Request Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) => request<T>('GET', endpoint, options),
    post: <T>(endpoint: string, body?: any, options?: RequestOptions) => request<T>('POST', endpoint, { ...options, body }),
    put: <T>(endpoint: string, body?: any, options?: RequestOptions) => request<T>('PUT', endpoint, { ...options, body }),
    patch: <T>(endpoint: string, body?: any, options?: RequestOptions) => request<T>('PATCH', endpoint, { ...options, body }),
    delete: <T>(endpoint: string, options?: RequestOptions) => request<T>('DELETE', endpoint, options),

    // For file uploads which shouldn't have Content-Type: application/json
    upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Upload failed');
        }

        return await response.json();
    },

    downloadFile: async (endpoint: string, filename: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            throw new Error('Download failed');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    },
};
