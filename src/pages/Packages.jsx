import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters'; // Pastikan ada atau ganti fungsi inline

const Packages = () => {
    // 1. State Inisialisasi Selalu Array Kosong []
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk data master (dropdown)
    const [masters, setMasters] = useState({
        categories: [],
        airlines: [],
        hotels: []
    });

    // 2. Fetch Function yang Robust
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Data Utama
            const result = await api.get('/packages');
            // Pastikan result selalu array
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error fetching packages:", error);
            setData([]); // Fallback
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Fetch Master Data (Hanya sekali saat mount)
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                // Gunakan Promise.allSettled agar jika satu gagal, yang lain tetap jalan
                const results = await Promise.allSettled([
                    api.get('/package-categories'),
                    api.get('/masters?type=airlines'),
                    api.get('/masters?type=hotels')
                ]);

                // Helper untuk ambil value safely
                const getValue = (res) => (res.status === 'fulfilled' && Array.isArray(res.value)) ? res.value : [];

                setMasters({
                    categories: getValue(results[0]),
                    airlines: getValue(results[1]),
                    hotels: getValue(results[2])
                });
            } catch (e) {
                console.error("Master data error:", e);
            }
        };

        fetchData();
        fetchMasters();
    }, [fetchData]);

    // 4. Definisi Kolom
    const columns = [
        { 
            key: 'name', 
            label: 'Nama Paket',
            render: (val, row) => (
                <div>
                    <div className="font-bold">{val}</div>
                    <div className="text-xs text-gray-500">{row?.duration_days || 0} Hari</div>
                </div>
            )
        },
        { 
            key: 'category_name', 
            label: 'Kategori',
            render: (val) => <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{val || 'Umum'}</span>
        },
        { 
            key: 'base_price_quad', 
            label: 'Harga (Quad)',
            render: (val) => <span className="font-mono font-medium">{val ? `Rp ${parseInt(val).toLocaleString('id-ID')}` : '-'}</span>
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const color = val === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                return <span className={`px-2 py-1 rounded text-xs uppercase ${color}`}>{val || '-'}</span>;
            }
        }
    ];

    // 5. Definisi Form Fields (Dengan Safe Options)
    const formFields = [
        { name: 'name', label: 'Nama Paket', type: 'text', required: true, width: 'half' },
        { 
            name: 'category_id', 
            label: 'Kategori', 
            type: 'select', 
            // Pastikan options selalu array, jangan biarkan map berjalan di undefined
            options: (masters.categories || []).map(c => ({ value: c.id, label: c.name })),
            width: 'half'
        },
        { name: 'base_price_quad', label: 'Harga Quad', type: 'number', width: 'half' },
        { name: 'status', label: 'Status', type: 'select', options: [{value: 'active', label: 'Active'}, {value: 'draft', label: 'Draft'}], width: 'half' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Manajemen Paket Umrah"
                columns={columns}
                data={data}           // Data yang dikirim sudah dijamin array di state
                loading={loading}
                onRefresh={fetchData}
                formFields={formFields}
                onCreate={() => console.log("Create clicked")}
                onEdit={(row) => console.log("Edit clicked", row)}
                onDelete={(row) => console.log("Delete clicked", row)}
            />
        </div>
    );
};

export default Packages;