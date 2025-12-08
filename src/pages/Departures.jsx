import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/formatters';

const Departures = () => {
    // 1. Inisialisasi State dengan Array Kosong (PENTING)
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [masters, setMasters] = useState({
        packages: [],
        airlines: [],
        mutawwifs: []
    });

    // 2. Fetch Data Utama
    const fetchDepartures = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/departures');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching departures:", error);
            setData([]); 
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Fetch Master Data untuk Dropdown
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                // Gunakan Promise.allSettled agar satu gagal tidak mematikan semua
                const results = await Promise.allSettled([
                    api.get('/packages'),
                    api.get('/masters?type=airlines'),
                    api.get('/mutawwif?status=active')
                ]);

                // Helper safe unwrap
                const unwrap = (res) => (res.status === 'fulfilled' && Array.isArray(res.value)) ? res.value : [];

                setMasters({
                    packages: unwrap(results[0]),
                    airlines: unwrap(results[1]),
                    mutawwifs: unwrap(results[2])
                });
            } catch (e) {
                console.error("Master data error:", e);
            }
        };

        fetchDepartures();
        fetchMasters();
    }, [fetchDepartures]);

    const columns = [
        { 
            key: 'departure_date', 
            label: 'Tanggal', 
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-800">{formatDate(val)}</div>
                    <div className="text-xs text-gray-500">Pulang: {formatDate(row.return_date)}</div>
                </div>
            )
        },
        { 
            key: 'package_name', 
            label: 'Paket',
            render: (val, row) => (
                <div>
                    <span className="font-medium text-blue-700">{val || 'Umum'}</span>
                    {row.departure_type === 'private' && (
                        <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded border border-purple-200 uppercase tracking-wider">Private</span>
                    )}
                </div>
            )
        },
        { 
            key: 'quota', 
            label: 'Seat', 
            render: (val, row) => {
                const filled = row.filled_seats || 0;
                const percent = val > 0 ? Math.min(100, Math.round((filled / val) * 100)) : 0;
                let color = 'bg-green-500';
                if (percent > 80) color = 'bg-yellow-500';
                if (percent >= 100) color = 'bg-red-500';

                return (
                    <div className="w-28">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium">{filled} / {val}</span>
                            <span className="text-gray-500">{percent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                        </div>
                    </div>
                )
            } 
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const map = {
                    open: { color: 'bg-green-100 text-green-800', label: 'Open' },
                    closed: { color: 'bg-red-100 text-red-800', label: 'Full' },
                    departed: { color: 'bg-blue-100 text-blue-800', label: 'Berangkat' },
                    completed: { color: 'bg-gray-100 text-gray-800', label: 'Selesai' },
                    cancelled: { color: 'bg-gray-800 text-white', label: 'Batal' }
                };
                const style = map[val] || { color: 'bg-gray-100 text-gray-800', label: val };
                return <span className={`px-2 py-1 rounded text-xs font-medium ${style.color}`}>{style.label}</span>
            }
        }
    ];

    // 4. Form Fields dengan SAFETY CHECK pada .map()
    const formFields = [
        { section: 'Informasi Dasar' },
        { 
            name: 'package_id', 
            label: 'Pilih Paket', 
            type: 'select', 
            // SAFETY CHECK: (array || []).map(...)
            options: (masters.packages || []).map(p => ({ value: p.id, label: p.name })),
            required: true, 
            width: 'full' 
        },
        { 
            name: 'departure_type', 
            label: 'Tipe', 
            type: 'select', 
            options: [{ value: 'regular', label: 'Reguler' }, { value: 'private', label: 'Private Group' }],
            defaultValue: 'regular',
            width: 'half' 
        },
        { name: 'quota', label: 'Total Kursi', type: 'number', required: true, defaultValue: 45, width: 'half' },

        { section: 'Jadwal & Penerbangan' },
        { name: 'departure_date', label: 'Tgl Berangkat', type: 'date', required: true, width: 'half' },
        { name: 'return_date', label: 'Tgl Pulang', type: 'date', required: true, width: 'half' },
        { 
            name: 'airline_id', 
            label: 'Maskapai', 
            type: 'select', 
            options: (masters.airlines || []).map(a => ({ value: a.id, label: `${a.name} (${a.code})` })),
            width: 'full' 
        },
        { name: 'flight_number_depart', label: 'No. Flight Pergi', type: 'text', width: 'half' },
        { name: 'flight_number_return', label: 'No. Flight Pulang', type: 'text', width: 'half' },

        { section: 'Petugas & Status' },
        { 
            name: 'mutawwif_id', 
            label: 'Mutawwif', 
            type: 'select', 
            options: [{value: '', label: '- Pilih -'}, ...(masters.mutawwifs || []).map(m => ({ value: m.id, label: m.name }))],
            width: 'half'
        },
        { 
            name: 'status', 
            label: 'Status', 
            type: 'select', 
            options: [
                {value: 'open', label: 'Open (Buka)'}, 
                {value: 'closed', label: 'Closed (Tutup)'},
                {value: 'departed', label: 'Berangkat'},
                {value: 'completed', label: 'Selesai'},
                {value: 'cancelled', label: 'Dibatalkan'}
            ], 
            defaultValue: 'open',
            width: 'half'
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Jadwal Keberangkatan"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchDepartures}
                formFields={formFields}
                searchPlaceholder="Cari jadwal..."
                onCreate={() => console.log('Create')}
                onEdit={(row) => console.log('Edit', row)}
                onDelete={(row) => console.log('Delete', row)}
            />
        </div>
    );
};

export default Departures;