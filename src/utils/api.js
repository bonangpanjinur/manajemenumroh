import axios from 'axios';

// Konfigurasi Base URL dari Localized Script WordPress
// Pastikan di file PHP utama (admin-dashboard.php/enqueue) sudah melokalisasi 'umhData'
const siteUrl = window.umhData?.siteUrl || '';
const nonce = window.umhData?.nonce || '';
const root = window.umhData?.root || `${siteUrl}/wp-json/`;

const client = axios.create({
    baseURL: root,
    headers: {
        'X-WP-Nonce': nonce,
        'Content-Type': 'application/json',
    },
});

const api = {
    // Standard GET
    get: async (endpoint, config = {}) => {
        try {
            const response = await client.get(endpoint, config);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Standard POST (Create/Update)
    post: async (endpoint, data, config = {}) => {
        try {
            const response = await client.post(endpoint, data, config);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Standard DELETE
    delete: async (endpoint, config = {}) => {
        try {
            const response = await client.delete(endpoint, config);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // KHUSUS UPLOAD FILE (Digunakan di Halaman Jemaah)
    upload: async (file, type = 'file', relatedId = 0) => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type); // cth: 'ktp', 'passport'
        formData.append('ref_id', relatedId); // ID Jemaah

        try {
            // Menggunakan endpoint khusus media WordPress atau endpoint custom plugin
            // Disini kita asumsi pakai endpoint custom umh/v1/uploads
            const response = await client.post('umh/v1/uploads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Wajib untuk upload
                    'X-WP-Nonce': nonce
                }
            });
            return response.data;
        } catch (error) {
            console.error("Upload Error:", error);
            throw error.response?.data || { message: 'Gagal upload file' };
        }
    }
};

export default api;