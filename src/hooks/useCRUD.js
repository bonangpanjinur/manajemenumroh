import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useCRUD = (endpoint) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalItems: 0
    });
    
    // State untuk filter & search
    const [filters, setFilters] = useState({
        search: '',
        page: 1,
        per_page: 10
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            params.append('page', filters.page);
            params.append('per_page', filters.per_page);

            const response = await api.get(`${endpoint}?${params.toString()}`);
            const res = response.data;
            
            let extractedData = [];

            // Logic Ekstraksi Data (Support V7.0 Structure)
            if (res.data && Array.isArray(res.data)) {
                // Format Standard V7.0 (dari Controller baru)
                extractedData = res.data;
                if (res.pagination) {
                    setPagination({
                        page: parseInt(res.pagination.page),
                        totalPages: parseInt(res.pagination.total_pages),
                        totalItems: parseInt(res.pagination.total_items)
                    });
                }
            } else if (Array.isArray(res)) {
                extractedData = res;
            } else if (res.items) {
                extractedData = res.items;
            }

            setData(extractedData || []);

        } catch (error) {
            console.error("CRUD Fetch Error:", error);
            // Jangan tampilkan toast error saat mounting awal jika hanya masalah auth
            if (error.response?.status !== 401) {
                toast.error("Gagal memuat data: " + (error.response?.data?.message || error.message));
            }
            setData([]); 
        } finally {
            setLoading(false);
        }
    }, [endpoint, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const deleteItem = async (item) => {
        // Prioritaskan UUID jika ada, jika tidak gunakan ID biasa
        const identifier = item.uuid || item.id;
        
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return false;

        try {
            await api.delete(`${endpoint}/${identifier}`);
            toast.success("Data berhasil dihapus");
            fetchData(); 
            return true;
        } catch (error) {
            toast.error("Gagal menghapus: " + error.message);
            return false;
        }
    };

    const createItem = async (formData) => {
        try {
            await api.post(endpoint, formData);
            toast.success("Data berhasil dibuat");
            fetchData();
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal membuat data");
            return false;
        }
    };

    const updateItem = async (id, formData) => {
        try {
            await api.put(`${endpoint}/${id}`, formData);
            toast.success("Data berhasil diperbarui");
            fetchData();
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal update data");
            return false;
        }
    };

    const changePage = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleSearch = (keyword) => {
        setFilters(prev => ({ ...prev, search: keyword, page: 1 }));
    };

    return { 
        data, 
        loading, 
        pagination, 
        fetchData, 
        deleteItem, 
        createItem,
        updateItem,
        changePage, 
        handleSearch 
    };
};

export default useCRUD;