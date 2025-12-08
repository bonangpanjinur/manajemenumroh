import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const useCRUD = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Data (Read)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get(endpoint);
      if (Array.isArray(result)) {
        setData(result);
      } else if (result && result.data && Array.isArray(result.data)) {
        // Handle jika response dibungkus { data: [...] }
        setData(result.data);
      } else {
        setData([]);
        // Tidak throw error jika format beda, cukup set array kosong
        console.warn('API response is not an array:', result);
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Create
  const createItem = async (newItem) => {
    setLoading(true);
    try {
      // Jika endpoint create berbeda (misal POST /create), handle di komponen
      // Default: POST ke endpoint yang sama
      const response = await api.post(endpoint, newItem);
      await fetchData(); // Refresh data
      return response;
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update
  const updateItem = async (id, updatedFields) => {
    setLoading(true);
    try {
      const response = await api.post(`${endpoint}/${id}`, updatedFields); // WP REST API kadang pakai POST utk update
      await fetchData();
      return response;
    } catch (err) {
      setError(err.message || 'Gagal memperbarui data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const deleteItem = async (id) => {
    setLoading(true);
    try {
      await api.delete(`${endpoint}/${id}`);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Gagal menghapus data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem
  };
};

export default useCRUD;