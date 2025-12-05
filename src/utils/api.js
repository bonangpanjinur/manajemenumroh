import axios from 'axios';

// Ambil settings dari wp_localize_script
const settings = window.umhSettings || {};

const api = axios.create({
    baseURL: settings.root || '/wp-json/', // Fallback aman
    headers: {
        'X-WP-Nonce': settings.nonce || ''
    }
});

// Interceptor untuk handle error global
api.interceptors.response.use(
    response => response,
    error => {
        // Jika 404, berarti endpoint belum terdaftar (file PHP belum diload)
        if (error.response && error.response.status === 404) {
            console.error("API Endpoint Not Found:", error.config.url);
        }
        return Promise.reject(error);
    }
);

export default api;