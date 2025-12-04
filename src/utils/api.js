import axios from 'axios';

// Konfigurasi default mengambil dari variabel global WordPress
// Jika tidak ada (mode dev), gunakan fallback
const config = window.umh_vars || {
  root: '/wp-json/',
  nonce: '',
  site_url: ''
};

// Buat instance Axios
const api = axios.create({
  baseURL: config.root,
  headers: {
    'X-WP-Nonce': config.nonce,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor untuk menangani response dan error global
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika error 403 (Nonce expired) atau 401 (Unauthorized), bisa dihandle disini
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        console.warn('Sesi kadaluarsa atau tidak memiliki akses.');
    }
    return Promise.reject(error);
  }
);

// PENTING: Export sebagai Named Export DAN Default Export
// Ini memperbaiki warning: export 'api' (imported as 'api') was not found
export { api };
export default api;