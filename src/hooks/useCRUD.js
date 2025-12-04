import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const useCRUD = (endpoint, initialData = []) => {
  // Pastikan initialData selalu array jika defaultnya array
  const [data, setData] = useState(initialData);
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
      
      // DEFENSIVE CODING: 
      // Cek apakah response ada, apakah ada data.data, atau data langsung
      // Jika null/undefined, default ke array kosong []
      let responseData = [];
      
      if (response && response.data && Array.isArray(response.data.data)) {
        responseData = response.data.data; // Format standard { success: true, data: [...] }
      } else if (response && Array.isArray(response.data)) {
        responseData = response.data; // Format simple [...]
      } else if (response && Array.isArray(response)) {
        responseData = response; // Format raw array
      }

      setData(responseData);
      
      // Handle Pagination meta jika ada
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
      setError(err.message || 'Gagal mengambil data dari server.');
      setData([]); // Reset ke array kosong saat error agar .map tidak error
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
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

  // Alias refreshData untuk konsistensi
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