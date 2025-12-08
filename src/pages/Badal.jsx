import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const Badal = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mutawwifs, setMutawwifs] = useState([]);

    const fetchBadal = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/badal');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching badal:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const res = await api.get('/mutawwif?status=active');
                setMutawwifs(Array.isArray(res) ? res : []);
            } catch (e) {
                setMutawwifs([]);
            }
        };
        fetchBadal();
        fetchMasters();
    }, [fetchBadal]);

    const columns = [
        { 
            key: 'badal_for_name', 
            label: 'Badal Untuk (Alm)',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-800">{val}</div>
                    <div className="text-xs text-gray-500">Bin/Binti: {row.bin_binti || '-'}</div>
                </div>
            )
        },
        { 
            key: 'ordered_by_name', 
            label: 'Pemesan',
            render: (val, row) => (
                <div className="text-sm">
                    <div>{val}</div>
                    <div className="text-xs text-gray-500">{row.ordered_by_phone}</div>
                </div>
            )
        },
        { 
            key: 'executor_name', 
            label: 'Pelaksana (Mutawwif)',
            render: (val) => val ? <span className="text-blue-600 font-medium">{val}</span> : <span className="text-gray-400 italic">Belum ditunjuk</span>
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const map = { pending: 'bg-gray-100', assigned: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', certificate_sent: 'bg-purple-100 text-purple-800' };
                return <span className={`px-2 py-1 rounded text-xs ${map[val] || 'bg-gray-100'}`}>{val ? val.replace('_', ' ').toUpperCase() : '-'}</span>;
            }
        }
    ];

    const formFields = [
        { section: 'Data Almarhum/ah' },
        { name: 'badal_for_name', label: 'Nama Yang Dibadalkan', type: 'text', required: true, width: 'half' },
        { name: 'bin_binti', label: 'Bin / Binti', type: 'text', required: true, width: 'half' },
        { name: 'gender', label: 'Jenis Kelamin', type: 'select', options: [{value: 'L', label: 'Laki-laki'}, {value: 'P', label: 'Perempuan'}], width: 'half' },
        { name: 'notes', label: 'Catatan Khusus', type: 'text', width: 'half' },

        { section: 'Data Pemesan' },
        { name: 'ordered_by_name', label: 'Nama Pemesan', type: 'text', required: true, width: 'half' },
        { name: 'ordered_by_phone', label: 'No. WhatsApp Pemesan', type: 'text', required: true, width: 'half' },
        { name: 'price', label: 'Biaya Badal', type: 'number', defaultValue: 2500000, width: 'full' },

        { section: 'Pelaksanaan' },
        { 
            name: 'executor_id', 
            label: 'Pilih Pelaksana (Mutawwif)', 
            type: 'select', 
            // SAFETY CHECK
            options: [{value: '', label: '- Belum Ditunjuk -'}, ...(mutawwifs || []).map(m => ({ value: m.id, label: m.name }))],
            width: 'full' 
        },
        { 
            name: 'status', 
            label: 'Status Pengerjaan', 
            type: 'select', 
            options: [
                {value: 'pending', label: 'Menunggu'}, 
                {value: 'assigned', label: 'Pelaksana Ditunjuk'}, 
                {value: 'completed', label: 'Selesai Dilaksanakan'},
                {value: 'certificate_sent', label: 'Sertifikat Dikirim'}
            ],
            defaultValue: 'pending',
            width: 'full' 
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Layanan Badal Umrah"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchBadal}
                formFields={formFields}
                searchPlaceholder="Cari nama almarhum..."
            />
        </div>
    );
};

export default Badal;