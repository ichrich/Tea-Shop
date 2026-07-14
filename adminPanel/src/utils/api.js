import { API_BASE_URL } from '../apiConfig';
export const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('adminToken');
    
    const headers = { ...options.headers };
    if (options.body !== undefined && options.body !== null && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
        credentials: 'include', // Для работы с cookies
    };

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    try {
        const response = await fetch(fullUrl, config);
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};
export const apiJson = async (url, options = {}) => {
    const response = await apiRequest(url, options);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
            error: 'Unknown error',
            message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.message || errorData.error || 'Request failed');
    }

    return response.json();
};
