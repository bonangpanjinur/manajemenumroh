import axios from 'axios';

// Konfigurasi Dinamis dari WordPress
const getApiSettings = () => {
    if (typeof window.umh_api_settings !== 'undefined') {
        return window.umh_api_settings;
    }
    // Fallback development (hati-hati dengan nonce di dev)
    return {
        root: '/wp-json/umh/v1',
        nonce: '' 
    };
};

const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
});

// REQUEST INTERCEPTOR: Selalu ambil nonce terbaru
axiosInstance.interceptors.request.use((config) => {
    const settings = getApiSettings();
    
    // Set Base URL
    config.baseURL = settings.root;
    
    // Set Nonce Header (Wajib untuk POST/PUT/DELETE dan GET protected)
    if (settings.nonce) {
        config.headers['X-WP-Nonce'] = settings.nonce;
    }

    return config;
}, (error) => Promise.reject(error));

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
    (response) => {
        // Unpack data
        if (response.data && response.data.data !== undefined) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        const url = error.config?.url || 'Unknown';
        console.warn(`API Error [${url}]:`, error.message);

        // Khusus error 403 (Forbidden)
        if (error.response && error.response.status === 403) {
            console.error("⛔ API 403 Forbidden: Nonce invalid atau expired.");
            // Jangan redirect login otomatis dulu, karena bisa jadi hanya masalah nonce sementara
        }

        // Return array kosong untuk GET agar UI tidak crash (Blank)
        if (error.config && error.config.method === 'get') {
            return Promise.resolve([]); 
        }
        
        const msg = error.response?.data?.message || error.message || "Kesalahan server";
        return Promise.reject(new Error(msg));
    }
);

export const api = {
    get: (url, params = {}) => axiosInstance.get(url, { params }),
    post: (url, data) => axiosInstance.post(url, data),
    put: (url, data) => axiosInstance.put(url, data),
    delete: (url) => axiosInstance.delete(url)
};