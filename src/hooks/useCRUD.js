import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api.js';

const useCRUD = (endpoint, initialData = []) => {
  const [data, setData] = useState(Array.isArray(initialData) ? initialData : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });

  const fetchData = useCallback(async (page = 1, search = '', filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, search, ...filters };
      const response = await api.get(endpoint, { params });
      
      // FIX: Defensive Coding untuk mencegah 'undefined map'
      let responseData = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data.data)) {
          responseData = response.data.data;
        } else if (Array.isArray(response.data)) {
          responseData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          // Jika data adalah object (misal untuk dashboard), biarkan object, jangan array
          responseData = response.data;
        }
      } 
      
      // Jika endpoint adalah dashboard (stats), kita butuh object, bukan array
      if(endpoint.includes('stats') || endpoint.includes('dashboard')){
          if(!responseData || Array.isArray(responseData)){
              responseData = {}; // Fallback ke object kosong
          }
      } else {
          // Untuk endpoint tabel biasa, pastikan array
          if(!Array.isArray(responseData)){
              responseData = []; 
          }
      }

      setData(responseData);
      
      const meta = response?.data?.meta || response?.meta || {};
      if (meta.total_pages) {
        setPagination({
          currentPage: meta.current_page || page,
          totalPages: meta.total_pages || 1,
          totalItems: meta.total_items || 0,
          perPage: meta.per_page || 10
        });
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err.message || 'Gagal mengambil data.');
      // Reset ke nilai aman saat error
      if(endpoint.includes('stats') || endpoint.includes('dashboard')) {
          setData({});
      } else {
          setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createItem = async (newItem) => {
    setLoading(true);
    try {
      await api.post(endpoint, newItem);
      await fetchData(pagination.currentPage); 
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, updatedItem) => {
    setLoading(true);
    try {
      await api.put(`${endpoint}/${id}`, updatedItem);
      await fetchData(pagination.currentPage);
      return { success: true };
    } catch (err) {
      try {
         await api.post(`${endpoint}/${id}`, updatedItem);
         await fetchData(pagination.currentPage);
         return { success: true };
      } catch (retryErr) {
         return { success: false, error: retryErr.response?.data?.message || retryErr.message };
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Hapus data ini?')) return;
    setLoading(true);
    try {
      await api.delete(`${endpoint}/${id}`);
      await fetchData(pagination.currentPage);
      return { success: true };
    } catch (err) {
       try {
          await api.get(`${endpoint}?action=delete&id=${id}`);
          await fetchData(pagination.currentPage);
          return { success: true };
       } catch (retryErr) {
          return { success: false, error: retryErr.response?.data?.message || retryErr.message };
       }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => fetchData(pagination.currentPage);

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    refreshData,
    createItem,
    updateItem,
    deleteItem
  };
};

export default useCRUD;