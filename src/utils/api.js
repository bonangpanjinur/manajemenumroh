import axios from 'axios';

// --- KONFIGURASI API ---

const getBaseUrl = () => {
    // 1. Cek Global Variable dari WP (Paling Akurat)
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.root) {
        return window.umh_api_settings.root;
    }

    // 2. Fallback Relative Path (Cerdas)
    const path = window.location.pathname;
    const wpAdminIndex = path.indexOf('/wp-admin');
    
    if (wpAdminIndex !== -1) {
        const rootPath = path.substring(0, wpAdminIndex);
        return `${rootPath}/wp-json/umh/v1`;
    }

    return '/wp-json/umh/v1';
};

const getNonce = () => {
    // Nonce sangat penting untuk menghindari 403 Forbidden
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.nonce) {
        return window.umh_api_settings.nonce;
    }
    console.warn("API Warning: Nonce WordPress tidak ditemukan. Request mungkin gagal (403).");
    return '';
};

// Buat Instance Axios
const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
});

// REQUEST INTERCEPTOR: Inject URL & Nonce Dinamis
axiosInstance.interceptors.request.use((config) => {
    config.baseURL = getBaseUrl();
    config.headers['X-WP-Nonce'] = getNonce();
    return config;
}, (error) => Promise.reject(error));

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
    (response) => {
        // Normalisasi response
        if (response.data && response.data.data !== undefined) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        const url = error.config?.url || 'Unknown';
        const status = error.response?.status;
        
        console.warn(`API Error [${url}]:`, error.message);

        // Handle 403 Forbidden (Biasanya karena Nonce expired atau logout)
        if (status === 403) {
            console.error("Akses Ditolak (403). Cek Nonce atau Login ulang.");
            // Opsional: Redirect ke login jika session habis
            // window.location.href = '/wp-login.php'; 
        }

        // Return empty array untuk GET request agar UI tidak crash (Blank)
        if (error.config && error.config.method === 'get') {
            console.log(`Safe Fail GET ${url} -> Returning empty []`);
            return Promise.resolve([]); 
        }
        
        const msg = error.response?.data?.message || error.message || "Kesalahan server";
        return Promise.reject(new Error(msg));
    }
);

export const api = {
    get: async (url, params = {}) => {
        // Wrapper aman, error sudah di-handle interceptor
        return await axiosInstance.get(url, { params });
    },
    post: (url, data) => axiosInstance.post(url, data),
    put: (url, data) => axiosInstance.put(url, data),
    delete: (url) => axiosInstance.delete(url)
};