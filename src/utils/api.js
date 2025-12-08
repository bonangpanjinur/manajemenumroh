import axios from 'axios';

// Dapatkan base URL dari variabel global WordPress atau fallback
const getBaseUrl = () => {
    if (typeof window.umh_api_settings !== 'undefined' && window.umh_api_settings.root) {
        return window.umh_api_settings.root;
    }
    // Fallback untuk development localhost
    return 'http://localhost/wp-json/umh/v1';
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
        // Jika langsung array atau object
        return response.data;
    },
    (error) => {
        console.error("API Error:", error.response || error.message);
        
        // PENTING: Jangan biarkan aplikasi crash, kembalikan null atau throw dengan pesan jelas
        // Kita throw agar bisa ditangkap di try-catch komponen
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error("Terjadi kesalahan koneksi ke server.");
    }
);

export const api = {
    get: async (url, params = {}) => {
        try {
            const res = await axiosInstance.get(url, { params });
            return res; // Interceptor sudah memproses datanya
        } catch (error) {
            console.warn(`GET ${url} failed:`, error);
            // Defensive: Jika gagal, kembalikan array kosong jika sepertinya request list, atau null
            // Tapi lebih aman throw agar UI bisa menampilkan pesan error
            throw error; 
        }
    },
    post: (url, data) => axiosInstance.post(url, data),
    put: (url, data) => axiosInstance.put(url, data),
    delete: (url) => axiosInstance.delete(url)
};