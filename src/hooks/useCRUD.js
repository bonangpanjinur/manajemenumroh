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

    // 1. Fetch Data dengan Debounce dan Error Handling
    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            // Merge params baru dengan initial params
            const queryParams = { ...initialParams, ...params };
            const response = await api.get(endpoint, { params: queryParams });
            
            // Normalisasi Data (Handle berbagai format response WP REST API)
            if (response && Array.isArray(response)) {
                setData(response);
            } else if (response && response.items && Array.isArray(response.items)) {
                // Format standar controller dengan pagination
                setData(response.items);
                setPagination({
                    current_page: parseInt(response.current_page || 1),
                    total_pages: parseInt(response.total_pages || 1),
                    total_items: parseInt(response.total_items || 0)
                });
            } else if (response && response.data && Array.isArray(response.data)) {
                 setData(response.data);
            } else {
                setData([]); 
            }

        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Gagal memuat data';
            setError(errMsg);
            console.error(`[useCRUD Error] ${endpoint}:`, err);
        } finally {
            setLoading(false);
        }
    }, [endpoint, JSON.stringify(initialParams)]);

    // 2. Create Item (Tambah Data)
    const createItem = async (newItem) => {
        setLoading(true);
        const toastId = toast.loading('Menyimpan data...');
        try {
            await api.post(endpoint, newItem);
            toast.success('Data berhasil disimpan!', { id: toastId });
            await fetchData(); // Auto refresh
            return true;
        } catch (err) {
            const errMsg = err.message || 'Gagal menyimpan data';
            toast.error(errMsg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 3. Update Item (Edit Data)
    const updateItem = async (id, updatedItem) => {
        setLoading(true);
        const toastId = toast.loading('Memperbarui data...');
        try {
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

    // 4. Delete Item (Hapus Data)
    const deleteItem = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.')) return false;
        
        setLoading(true);
        const toastId = toast.loading('Menghapus data...');
        try {
            await api.delete(`${endpoint}/${id}`);
            toast.success('Data berhasil dihapus', { id: toastId });
            // Optimistic update UI
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

    // Fungsi helper untuk pagination
    const changePage = (page) => fetchData({ page });
    const changeLimit = (limit) => fetchData({ per_page: limit, page: 1 });

    return {
        data,
        pagination,
        loading,
        error,
        fetchData,
        createItem,
        updateItem,
        deleteItem,
        changePage,
        changeLimit
    };
};

export default useCRUD;