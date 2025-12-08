import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const Bookings = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [masters, setMasters] = useState({ departures: [], agents: [], jamaah: [] });

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/bookings');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadMasters = async () => {
            try {
                const [d, a, j] = await Promise.all([
                    api.get('/departures?status=open'),
                    api.get('/agents?status=active'),
                    api.get('/jamaah')
                ]);
                setMasters({
                    departures: Array.isArray(d) ? d : [],
                    agents: Array.isArray(a) ? a : [],
                    jamaah: Array.isArray(j) ? j : []
                });
            } catch (e) { console.error(e); }
        };
        fetchBookings();
        loadMasters();
    }, [fetchBookings]);

    const columns = [
        { 
            key: 'booking_code', 
            label: 'Kode', 
            render: (val) => <span className="font-mono font-bold text-xs bg-gray-100 px-2 py-1 rounded">{val}</span>
        },
        { 
            key: 'jamaah_name', 
            label: 'Jamaah',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-900">{val}</div>
                    <div className="text-xs text-gray-500">{row.package_name}</div>
                </div>
            )
        },
        { 
            key: 'payment_progress', 
            label: 'Status Pembayaran',
            render: (_, row) => {
                const total = parseFloat(row.total_price || 0);
                const paid = parseFloat(row.paid_amount || 0);
                const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
                const remaining = total - paid;

                return (
                    <div className="w-40">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-gray-700">{percent}%</span>
                            <span className={remaining <= 0 ? "text-green-600 font-bold" : "text-red-500"}>
                                {remaining <= 0 ? 'LUNAS' : `Kurang: ${formatCurrency(remaining)}`}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-500 ${percent === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                            Total: {formatCurrency(total)}
                        </div>
                    </div>
                );
            }
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: (val) => {
                const styles = { confirmed: 'bg-green-50 text-green-700', pending: 'bg-yellow-50 text-yellow-700', cancelled: 'bg-red-50 text-red-700' };
                return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${styles[val]}`}>{val}</span>;
            }
        }
    ];

    const formFields = [
        { section: 'Data Booking' },
        { 
            name: 'jamaah_id', label: 'Pilih Jamaah', type: 'select', required: true, width: 'full',
            options: masters.jamaah.map(j => ({ value: j.id, label: `${j.name} - ${j.passport_number || 'No Paspor'}` }))
        },
        { 
            name: 'departure_id', label: 'Jadwal Keberangkatan', type: 'select', required: true, width: 'full',
            options: masters.departures.map(d => ({ value: d.id, label: `${d.package_name} (${formatDate(d.departure_date)})` }))
        },
        
        { section: 'Detail Harga & Kamar' },
        { 
            name: 'room_type', label: 'Tipe Kamar', type: 'select', width: 'half',
            options: [{value: 'quad', label: 'Quad (Sekamar 4)'}, {value: 'triple', label: 'Triple (Sekamar 3)'}, {value: 'double', label: 'Double (Sekamar 2)'}]
        },
        { name: 'agent_id', label: 'Agen / Referensi', type: 'select', width: 'half', options: [{value: '', label: 'Direct (Langsung)'}, ...masters.agents.map(a => ({ value: a.id, label: a.name }))] },
        
        { section: 'Keuangan' },
        { name: 'total_price', label: 'Harga Deal (Rp)', type: 'number', required: true, width: 'half' },
        { name: 'paid_amount', label: 'Uang Muka / DP (Rp)', type: 'number', defaultValue: 0, width: 'half' },
        { name: 'notes', label: 'Catatan Booking', type: 'textarea', width: 'full' },
        { name: 'status', label: 'Status', type: 'select', options: [{value: 'pending', label: 'Pending'}, {value: 'confirmed', label: 'Confirmed'}, {value: 'cancelled', label: 'Cancelled'}], width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Manajemen Pemesanan (Bookings)"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchBookings}
                formFields={formFields}
                searchPlaceholder="Cari booking..."
            />
        </div>
    );
};

export default Bookings;