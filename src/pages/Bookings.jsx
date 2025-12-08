import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Bookings = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State Data Master
    const [masters, setMasters] = useState({
        departures: [],
        agents: [],
        jamaah: []
    });

    // Fetch Data Table
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/bookings');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Masters
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const results = await Promise.allSettled([
                    api.get('/departures?status=open'),
                    api.get('/agents?status=active'),
                    api.get('/jamaah') // Idealnya ini search-based, tapi untuk aman diload dulu
                ]);

                const unwrap = (res) => (res.status === 'fulfilled' && Array.isArray(res.value)) ? res.value : [];

                setMasters({
                    departures: unwrap(results[0]),
                    agents: unwrap(results[1]),
                    jamaah: unwrap(results[2])
                });
            } catch (e) {
                console.error("Master data error:", e);
            }
        };

        fetchBookings();
        fetchMasters();
    }, [fetchBookings]);

    const columns = [
        { key: 'booking_code', label: 'Kode Booking', render: (val) => <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded">{val}</span> },
        { 
            key: 'jamaah_name', 
            label: 'Jamaah',
            render: (val, row) => (
                <div>
                    <div className="font-medium text-gray-900">{val}</div>
                    <div className="text-xs text-gray-500">{row.jamaah_phone || '-'}</div>
                </div>
            )
        },
        { 
            key: 'package_name', 
            label: 'Paket & Keberangkatan',
            render: (val, row) => (
                <div className="text-sm">
                    <div className="text-blue-600 font-medium">{val}</div>
                    <div className="text-xs text-gray-500">Tgl: {formatDate(row.departure_date)}</div>
                </div>
            )
        },
        { 
            key: 'total_price', 
            label: 'Tagihan',
            render: (val, row) => (
                <div className="text-right">
                    <div className="font-semibold">{formatCurrency(val)}</div>
                    <div className={`text-xs ${row.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                        {row.payment_status === 'paid' ? 'Lunas' : `Kurang: ${formatCurrency(row.remaining_payment)}`}
                    </div>
                </div>
            )
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: (val) => {
                const colors = { confirmed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', cancelled: 'bg-red-100 text-red-800' };
                return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[val] || 'bg-gray-100'}`}>{val}</span>;
            }
        }
    ];

    const formFields = [
        { section: 'Data Booking' },
        { 
            name: 'jamaah_id', 
            label: 'Pilih Jamaah', 
            type: 'select', 
            // SAFETY CHECK
            options: (masters.jamaah || []).map(j => ({ value: j.id, label: `${j.name} - ${j.passport_number || 'No Passport'}` })),
            required: true,
            width: 'full'
        },
        { 
            name: 'departure_id', 
            label: 'Pilih Jadwal Keberangkatan', 
            type: 'select', 
            // SAFETY CHECK
            options: (masters.departures || []).map(d => ({ value: d.id, label: `${d.package_name} - ${formatDate(d.departure_date)}` })),
            required: true,
            width: 'full'
        },
        { 
            name: 'agent_id', 
            label: 'Agen (Opsional)', 
            type: 'select', 
            // SAFETY CHECK
            options: [{value: '', label: '- Langsung (Direct) -'}, ...(masters.agents || []).map(a => ({ value: a.id, label: a.name }))],
            width: 'full'
        },
        
        { section: 'Detail Harga' },
        { name: 'room_type', label: 'Tipe Kamar', type: 'select', options: [{value: 'quad', label: 'Quad (Isi 4)'}, {value: 'triple', label: 'Triple (Isi 3)'}, {value: 'double', label: 'Double (Isi 2)'}], defaultValue: 'quad', width: 'half' },
        { name: 'total_price', label: 'Total Harga Deal', type: 'number', required: true, width: 'half' },
        { name: 'notes', label: 'Catatan Khusus', type: 'textarea', width: 'full' },

        { section: 'Status' },
        { name: 'status', label: 'Status Booking', type: 'select', options: [{value: 'pending', label: 'Pending'}, {value: 'confirmed', label: 'Confirmed'}, {value: 'cancelled', label: 'Cancelled'}], defaultValue: 'pending', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Data Pemesanan (Booking)"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchBookings}
                formFields={formFields}
                searchPlaceholder="Cari kode booking atau nama jamaah..."
            />
        </div>
    );
};

export default Bookings;