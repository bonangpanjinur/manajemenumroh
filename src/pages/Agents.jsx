import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { User, CreditCard, Award, Users } from 'lucide-react';

const Agents = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAgents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/agents');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching agents:", error);
            setData([]);
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
            label: 'Agen / Mitra',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {val ? val.charAt(0) : 'A'}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{val}</div>
                        <div className="text-xs text-gray-500">{row.agency_name || 'Individual'}</div>
                    </div>
                </div>
            )
        },
        { 
            key: 'phone', 
            label: 'Kontak', 
            render: (val) => val ? <div className="text-sm font-mono text-gray-600">{val}</div> : '-' 
        },
        { 
            key: 'commission_rate', 
            label: 'Komisi', 
            render: (val) => <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200">{val || 0}% / Pax</span>
        },
        { 
            key: 'total_jamaah', 
            label: 'Performa', 
            render: (val) => (
                <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                    <Users size={14} /> {val || 0} Jamaah
                </div>
            )
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {val === 'active' ? 'AKTIF' : 'SUSPEND'}
                </span>
            )
        }
    ];

    const formFields = [
        { section: 'Profil Agen' },
        { name: 'name', label: 'Nama Lengkap', type: 'text', required: true, width: 'half' },
        { name: 'agency_name', label: 'Nama Travel / Agency', type: 'text', width: 'half', placeholder: 'Cth: Berkah Cabang Bandung' },
        { name: 'phone', label: 'No. WhatsApp', type: 'text', required: true, width: 'half' },
        { name: 'email', label: 'Email', type: 'email', width: 'half' },
        { name: 'city', label: 'Kota Domisili', type: 'text', width: 'full' },

        { section: 'Keuangan & Komisi' },
        { name: 'bank_name', label: 'Nama Bank', type: 'text', width: 'third', placeholder: 'BCA / Mandiri' },
        { name: 'account_number', label: 'Nomor Rekening', type: 'text', width: 'third' },
        { name: 'account_holder', label: 'Atas Nama', type: 'text', width: 'third' },
        { name: 'commission_rate', label: 'Rate Komisi (%)', type: 'number', width: 'half', help: 'Persentase komisi per jamaah closing.' },
        { name: 'status', label: 'Status Kemitraan', type: 'select', options: [{value: 'active', label: 'Aktif'}, {value: 'inactive', label: 'Non-Aktif'}], width: 'half' }
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
                searchPlaceholder="Cari agen..."
            />
        </div>
    );
};

export default Agents;