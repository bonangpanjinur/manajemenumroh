const API_BASE = '/wp-json/umh/v1';

async function request(endpoint, options = {}) {
  // Ambil Nonce dari setting global WP jika ada (untuk keamanan)
  const nonce = window.umh_settings?.nonce || window.wpApiSettings?.nonce || '';

  const headers = {
    'Content-Type': 'application/json',
    'X-WP-Nonce': nonce,
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || response.statusText || 'API Request Failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error; // Re-throw agar bisa ditangkap di komponen
  }
}

// Export sebagai Named Export (PENTING untuk fix error build)
export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// Export default juga disediakan untuk kompatibilitas
export default api;