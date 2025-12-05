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
            const res = response.data;
            
            let extractedData = [];

            // LOGIKA EKSTRAKSI DATA YANG LEBIH PINTAR
            // Menangani berbagai format response dari backend PHP yang tidak konsisten

            if (Array.isArray(res)) {
                // Format 1: Langsung Array [...] (Contoh: api-departures.php)
                extractedData = res;
            } 
            else if (res.items && Array.isArray(res.items)) {
                // Format 2: { items: [...], page: ... } (Contoh: api-packages.php)
                extractedData = res.items;
                // Set pagination jika ada
                setPagination({
                    page: parseInt(res.page || 1),
                    totalPages: parseInt(res.totalPages || 1),
                    totalItems: parseInt(res.totalItems || res.items.length)
                });
            } 
            else if (res.data && Array.isArray(res.data)) {
                // Format 3: { success: true, data: [...] } (Contoh: api-marketing.php)
                extractedData = res.data;
            }
            else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                // Format 4: { success: true, data: { data: [...] } } 
                // (Contoh: api-finance.php yang pakai wp_send_json_success dengan wrapper array)
                extractedData = res.data.data;
            }
            else if (res.data && typeof res.data === 'object') {
                // Fallback jika data dibungkus object tapi bukan array (jarang terjadi tapi mungkin)
                // Mencoba mencari properti array di dalam object data
                const possibleArray = Object.values(res.data).find(val => Array.isArray(val));
                if (possibleArray) extractedData = possibleArray;
            }

            // Pastikan yang diset ke state SELALU array
            setData(extractedData || []);

        } catch (error) {
            console.error("CRUD Fetch Error:", error);
            toast.error("Gagal memuat data: " + (error.response?.data?.message || error.message));
            setData([]); // Set empty array on error to prevent map/filter crash
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