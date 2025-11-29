/**
 * Utility untuk menangani request ke WordPress REST API
 * Menggunakan global variable 'umhData' yang di-inject dari PHP
 */

// Pastikan object global tersedia untuk mencegah error saat build/test
const umhConfig = window.umhData || {
    root: '',
    nonce: '',
    user: null
};

/**
 * Helper untuk melakukan fetch dengan Header WP Nonce otomatis
 */
const apiFetch = async (endpoint, options = {}) => {
    const { root, nonce } = umhConfig;
    
    // Hapus slash di awal endpoint jika ada, agar url rapi
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const url = `${root}umh/v1/${cleanEndpoint.replace('umh/v1/', '')}`; // Normalisasi path

    const headers = {
        'X-WP-Nonce': nonce, // KUNCI KEAMANAN
        ...options.headers,
    };

    // Jangan set Content-Type jika body adalah FormData (untuk upload)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.code || 'Terjadi kesalahan pada server.');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
};

export const setupApiErrorInterceptor = (callback) => {
    // Implementasi sederhana untuk menangkap error 401/403 global jika diperlukan
    // Saat ini apiFetch melempar error yang bisa ditangkap di component
};

export default {
    // GET Requests
    get: (endpoint, params = {}) => {
        const queryString = new URLSearchParams(params.params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return apiFetch(url, { method: 'GET' });
    },
    
    // POST Requests (Create)
    post: (endpoint, body) => apiFetch(endpoint, {
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    
    // PUT Requests (Update)
    put: (endpoint, body) => apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    // DELETE Requests
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
    
    // Helper Khusus Upload
    upload: async (file, type, jamaahId = null) => {
        const formData = new FormData();
        formData.append('file', file);
        if (type) formData.append('upload_type', type);
        if (jamaahId) formData.append('jamaah_id', jamaahId);

        return apiFetch('uploads', {
            method: 'POST',
            body: formData
        });
    },

    // Getter untuk info user saat ini
    getCurrentUser: () => umhConfig.user
};