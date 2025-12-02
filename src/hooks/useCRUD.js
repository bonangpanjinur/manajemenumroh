import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useCRUD = (endpoint, initialParams = {}) => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
    const [loading, setLoading] = useState(false);

    // 1. FETCH DATA (GET)
    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const queryParams = { ...initialParams, ...params };
            const response = await api.get(endpoint, { params: queryParams });
            
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
            // Optional: toast.error("Gagal memuat data.");
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // 2. CREATE ITEM (POST)
    const createItem = async (newItem) => {
        setLoading(true);
        const toastId = toast.loading('Menyimpan data...');
        try {
            await api.post(endpoint, newItem);
            toast.success('Berhasil disimpan!', { id: toastId });
            await fetchData();
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Gagal menyimpan';
            toast.error(msg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 3. UPDATE ITEM (POST to ID)
    const updateItem = async (id, updatedItem) => {
        setLoading(true);
        const toastId = toast.loading('Memperbarui data...');
        try {
            await api.post(`${endpoint}/${id}`, updatedItem);
            toast.success('Berhasil diperbarui!', { id: toastId });
            await fetchData();
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Gagal update';
            toast.error(msg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 4. DELETE ITEM (DELETE)
    const deleteItem = async (id) => {
        if (!window.confirm('Yakin ingin menghapus data ini?')) return false;

        setLoading(true);
        const toastId = toast.loading('Menghapus...');
        try {
            await api.delete(`${endpoint}/${id}`); 
            toast.success('Data telah dihapus', { id: toastId });
            setData(prev => prev.filter(item => item.id !== id));
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Gagal menghapus';
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