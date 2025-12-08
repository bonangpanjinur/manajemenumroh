import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api'; // PERBAIKAN: Menggunakan named import { api }

const Agents = () => {
    // 1. Safe State Initialization
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Safe Fetch Logic
    const fetchAgents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/agents');
            // Pastikan selalu array
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching agents:", error);
            setData([]); // Fallback ke array kosong
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const columns = [
        { 
            key: 'name', 
            label: 'Nama Agen',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-900">{val}</div>
                    <div className="text-xs text-gray-500">{row.agency_name || 'Perorangan'}</div>
                </div>
            )
        },
        { 
            key: 'phone', 
            label: 'Kontak', 
            render: (val) => val ? (
                <div className="flex flex-col text-xs">
                    <span className="text-gray-700">📱 {val}</span>
                </div>
            ) : '-' 
        },
        { key: 'city', label: 'Kota', render: (val) => val || '-' },
        { 
            key: 'total_jamaah', 
            label: 'Total Jamaah', 
            render: (val) => <span className="font-semibold text-blue-600">{val || 0}</span>
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => val === 'active' 
                ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aktif</span> 
                : <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">Non-Aktif</span>
        }
    ];

    const formFields = [
        { section: 'Profil Agen' },
        { name: 'name', label: 'Nama Lengkap', type: 'text', required: true, width: 'half' },
        { name: 'agency_name', label: 'Nama Travel/Perusahaan (Opsional)', type: 'text', width: 'half' },
        
        { section: 'Kontak' },
        { name: 'phone', label: 'No. WhatsApp', type: 'text', required: true, width: 'half' },
        { name: 'email', label: 'Email', type: 'email', width: 'half' },
        { name: 'city', label: 'Kota Domisili', type: 'text', width: 'half' },
        { name: 'address', label: 'Alamat Lengkap', type: 'textarea', width: 'full' },
        
        { section: 'Status Akun' },
        { 
            name: 'status', 
            label: 'Status Kemitraan', 
            type: 'select', 
            options: [{value: 'active', label: 'Aktif'}, {value: 'inactive', label: 'Non-Aktif / Suspend'}], 
            defaultValue: 'active',
            width: 'full' 
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Manajemen Agen & Mitra"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchAgents}
                formFields={formFields}
                searchPlaceholder="Cari nama agen atau kota..."
            />
        </div>
    );
};

export default Agents;