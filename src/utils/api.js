import axios from 'axios';

// Dapatkan base URL yang dinamis
const getBaseUrl = () => {
    // 1. Coba ambil dari Global Variable yang disuntikkan WordPress (Paling Aman)
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.root) {
        return window.umh_api_settings.root;
    }
    
    // 2. FALLBACK CERDAS: Gunakan Relative Path
    // Jangan gunakan 'http://localhost' karena akan error jika port beda (misal localhost:8000)
    // Relative path akan otomatis ikut domain/port browser saat ini.
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

// Response Interceptor: Menangani error global
axiosInstance.interceptors.response.use(
    (response) => {
        // Jika backend mengembalikan { success: true, data: [...] }
        if (response.data && response.data.data !== undefined) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        // Log error untuk debugging tapi jangan biarkan crash
        const url = error.config?.url;
        console.warn(`API Error (${url}):`, error.message);
        
        // Return null/empty agar UI tidak crash (Blank Putih)
        if (error.response && error.response.data && error.response.data.message) {
            return Promise.reject(new Error(error.response.data.message));
        }
        return Promise.reject(new Error("Gagal terhubung ke server. Periksa koneksi internet atau login session Anda."));
    }
);

export const api = {
    get: async (url, params = {}) => {
        try {
            const res = await axiosInstance.get(url, { params });
            return res;
        } catch (error) {
            // Defensive: Jangan throw error fatal untuk GET request agar halaman tetap tampil
            console.error(`Safe Fail GET ${url}`, error);
            return []; // Kembalikan array kosong sebagai fallback aman
        }
    },
    post: (url, data) => axiosInstance.post(url, data),
    put: (url, data) => axiosInstance.put(url, data),
    delete: (url) => axiosInstance.delete(url)
};