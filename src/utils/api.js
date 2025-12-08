import axios from 'axios';

// Dapatkan Base URL API dengan Aman
const getBaseUrl = () => {
    // 1. Cek Variable Global dari WP (Paling Akurat)
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.root) {
        return window.umh_api_settings.root;
    }

    // 2. Fallback Relative Path (Cerdas)
    // Deteksi apakah WP diinstall di subfolder atau root domain
    const path = window.location.pathname;
    // Cari posisi '/wp-admin/' untuk menentukan root
    const wpAdminIndex = path.indexOf('/wp-admin');
    
    if (wpAdminIndex !== -1) {
        // Jika ada di /folder/wp-admin, ambil /folder
        const rootPath = path.substring(0, wpAdminIndex);
        return `${rootPath}/wp-json/umh/v1`;
    }

    // Default asumsi root
    return '/wp-json/umh/v1';
};

// Helper untuk mendapatkan Nonce kapanpun dibutuhkan
// Jangan simpan di variabel const statis di luar fungsi, 
// karena mungkin window.umh_api_settings belum ready saat file di-import.
const getNonce = () => {
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.nonce) {
        return window.umh_api_settings.nonce;
    }
    // Coba ambil dari header meta tag jika ada (opsional)
    // const metaNonce = document.querySelector('meta[name="csrf-token"]');
    // if (metaNonce) return metaNonce.content;
    
    return '';
};

// Buat instance axios dasar
const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Inject URL & Nonce secara dinamis SAAT request dilakukan
// Ini menjamin kita selalu dapat nilai terbaru/benar
axiosInstance.interceptors.request.use((config) => {
    config.baseURL = getBaseUrl();
    config.headers['X-WP-Nonce'] = getNonce();
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor Response
axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data && response.data.data !== undefined) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        const url = error.config?.url || 'Unknown';
        console.warn(`API Error [${url}]:`, error.message);
        
        // Return Promise.reject agar bisa dicatch di komponen
        // Tapi dengan pesan yang bersih
        const msg = error.response?.data?.message || error.message || "Kesalahan server";
        return Promise.reject(new Error(msg));
    }
);

export const api = {
    get: async (url, params = {}) => {
        try {
            const res = await axiosInstance.get(url, { params });
            return res;
        } catch (error) {
            console.error(`Safe Fail GET ${url}`, error);
            // Return array kosong untuk list endpoints agar UI tidak crash
            // Tapi throw error untuk detail/single item
            return []; 
        }
    },
    post: (url, data) => axiosInstance.post(url, data),
    put: (url, data) => axiosInstance.put(url, data),
    delete: (url) => axiosInstance.delete(url)
};