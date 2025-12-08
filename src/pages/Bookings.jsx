import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

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
            label: 'Kode', 
            render: (val) => <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{val || 'AUTO'}</span> 
        },
        { 
            key: 'jamaah_name', 
            label: 'Data Jamaah',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-900">{val}</div>
                    <div className="text-xs text-gray-500">
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
                    <div className="text-blue-600 font-medium">{val}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        📅 {row.departure_date ? formatDate(row.departure_date) : '-'}
                    </div>
                </div>
            )
        },
        { 
            key: 'total_price', 
            label: 'Status Pembayaran',
            render: (val, row) => {
                const paid = parseFloat(row.paid_amount || 0);
                const total = parseFloat(val || 0);
                const remaining = total - paid;
                const isPaidOff = remaining <= 0;
                
                return (
                    <div className="text-right">
                        <div className="font-bold text-gray-800">{formatCurrency(total)}</div>
                        
                        {isPaidOff ? (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-bold">
                                LUNAS
                            </span>
                        ) : (
                            <div className="text-xs text-red-500 font-medium mt-1">
                                Sisa: {formatCurrency(remaining)}
                            </div>
                        )}
                        
                        {paid > 0 && !isPaidOff && (
                            <div className="text-[10px] text-gray-400">Sudah bayar: {formatCurrency(paid)}</div>
                        )}
                    </div>
                )
            }
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: (val) => {
                const colors = { 
                    confirmed: 'bg-green-50 text-green-700 border border-green-200', 
                    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200', 
                    cancelled: 'bg-red-50 text-red-700 border border-red-200' 
                };
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${colors[val] || 'bg-gray-100'}`}>
                        {val}
                    </span>
                );
            }
        }
    ];

    // 5. Definisi Form (Sekarang dengan Field Pembayaran)
    const formFields = [
        { section: 'Data Booking' },
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
            width: 'full'
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
            label: 'Agen / Referensi (Opsional)', 
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