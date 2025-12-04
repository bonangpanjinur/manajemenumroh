/**
 * Utility API Wrapper untuk WordPress REST API
 * Menangani Header, Nonce, dan Upload File
 */

// Base URL API WordPress (Sesuaikan jika path WP Anda berbeda)
// Biasanya: /wp-json/
const BASE_URL = '/wp-json'; 

// Ambil Nonce dari global variable (biasanya disuntikkan oleh wp_localize_script di PHP)
// Jika running di localhost React (npm start), kita butuh mock atau proxy.
// Di production (dalam WP Admin), `umh_vars.nonce` pasti ada.
const getNonce = () => {
    return window.umh_vars ? window.umh_vars.nonce : ''; 
};

const headers = {
    'X-WP-Nonce': getNonce(),
    'Content-Type': 'application/json',
};

const handleResponse = async (response) => {
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        data = { success: false, message: text || response.statusText };
    }

    if (!response.ok) {
        const error = (data && data.message) || response.statusText;
        throw new Error(error);
    }
    return data;
};

const api = {
    get: async (endpoint, options = {}) => {
        const url = new URL(BASE_URL + '/' + endpoint, window.location.origin);
        if (options.params) {
            Object.keys(options.params).forEach(key => 
                url.searchParams.append(key, options.params[key])
            );
        }
        const res = await fetch(url, { ...options, headers: { 'X-WP-Nonce': getNonce() } });
        return handleResponse(res);
    },

    post: async (endpoint, body) => {
        const res = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': getNonce() },
            body: JSON.stringify(body),
        });
        return handleResponse(res);
    },

    put: async (endpoint, body) => {
        const res = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': getNonce() },
            body: JSON.stringify(body),
        });
        return handleResponse(res);
    },

    delete: async (endpoint) => {
        const res = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'DELETE',
            headers: { 'X-WP-Nonce': getNonce() },
        });
        return handleResponse(res);
    },

    // Fungsi Khusus Upload File
    upload: async (file, fieldName = 'file', relatedId = null) => {
        const formData = new FormData();
        formData.append('file', file);
        if (relatedId) formData.append('post_id', relatedId);

        // Jangan set Content-Type header manual saat upload, biarkan browser set boundary-nya
        const res = await fetch(`${BASE_URL}/umh/v1/upload`, {
            method: 'POST',
            headers: { 'X-WP-Nonce': getNonce() },
            body: formData,
        });
        return handleResponse(res);
    }
};

export default api;