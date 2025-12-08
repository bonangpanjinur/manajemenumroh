import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';

const Mutawwif = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMutawwif = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/mutawwif');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching mutawwif:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMutawwif();
    }, [fetchMutawwif]);

    const columns = [
        { 
            key: 'name', 
            label: 'Nama Mutawwif',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-800">{val}</div>
                    <div className="text-xs text-gray-500">{row.phone}</div>
                </div>
            )
        },
        { key: 'city_base', label: 'Basis Kota', render: (val) => val || 'Makkah' },
        { 
            key: 'rating', 
            label: 'Rating', 
            render: (val) => val ? <span className="text-yellow-600">★ {val}</span> : '-' 
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: (val) => val === 'active' 
                ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aktif</span> 
                : <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Non-Aktif</span>
        }
    ];

    const formFields = [
        { section: 'Profil Mutawwif' },
        { name: 'name', label: 'Nama Lengkap', type: 'text', required: true, width: 'half' },
        { name: 'phone', label: 'No. WhatsApp (Saudi/Indo)', type: 'text', required: true, width: 'half' },
        { name: 'city_base', label: 'Domisili Saat Ini', type: 'select', options: [{value: 'Makkah', label: 'Makkah'}, {value: 'Madinah', label: 'Madinah'}, {value: 'Jeddah', label: 'Jeddah'}, {value: 'Indonesia', label: 'Indonesia'}], width: 'half' },
        { name: 'education', label: 'Latar Belakang Pendidikan', type: 'text', width: 'half' },
        
        { section: 'Status' },
        { name: 'status', label: 'Status Ketersediaan', type: 'select', options: [{value: 'active', label: 'Aktif / Ready'}, {value: 'inactive', label: 'Pulang Indo / Cuti'}], defaultValue: 'active', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Data Mutawwif & Tour Leader"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchMutawwif}
                formFields={formFields}
                searchPlaceholder="Cari mutawwif..."
            />
        </div>
    );
};

export default Mutawwif;