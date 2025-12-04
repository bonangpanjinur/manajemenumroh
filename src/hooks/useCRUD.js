import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const useCRUD = (endpoint, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false); // Default false, will be set true on fetch
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });

  // Fungsi fetch data yang stabil dengan useCallback
  const fetchData = useCallback(async (page = 1, search = '', filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Mengubah params menjadi query string
      const params = { page, search, ...filters };
      const response = await api.get(endpoint, { params });
      
      // Handle response structure dari WP REST API atau Custom PHP
      const responseData = response.data.data || response.data;
      const meta = response.data.meta || {};

      setData(Array.isArray(responseData) ? responseData : []);
      
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
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // FIX: Otomatis fetch data saat komponen di-mount atau endpoint berubah
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createItem = async (newItem) => {
    setLoading(true);
    try {
      await api.post(endpoint, newItem);
      await fetchData(pagination.currentPage); // Refresh data setelah create
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
      await api.put(`${endpoint}/${id}`, updatedItem); // Asumsi RESTful: /endpoint/ID
      await fetchData(pagination.currentPage);
      return { success: true };
    } catch (err) {
      // Fallback untuk backend yang mungkin menggunakan POST untuk update
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    setLoading(true);
    try {
      await api.delete(`${endpoint}/${id}`); // Asumsi RESTful
      await fetchData(pagination.currentPage);
      return { success: true };
    } catch (err) {
       // Fallback jika delete via POST query param
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

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    createItem,
    updateItem,
    deleteItem
  };
};

export default useCRUD;