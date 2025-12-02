import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useCRUD = (endpoint, initialParams = {}) => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
    const [loading, setLoading] = useState(false);

    // 1. FETCH DATA
    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const queryParams = { ...initialParams, ...params };
            const response = await api.get(endpoint, { params: queryParams });
            
            // Handle variasi format response API WordPress
            if (Array.isArray(response)) {
                setData(response);
            } else if (response && Array.isArray(response.items)) {
                setData(response.items);
                setPagination({
                    current_page: parseInt(response.current_page || 1),
                    total_pages: parseInt(response.total_pages || 1),
                    total_items: parseInt(response.total_items || 0)
                });
            } else {
                setData([]);
            }
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            toast.error("Gagal memuat data. Cek koneksi atau izin.");
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // 2. CREATE
    const createItem = async (newItem) => {
        setLoading(true);
        const toastId = toast.loading('Menyimpan data...');
        try {
            await api.post(endpoint, newItem);
            toast.success('Berhasil disimpan!', { id: toastId });
            await fetchData();
            return true;
        } catch (err) {
            toast.error(err.message || 'Gagal menyimpan', { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 3. UPDATE
    const updateItem = async (id, updatedItem) => {
        setLoading(true);
        const toastId = toast.loading('Memperbarui data...');
        try {
            // Support endpoint REST WP (kadang butuh POST ke ID untuk update)
            await api.post(`${endpoint}/${id}`, updatedItem);
            toast.success('Berhasil diperbarui!', { id: toastId });
            await fetchData();
            return true;
        } catch (err) {
            toast.error(err.message || 'Gagal update', { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 4. DELETE
    const deleteItem = async (id) => {
        if (!window.confirm('Yakin ingin menghapus data ini permanen?')) return false;

        setLoading(true);
        const toastId = toast.loading('Menghapus...');
        try {
            await api.delete(`${endpoint}/${id}`); // Pastikan backend support DELETE method atau gunakan ?_method=DELETE
            toast.success('Data telah dihapus', { id: toastId });
            
            // Hapus item dari state lokal agar UI cepat (Optimistic UI)
            setData(prev => prev.filter(item => item.id !== id));
            
            return true;
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus', { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        pagination,
        loading,
        fetchData,
        createItem,
        updateItem,
        deleteItem,
        // Helper pagination
        changePage: (p) => fetchData({ page: p }),
        changeLimit: (l) => fetchData({ per_page: l, page: 1 })
    };
};

export default useCRUD;