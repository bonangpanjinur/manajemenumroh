import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatDate } from '../utils/formatters';

const Manasik = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchManasik = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/manasik');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching manasik:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchManasik();
    }, [fetchManasik]);

    const columns = [
        { 
            key: 'event_name', 
            label: 'Acara / Sesi',
            render: (val) => <span className="font-bold text-gray-800">{val}</span>
        },
        { 
            key: 'event_date', 
            label: 'Tanggal & Waktu',
            render: (val, row) => (
                <div className="text-sm">
                    <div>📅 {formatDate(val)}</div>
                    <div className="text-gray-500">🕒 {row.start_time ? row.start_time.slice(0,5) : '-'} - {row.end_time ? row.end_time.slice(0,5) : '-'} WIB</div>
                </div>
            )
        },
        { key: 'location', label: 'Lokasi', render: (val) => <span className="text-gray-600">📍 {val || 'Kantor Pusat'}</span> },
        { 
            key: 'attendance_count', 
            label: 'Kehadiran',
            render: (val) => <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs">{val || 0} Peserta</span>
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => val === 'upcoming' 
                ? <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold">Akan Datang</span> 
                : <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Selesai</span>
        }
    ];

    const formFields = [
        { section: 'Detail Acara' },
        { name: 'event_name', label: 'Nama Sesi Manasik', type: 'text', required: true, width: 'full', placeholder: 'Manasik Teori 1...' },
        { name: 'location', label: 'Lokasi', type: 'text', width: 'full', placeholder: 'Aula Utama / Masjid...' },
        
        { section: 'Waktu Pelaksanaan' },
        { name: 'event_date', label: 'Tanggal', type: 'date', required: true, width: 'third' },
        { name: 'start_time', label: 'Jam Mulai', type: 'time', width: 'third' },
        { name: 'end_time', label: 'Jam Selesai', type: 'time', width: 'third' },
        
        { section: 'Pembicara' },
        { name: 'speaker_name', label: 'Nama Pemateri / Ustadz', type: 'text', width: 'half' },
        { name: 'status', label: 'Status Event', type: 'select', options: [{value: 'upcoming', label: 'Akan Datang'}, {value: 'completed', label: 'Selesai'}, {value: 'cancelled', label: 'Dibatalkan'}], defaultValue: 'upcoming', width: 'half' },
        { name: 'materials_link', label: 'Link Materi (Opsional)', type: 'url', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Jadwal Manasik Umrah"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchManasik}
                formFields={formFields}
                searchPlaceholder="Cari jadwal manasik..."
            />
        </div>
    );
};

export default Manasik;