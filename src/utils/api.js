import axios from 'axios';

// Dapatkan Base URL API dengan Aman
const getBaseUrl = () => {
    // 1. Cek Variable Global dari WP (Paling Akurat)
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.root) {
        return window.umh_api_settings.root;
    }

    // 2. Fallback Relative Path
    // Deteksi apakah WP diinstall di subfolder atau root domain
    const path = window.location.pathname;
    const wpAdminIndex = path.indexOf('/wp-admin');
    
    if (wpAdminIndex !== -1) {
        // Jika ada di /folder/wp-admin, ambil /folder
        const rootPath = path.substring(0, wpAdminIndex);
        return `${rootPath}/wp-json/umh/v1`;
    }

    return '/wp-json/umh/v1';
};

const getNonce = () => {
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.nonce) {
        return window.umh_api_settings.nonce;
    }
    console.warn("Nonce tidak ditemukan. Request POST/PUT mungkin gagal.");
    return '';
};

const axiosInstance = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'X-WP-Nonce': getNonce(),
        'Content-Type': 'application/json'
    }
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
            return []; // Kembalikan array kosong biar UI gak crash
        }
    },
    post: (url, data) => axiosInstance.post(url, data),
    put: (url, data) => axiosInstance.put(url, data),
    delete: (url) => axiosInstance.delete(url)
};