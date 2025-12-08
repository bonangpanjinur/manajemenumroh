import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatDate } from '../utils/formatters';

const Departures = () => {
  const [mutawwifs, setMutawwifs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [airlines, setAirlines] = useState([]);

  // Fetch Data Master untuk Dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        const mData = await api.get('/mutawwif?status=active');
        const pData = await api.get('/packages'); 
        const aData = await api.get('/masters?type=airlines'); // Asumsi endpoint master airlines
        
        if (mData && Array.isArray(mData)) setMutawwifs(mData);
        if (pData && Array.isArray(pData)) setPackages(pData);
        if (aData && Array.isArray(aData)) setAirlines(aData);
      } catch (e) {
        console.error("Failed to fetch masters for departures", e);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { 
        key: 'departure_date', 
        label: 'Tgl Berangkat', 
        render: (val, row) => (
            <div>
                <div className="font-bold">{formatDate(val)}</div>
                <div className="text-xs text-gray-500">Pulang: {formatDate(row.return_date)}</div>
            </div>
        )
    },
    { 
        key: 'package_name', 
        label: 'Paket',
        render: (val, row) => (
            <div>
                <span className="font-semibold">{val || 'Paket Umum'}</span>
                {row.departure_type === 'private' && (
                    <span className="ml-2 px-1 py-0.5 bg-purple-100 text-purple-800 text-[10px] rounded border border-purple-200">PRIVATE</span>
                )}
            </div>
        )
    },
    { 
        key: 'quota', 
        label: 'Seat', 
        render: (val, row) => {
            const filled = row.filled_seats || 0;
            const percent = Math.min(100, Math.round((filled / val) * 100));
            let color = 'bg-green-500';
            if (percent > 80) color = 'bg-yellow-500';
            if (percent >= 100) color = 'bg-red-500';

            return (
                <div className="w-24">
                    <div className="flex justify-between text-xs mb-1">
                        <span>{filled}/{val}</span>
                        <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                </div>
            )
        } 
    },
    { 
        key: 'mutawwif_name', 
        label: 'Petugas',
        render: (val, row) => (
            <div className="text-xs">
                <div>TL: {row.tour_leader_name || '-'}</div>
                <div>Mutawwif: {val || '-'}</div>
            </div>
        )
    },
    { 
        key: 'status', 
        label: 'Status',
        render: (val) => {
            const colors = {
                open: 'bg-green-100 text-green-800',
                closed: 'bg-red-100 text-red-800',
                departed: 'bg-blue-100 text-blue-800',
                completed: 'bg-gray-100 text-gray-800',
                cancelled: 'bg-gray-800 text-white'
            };
            return <span className={`px-2 py-1 rounded text-xs ${colors[val]}`}>{val.toUpperCase()}</span>
        }
    },
  ];

  const formFields = [
    { section: 'Informasi Dasar' },
    { 
      name: 'package_id', 
      label: 'Pilih Paket Utama', 
      type: 'select', 
      options: packages.map(p => ({ value: p.id, label: p.name })),
      required: true, 
      width: 'full' 
    },
    { 
      name: 'departure_type', 
      label: 'Tipe Keberangkatan', 
      type: 'select', 
      options: [{ value: 'regular', label: 'Reguler (Open Seat)' }, { value: 'private', label: 'Private Group' }],
      defaultValue: 'regular',
      width: 'half' 
    },
    { name: 'linked_private_request_id', label: 'ID Request Private (Jika Tipe Private)', type: 'number', width: 'half' },

    { section: 'Waktu & Penerbangan' },
    { name: 'departure_date', label: 'Tgl Berangkat', type: 'date', required: true, width: 'half' },
    { name: 'return_date', label: 'Tgl Pulang', type: 'date', required: true, width: 'half' },
    { 
        name: 'airline_id', 
        label: 'Maskapai', 
        type: 'select', 
        options: airlines.map(a => ({ value: a.id, label: `${a.name} (${a.code})` })),
        width: 'third' 
    },
    { name: 'flight_number_depart', label: 'No. Flight Pergi', type: 'text', width: 'third' },
    { name: 'flight_number_return', label: 'No. Flight Pulang', type: 'text', width: 'third' },

    { section: 'Kuota & Harga Spesifik' },
    { name: 'quota', label: 'Total Seat (Kuota)', type: 'number', defaultValue: 45, required: true, width: 'quarter' },
    { name: 'price_override', label: 'Harga Override (Opsional)', type: 'number', placeholder: 'Isi jika beda dgn paket', width: 'quarter' },
    { name: 'price_quad', label: 'Harga Quad', type: 'number', width: 'quarter' },
    { name: 'price_double', label: 'Harga Double', type: 'number', width: 'quarter' },
    
    { section: 'Petugas Lapangan' },
    { name: 'tour_leader_name', label: 'Tour Leader', type: 'text', width: 'half' },
    { name: 'tour_leader_id', label: 'ID TL (Opsional)', type: 'number', width: 'half' }, // Nanti bisa relasi ke karyawan
    { 
      name: 'mutawwif_id', 
      label: 'Assign Mutawwif', 
      type: 'select', 
      options: [{value: '', label: '- Belum Ditentukan -'}, ...mutawwifs.map(m => ({ value: m.id, label: m.name }))],
      width: 'full'
    },
    
    { section: 'Status' },
    { 
        name: 'status', 
        label: 'Status Jadwal', 
        type: 'select', 
        options: [
            {value: 'open', label: 'Open (Buka Pendaftaran)'}, 
            {value: 'closed', label: 'Closed (Penuh/Tutup)'},
            {value: 'departed', label: 'Departed (Sedang Berjalan)'},
            {value: 'completed', label: 'Completed (Selesai)'},
            {value: 'cancelled', label: 'Cancelled'}
        ], 
        width: 'full',
        defaultValue: 'open'
    },
    { name: 'notes', label: 'Catatan Internal', type: 'textarea', width: 'full' },
  ];

  return (
    <CrudTable
      title="Manajemen Jadwal Keberangkatan"
      endpoint="/departures"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari jadwal, tanggal, atau paket..."
    />
  );
};

export default Departures;