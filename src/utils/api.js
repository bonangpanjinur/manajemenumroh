import axios from 'axios';

// Dapatkan base URL yang dinamis dan aman
const getBaseUrl = () => {
    // 1. Prioritas: Ambil dari Global Variable WordPress (jika disuntikkan via wp_localize_script)
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.root) {
        return window.umh_api_settings.root;
    }
    
    // 2. Fallback Aman: Gunakan Relative Path
    // '/wp-json/umh/v1' akan otomatis mengikuti domain dan port browser (misal localhost:8000 atau domain.com)
    // Jangan gunakan 'http://localhost' hardcode.
    return '/wp-json/umh/v1'; 
};

const getNonce = () => {
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.nonce) {
        return window.umh_api_settings.nonce;
    }
    return '';
};

const axiosInstance = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'X-WP-Nonce': getNonce(),
        'Content-Type': 'application/json'
    }
});

// Response Interceptor: Menangani struktur data & error
axiosInstance.interceptors.response.use(
    (response) => {
        // Normalisasi response dari WP API
        if (response.data && response.data.data !== undefined) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        // Debugging yang lebih bersih
        const endpoint = error.config?.url || 'Unknown URL';
        console.warn(`API Error [${endpoint}]:`, error.message);
        
        // Return object kosong atau reject dengan pesan user-friendly
        // Agar UI tidak crash total (Blank Screen)
        if (error.response && error.response.data && error.response.data.message) {
            return Promise.reject(new Error(error.response.data.message));
        }
        return Promise.reject(new Error("Gagal terhubung ke server. Pastikan Anda login di WordPress."));
    }
);

export const api = {
    get: async (url, params = {}) => {
        try {
            const res = await axiosInstance.get(url, { params });
            return res;
        } catch (error) {
            // Defensive: Jangan biarkan GET request mematikan app
            console.error(`Safe Fail GET ${url}`, error);
            return []; // Kembalikan array kosong sebagai fallback
        }
    },
    post: (url, data) => axiosInstance.post(url, data),
    put: (url, data) => axiosInstance.put(url, data),
    delete: (url) => axiosInstance.delete(url)
};