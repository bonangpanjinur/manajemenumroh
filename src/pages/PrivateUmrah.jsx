import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/formatters';

const PrivateUmrah = () => {
    // 1. Safe Init
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Masters untuk dropdown
    const [masters, setMasters] = useState({
        jamaah: [],
        agents: []
    });

    // 2. Safe Fetch
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/private-umrah');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching private umrah:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Load Masters
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const results = await Promise.allSettled([
                    api.get('/jamaah'),
                    api.get('/agents')
                ]);
                
                const getVal = (res) => (res.status === 'fulfilled' && Array.isArray(res.value)) ? res.value : [];
                
                setMasters({
                    jamaah: getVal(results[0]),
                    agents: getVal(results[1])
                });
            } catch (e) {
                console.error("Master data error:", e);
            }
        };
        fetchRequests();
        fetchMasters();
    }, [fetchRequests]);

    const columns = [
        { 
            key: 'group_name', 
            label: 'Nama Group',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-800">{val}</div>
                    <div className="text-xs text-gray-500">Rep: {row.contact_person_name || '-'}</div>
                </div>
            )
        },
        { 
            key: 'departure_date_request', 
            label: 'Rencana Tgl',
            render: (val) => formatDate(val)
        },
        { 
            key: 'pax_count', 
            label: 'Pax', 
            render: (val) => <span className="font-bold">{val} Orang</span>
        },
        { 
            key: 'budget_per_pax', 
            label: 'Budget/Pax',
            render: (val) => formatCurrency(val)
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const colors = { new: 'bg-blue-100 text-blue-800', quoting: 'bg-yellow-100 text-yellow-800', deal: 'bg-green-100 text-green-800', lost: 'bg-gray-100 text-gray-800' };
                return <span className={`px-2 py-1 rounded text-xs uppercase ${colors[val] || 'bg-gray-100'}`}>{val}</span>;
            }
        }
    ];

    const formFields = [
        { section: 'Informasi Group' },
        { name: 'group_name', label: 'Nama Group / Keluarga', type: 'text', required: true, width: 'full' },
        { 
            name: 'jamaah_id', 
            label: 'Perwakilan Jamaah (PIC)', 
            type: 'select', 
            // SAFETY CHECK
            options: (masters.jamaah || []).map(j => ({ value: j.id, label: `${j.name} (${j.phone})` })),
            width: 'half' 
        },
        { 
            name: 'agent_id', 
            label: 'Agen Referensi (Opsional)', 
            type: 'select', 
            // SAFETY CHECK
            options: [{value: '', label: '- Direct -'}, ...(masters.agents || []).map(a => ({ value: a.id, label: a.name }))],
            width: 'half' 
        },

        { section: 'Detail Request' },
        { name: 'departure_date_request', label: 'Rencana Keberangkatan', type: 'date', required: true, width: 'half' },
        { name: 'duration_days', label: 'Durasi (Hari)', type: 'number', defaultValue: 9, width: 'half' },
        { name: 'pax_count', label: 'Jumlah Peserta (Pax)', type: 'number', required: true, width: 'half' },
        { name: 'hotel_preference', label: 'Preferensi Hotel', type: 'select', options: [{value: '3', label: 'Bintang 3'}, {value: '4', label: 'Bintang 4'}, {value: '5', label: 'Bintang 5'}], width: 'half' },
        
        { section: 'Keuangan' },
        { name: 'budget_per_pax', label: 'Estimasi Budget per Pax', type: 'number', width: 'half' },
        { name: 'status', label: 'Status Prospek', type: 'select', options: [{value: 'new', label: 'Baru'}, {value: 'quoting', label: 'Penawaran'}, {value: 'deal', label: 'Deal/Setuju'}, {value: 'lost', label: 'Batal'}], width: 'half' },
        { name: 'special_requests', label: 'Request Khusus', type: 'textarea', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Request Umrah Private / Custom"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchRequests}
                formFields={formFields}
                searchPlaceholder="Cari nama group..."
            />
        </div>
    );
};

export default PrivateUmrah;