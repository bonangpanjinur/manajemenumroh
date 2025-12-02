import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useCRUD = (endpoint, initialParams = {}) => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
    const [loading, setLoading] = useState(false);

    // --- 1. FETCH DATA (READ) ---
    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const queryParams = { ...initialParams, ...params };
            const response = await api.get(endpoint, { params: queryParams });
            
            // Handle response format yang berbeda-beda dari WP REST API
            if (Array.isArray(response)) {
                setData(response);
            } else if (response && Array.isArray(response.items)) {
                setData(response.items);
                setPagination({
                    current_page: parseInt(response.current_page || 1),
                    total_pages: parseInt(response.total_pages || 1),
                    total_items: parseInt(response.total_items || 0)
                });
            } else if (response && response.data) {
                 setData(Array.isArray(response.data) ? response.data : []);
            } else {
                setData([]);
            }
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            // Jangan spam toast error saat fetch awal, cukup log di console
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // --- 2. CREATE ITEM ---
    const createItem = async (newItem) => {
        setLoading(true);
        const toastId = toast.loading('Menyimpan data...');
        try {
            await api.post(endpoint, newItem);
            toast.success('Data berhasil disimpan!', { id: toastId });
            await fetchData(); // Refresh data
            return true;
        } catch (err) {
            const msg = err.message || 'Gagal menyimpan data';
            toast.error(msg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // --- 3. UPDATE ITEM ---
    const updateItem = async (id, updatedItem) => {
        setLoading(true);
        const toastId = toast.loading('Memperbarui data...');
        try {
            // Support endpoint REST WP (kadang butuh POST ke ID untuk update)
            await api.post(`${endpoint}/${id}`, updatedItem);
            toast.success('Data berhasil diperbarui!', { id: toastId });
            await fetchData();
            return true;
        } catch (err) {
            const msg = err.message || 'Gagal update data';
            toast.error(msg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // --- 4. DELETE ITEM ---
    const deleteItem = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return false;

        setLoading(true);
        const toastId = toast.loading('Menghapus...');
        try {
            await api.delete(`${endpoint}/${id}`); 
            toast.success('Data telah dihapus', { id: toastId });
            
            // Optimistic Update: Hapus item dari tampilan segera
            setData(prev => prev.filter(item => item.id !== id));
            
            return true;
        } catch (err) {
            const msg = err.message || 'Gagal menghapus';
            toast.error(msg, { id: toastId });
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
        changePage: (p) => fetchData({ page: p }),
        changeLimit: (l) => fetchData({ per_page: l, page: 1 })
    };
};

export default useCRUD;