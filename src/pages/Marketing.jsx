import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api'; // PERBAIKAN: Menggunakan named import { api }

const Marketing = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/marketing/leads');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching leads:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const columns = [
        { 
            key: 'name', 
            label: 'Nama Calon Jamaah',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-900">{val}</div>
                    <div className="text-xs text-blue-600">{row.source || 'Direct'}</div>
                </div>
            )
        },
        { key: 'phone', label: 'WhatsApp', render: (val) => val ? `📱 ${val}` : '-' },
        { key: 'interest', label: 'Minat Paket', render: (val) => <span className="italic text-gray-600">{val || 'Belum spesifik'}</span> },
        { 
            key: 'status', 
            label: 'Prospek',
            render: (val) => {
                const colors = { new: 'bg-blue-100 text-blue-700', follow_up: 'bg-yellow-100 text-yellow-700', closing: 'bg-green-100 text-green-700', lost: 'bg-gray-100 text-gray-500' };
                return <span className={`px-2 py-1 rounded-full text-xs ${colors[val] || 'bg-gray-100'}`}>{val ? val.replace('_', ' ').toUpperCase() : 'NEW'}</span>
            }
        },
        { key: 'created_at', label: 'Tgl Input', render: (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-' }
    ];

    const formFields = [
        { section: 'Data Prospek' },
        { name: 'name', label: 'Nama Calon Jamaah', type: 'text', required: true, width: 'full' },
        { name: 'phone', label: 'Nomor WhatsApp', type: 'text', required: true, width: 'half' },
        { 
            name: 'source', 
            label: 'Sumber Info', 
            type: 'select', 
            options: [
                {value: 'Instagram', label: 'Instagram Ads'}, 
                {value: 'Facebook', label: 'Facebook'}, 
                {value: 'Website', label: 'Website'},
                {value: 'Walk-In', label: 'Datang Langsung'},
                {value: 'Referral', label: 'Rekomendasi Teman'}
            ], 
            width: 'half' 
        },
        { name: 'interest', label: 'Minat Paket', type: 'text', placeholder: 'Misal: Paket Awal Tahun', width: 'full' },
        
        { section: 'Follow Up' },
        { 
            name: 'status', 
            label: 'Status Prospek', 
            type: 'select', 
            options: [
                {value: 'new', label: 'Baru Masuk'}, 
                {value: 'follow_up', label: 'Sedang Follow Up'}, 
                {value: 'closing', label: 'Closing / Booking'},
                {value: 'lost', label: 'Tidak Berminat'}
            ], 
            defaultValue: 'new',
            width: 'full' 
        },
        { name: 'notes', label: 'Catatan Follow Up', type: 'textarea', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Database Marketing & Leads"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchLeads}
                formFields={formFields}
                searchPlaceholder="Cari nama atau nomor HP..."
            />
        </div>
    );
};

export default Marketing;