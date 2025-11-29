import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast'; 

const useCRUD = (endpoint, initialParams = {}) => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Fetch Data
    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            // Merge initial params dengan params baru
            const queryParams = { ...initialParams, ...params };
            const response = await api.get(endpoint, { params: queryParams });
            
            // DEBUG: Cek di console apa isi response sebenarnya
            console.log(`[useCRUD] Fetch ${endpoint}:`, response);

            // Handle berbagai format response dari WP REST API
            if (response && Array.isArray(response)) {
                // Format 1: Langsung array
                setData(response);
            } else if (response && response.items && Array.isArray(response.items)) {
                // Format 2: Object dengan properti items (Standard Controller kita)
                setData(response.items);
                setPagination({
                    current_page: parseInt(response.current_page || 1),
                    total_pages: parseInt(response.total_pages || 1),
                    total_items: parseInt(response.total_items || 0)
                });
            } else if (response && response.data && Array.isArray(response.data)) {
                 // Format 3: Terbungkus properti data
                 setData(response.data);
            } else {
                // Fallback: Data kosong atau format tidak dikenal
                console.warn("[useCRUD] Format data tidak dikenali, set ke array kosong.");
                setData([]); 
            }

        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Gagal memuat data';
            setError(errMsg);
            console.error("Fetch Error:", err);
            // Jangan toast error saat fetch awal agar tidak spammy, cukup log/state
        } finally {
            setLoading(false);
        }
    }, [endpoint, JSON.stringify(initialParams)]);

    // 2. Create Item
    const createItem = async (newItem) => {
        setLoading(true);
        const toastId = toast.loading('Menyimpan data...');
        try {
            await api.post(endpoint, newItem);
            toast.success('Data berhasil disimpan!', { id: toastId });
            await fetchData(); // Refresh data
            return true;
        } catch (err) {
            const errMsg = err.message || 'Gagal menyimpan data';
            toast.error(errMsg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 3. Update Item
    const updateItem = async (id, updatedItem) => {
        setLoading(true);
        const toastId = toast.loading('Memperbarui data...');
        try {
            // Support endpoint/id atau endpoint?id=...
            await api.post(`${endpoint}/${id}`, updatedItem); 
            toast.success('Data berhasil diperbarui!', { id: toastId });
            await fetchData();
            return true;
        } catch (err) {
            const errMsg = err.message || 'Gagal memperbarui data';
            toast.error(errMsg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 4. Delete Item
    const deleteItem = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return false;
        
        setLoading(true);
        const toastId = toast.loading('Menghapus data...');
        try {
            await api.delete(`${endpoint}/${id}`);
            toast.success('Data dihapus', { id: toastId });
            // Optimistic update: Hapus dari state lokal dulu biar cepat
            setData((prev) => prev.filter((item) => item.id !== id));
            await fetchData(); 
            return true;
        } catch (err) {
            const errMsg = err.message || 'Gagal menghapus data';
            toast.error(errMsg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        pagination,
        loading,
        error,
        fetchData,
        createItem,
        updateItem,
        deleteItem
    };
};

export default useCRUD;