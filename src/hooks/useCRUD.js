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
            // Mengirim parameter search & pagination ke server
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            params.append('page', filters.page);
            params.append('per_page', filters.per_page);

            const response = await api.get(`${endpoint}?${params.toString()}`);
            
            // Handle response format: Support format standar WP REST atau custom format kita
            if (response.data && response.data.items) {
                setData(response.data.items);
                setPagination({
                    page: parseInt(response.data.page),
                    totalPages: parseInt(response.data.totalPages),
                    totalItems: parseInt(response.data.totalItems)
                });
            } else if (Array.isArray(response.data)) {
                // Fallback jika API belum support pagination (return array langsung)
                setData(response.data);
            }
        } catch (error) {
            console.error("CRUD Fetch Error:", error);
            toast.error("Gagal memuat data: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, [endpoint, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const deleteItem = async (id) => {
        try {
            await api.delete(`${endpoint}/${id}`);
            toast.success("Data berhasil dihapus");
            fetchData(); // Refresh data
            return true;
        } catch (error) {
            toast.error("Gagal menghapus: " + error.message);
            return false;
        }
    };

    // Fungsi untuk mengubah halaman
    const changePage = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Fungsi untuk search
    const handleSearch = (keyword) => {
        setFilters(prev => ({ ...prev, search: keyword, page: 1 })); // Reset ke hal 1 saat search
    };

    return { 
        data, 
        loading, 
        pagination, 
        fetchData, 
        deleteItem, 
        changePage, 
        handleSearch 
    };
};

export default useCRUD;