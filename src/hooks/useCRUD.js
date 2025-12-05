import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useCRUD = (endpoint) => {
    // Inisialisasi dengan Array Kosong [] agar .map() tidak error di awal
    const [data, setData] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalItems: 0
    });
    
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
            
            // Logika Ekstraksi Data yang Aman (Anti-Crash)
            let extractedData = [];

            if (res.success && res.data) {
                if (Array.isArray(res.data)) {
                    extractedData = res.data;
                } else if (res.data.data && Array.isArray(res.data.data)) {
                    extractedData = res.data.data; // Handle pagination structure
                }
            } else if (Array.isArray(res)) {
                extractedData = res;
            }

            // Update Pagination jika ada
            if (res.pagination) {
                setPagination({
                    page: parseInt(res.pagination.page),
                    totalPages: parseInt(res.pagination.total_pages),
                    totalItems: parseInt(res.pagination.total_items)
                });
            }

            // Pastikan extractedData adalah array sebelum diset
            setData(Array.isArray(extractedData) ? extractedData : []);

        } catch (error) {
            console.error("CRUD Fetch Error:", error);
            // Jangan tampilkan toast error saat mounting awal jika 401/404 (biar ga spam)
            if (error.response && error.response.status !== 404) {
                 // toast.error("Gagal memuat data"); 
            }
            setData([]); // Fallback ke array kosong jika error
        } finally {
            setLoading(false);
        }
    }, [endpoint, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const deleteItem = async (item) => {
        const identifier = item.uuid || item.id;
        if (!confirm('Hapus data ini?')) return false;

        try {
            await api.delete(`${endpoint}/${identifier}`);
            toast.success("Terhapus");
            fetchData(); 
            return true;
        } catch (error) {
            toast.error("Gagal hapus");
            return false;
        }
    };

    return { 
        data, 
        loading, 
        pagination, 
        fetchData, 
        deleteItem,
        // Helper update local state tanpa fetch ulang (opsional)
        setData 
    };
};

export default useCRUD;