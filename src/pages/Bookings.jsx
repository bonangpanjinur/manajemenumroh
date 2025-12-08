import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { UserCheck, Calendar, CreditCard, AlertCircle } from 'lucide-react';

const Bookings = () => {
    // 1. Inisialisasi State yang Aman (Anti-Crash)
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk Data Master (Dropdown)
    const [masters, setMasters] = useState({
        departures: [],
        agents: [],
        jamaah: []
    });

    // 2. Fetch Data Booking
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

    // 3. Fetch Data Master untuk Dropdown Form
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                // Gunakan Promise.allSettled agar jika satu gagal, yang lain tetap jalan
                const results = await Promise.allSettled([
                    api.get('/departures?status=open'), // Hanya jadwal yang masih buka
                    api.get('/agents?status=active'),
                    api.get('/jamaah') 
                ]);

                // Helper untuk mengambil value dengan aman
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

    // 4. Definisi Kolom Tabel
    const columns = [
        { 
            key: 'booking_code', 
            label: 'Kode Booking', 
            render: (val) => (
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                        {val || 'AUTO'}
                    </span>
                </div>
            )
        },
        { 
            key: 'jamaah_name', 
            label: 'Jamaah',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <UserCheck size={14} className="text-gray-400" />
                        {val}
                    </div>
                    <div className="text-xs text-gray-500 ml-5">
                        {row.jamaah_phone ? `📞 ${row.jamaah_phone}` : ''}
                    </div>
                </div>
            )
        },
        { 
            key: 'package_name', 
            label: 'Paket & Keberangkatan',
            render: (val, row) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-800">{val}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar size={12} />
                        {row.departure_date ? formatDate(row.departure_date) : '-'}
                    </div>
                </div>
            )
        },
        { 
            key: 'total_price', 
            label: 'Pembayaran',
            render: (val, row) => {
                const paid = parseFloat(row.paid_amount || 0);
                const total = parseFloat(val || 0);
                const remaining = total - paid;
                const isPaidOff = remaining <= 0;
                
                return (
                    <div className="text-right">
                        <div className="font-bold text-gray-800">{formatCurrency(total)}</div>
                        
                        {isPaidOff ? (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-bold border border-green-200">
                                LUNAS
                            </span>
                        ) : (
                            <div className="flex flex-col items-end mt-1">
                                <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 mb-0.5">
                                    Sisa: {formatCurrency(remaining)}
                                </span>
                                {paid > 0 && <span className="text-[10px] text-gray-400">Masuk: {formatCurrency(paid)}</span>}
                            </div>
                        )}
                    </div>
                )
            }
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: (val) => {
                const styles = { 
                    confirmed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '✅' }, 
                    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '⏳' }, 
                    cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '❌' } 
                };
                const style = styles[val] || styles.pending;
                return (
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} flex items-center justify-center gap-1 w-fit`}>
                        {style.icon} {val}
                    </span>
                );
            }
        }
    ];

    // 5. Definisi Form (Sekarang dengan Field Pembayaran & Info Dropdown)
    const formFields = [
        { section: 'Informasi Jamaah & Paket' },
        { 
            name: 'jamaah_id', 
            label: 'Pilih Jamaah', 
            type: 'select', 
            // Menampilkan Nama + Paspor agar tidak salah pilih orang
            options: (masters.jamaah || []).map(j => ({ 
                value: j.id, 
                label: `${j.name} ${j.passport_number ? `(Paspor: ${j.passport_number})` : ''}` 
            })),
            required: true,
            width: 'full',
            help: 'Pastikan data jamaah sudah lengkap sebelum membuat booking.'
        },
        { 
            name: 'departure_id', 
            label: 'Pilih Jadwal Keberangkatan', 
            type: 'select', 
            // Menampilkan Paket + Tanggal + Sisa Kursi
            options: (masters.departures || []).map(d => ({ 
                value: d.id, 
                label: `${d.package_name} - ${formatDate(d.departure_date)} (Sisa: ${d.quota - (d.filled_seats || 0)} Seat)` 
            })),
            required: true,
            width: 'full'
        },
        { 
            name: 'agent_id', 
            label: 'Agen Referensi (Opsional)', 
            type: 'select', 
            options: [{value: '', label: '- Langsung (Direct Customer) -'}, ...(masters.agents || []).map(a => ({ value: a.id, label: a.name }))],
            width: 'full'
        },
        
        { section: 'Detail Harga & Pembayaran' },
        { 
            name: 'room_type', 
            label: 'Tipe Kamar', 
            type: 'select', 
            options: [
                {value: 'quad', label: 'Quad (Sekamar Ber-4)'}, 
                {value: 'triple', label: 'Triple (Sekamar Ber-3)'}, 
                {value: 'double', label: 'Double (Sekamar Ber-2)'}
            ], 
            defaultValue: 'quad', 
            width: 'third' 
        },
        { name: 'total_price', label: 'Total Harga Deal (Rp)', type: 'number', required: true, width: 'third' },
        { name: 'paid_amount', label: 'Sudah Dibayar / DP (Rp)', type: 'number', defaultValue: 0, width: 'third' },
        
        { name: 'notes', label: 'Catatan (Request Khusus / Diskon)', type: 'textarea', width: 'full' },

        { section: 'Status Booking' },
        { 
            name: 'status', 
            label: 'Status', 
            type: 'select', 
            options: [
                {value: 'pending', label: 'Pending (Belum Fix)'}, 
                {value: 'confirmed', label: 'Confirmed (Pasti Berangkat)'}, 
                {value: 'cancelled', label: 'Cancelled (Batal)'}
            ], 
            defaultValue: 'pending', 
            width: 'full' 
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Manajemen Pemesanan (Booking)"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchBookings}
                formFields={formFields}
                searchPlaceholder="Cari kode booking, nama jamaah, atau paket..."
                onCreate={() => console.log("Create Booking")}
                onEdit={(row) => console.log("Edit Booking", row)}
                onDelete={(row) => console.log("Delete Booking", row)}
            />
        </div>
    );
};

export default Bookings;