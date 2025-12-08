import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatDate } from '../utils/formatters';

const Support = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/support/tickets');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const columns = [
        { 
            key: 'subject', 
            label: 'Subjek',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-800">{val}</div>
                    <div className="text-xs text-gray-500">Oleh: {row.user_name || 'Guest'}</div>
                </div>
            )
        },
        { 
            key: 'priority', 
            label: 'Prioritas',
            render: (val) => {
                const colors = { high: 'text-red-600 bg-red-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-blue-600 bg-blue-50' };
                return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[val] || 'bg-gray-100'}`}>{val}</span>
            }
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const map = { open: 'bg-green-100 text-green-700', closed: 'bg-gray-200 text-gray-600', in_progress: 'bg-blue-100 text-blue-700' };
                return <span className={`px-2 py-1 rounded text-xs font-medium ${map[val] || 'bg-gray-100'}`}>{val.replace('_', ' ')}</span>
            }
        },
        { key: 'created_at', label: 'Dibuat', render: (val) => formatDate(val) }
    ];

    const formFields = [
        { name: 'subject', label: 'Judul Tiket', type: 'text', required: true, width: 'full' },
        { 
            name: 'priority', 
            label: 'Prioritas', 
            type: 'select', 
            options: [{value: 'low', label: 'Low'}, {value: 'medium', label: 'Medium'}, {value: 'high', label: 'High (Urgent)'}], 
            defaultValue: 'medium',
            width: 'half' 
        },
        { 
            name: 'category', 
            label: 'Kategori', 
            type: 'select', 
            options: [{value: 'technical', label: 'Kendala Teknis'}, {value: 'billing', label: 'Pembayaran'}, {value: 'feature', label: 'Request Fitur'}], 
            width: 'half' 
        },
        { name: 'message', label: 'Pesan / Deskripsi Masalah', type: 'textarea', required: true, width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Tiket Bantuan (Support)"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchTickets}
                formFields={formFields}
                searchPlaceholder="Cari tiket..."
            />
        </div>
    );
};

export default Support;