import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';

const PrivateUmrah = () => {
  const [options, setOptions] = useState({
    hotels_makkah: [],
    hotels_madinah: [],
    airlines: [],
    vehicle_types: ['Bus', 'HiAce', 'GMC', 'Private Car'],
    meal_types: ['Fullboard', 'Catering', 'Breakfast Only', 'None']
  });

  // Fetch Options dari API saat komponen dimuat
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get('/private/options');
        if (response) {
          setOptions(response);
        }
      } catch (error) {
        console.error("Gagal mengambil opsi master:", error);
      }
    };
    fetchOptions();
  }, []);

  const columns = [
    { key: 'contact_name', label: 'Nama Kontak' },
    { key: 'pax_count', label: 'Jumlah Pax' },
    { key: 'travel_date_start', label: 'Rencana Tgl' },
    { key: 'duration_days', label: 'Durasi (Hari)' },
    { key: 'vehicle_type', label: 'Kendaraan' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => {
        const colors = {
          new: 'bg-blue-100 text-blue-800',
          quoted: 'bg-yellow-100 text-yellow-800',
          accepted: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-1 rounded text-xs ${colors[val] || 'bg-gray-100'}`}>{val.toUpperCase()}</span>;
      }
    }
  ];

  const formFields = [
    { section: 'Informasi Kontak' },
    { name: 'contact_name', label: 'Nama Kontak', type: 'text', required: true, width: 'half' },
    { name: 'contact_phone', label: 'No. WhatsApp', type: 'tel', required: true, width: 'half' },
    
    { section: 'Detail Perjalanan' },
    { name: 'pax_count', label: 'Jumlah Jamaah', type: 'number', required: true, width: 'third' },
    { name: 'travel_date_start', label: 'Tgl Keberangkatan', type: 'date', required: true, width: 'third' },
    { name: 'duration_days', label: 'Durasi (Hari)', type: 'number', defaultValue: 9, width: 'third' },
    
    { section: 'Preferensi Hotel & Maskapai (Klik Pilih)' },
    { 
      name: 'hotel_makkah_pref_id', 
      label: 'Pilih Hotel Makkah', 
      type: 'select', 
      options: options.hotels_makkah.map(h => ({ value: h.id, label: `${h.name} (${h.rating}★)` })),
      width: 'half'
    },
    { 
      name: 'hotel_madinah_pref_id', 
      label: 'Pilih Hotel Madinah', 
      type: 'select', 
      options: options.hotels_madinah.map(h => ({ value: h.id, label: `${h.name} (${h.rating}★)` })),
      width: 'half'
    },
    { 
      name: 'airline_pref_id', 
      label: 'Pilih Maskapai', 
      type: 'select', 
      options: options.airlines.map(a => ({ value: a.id, label: `${a.name} (${a.code})` })),
      width: 'full'
    },

    { section: 'Fasilitas Lainnya' },
    { 
      name: 'vehicle_type', 
      label: 'Jenis Kendaraan', 
      type: 'select', 
      options: options.vehicle_types.map(v => ({ value: v, label: v })),
      width: 'half'
    },
    { 
      name: 'meal_type', 
      label: 'Jenis Makanan', 
      type: 'select', 
      options: options.meal_types.map(m => ({ value: m, label: m })),
      width: 'half'
    },
    { name: 'additional_notes', label: 'Catatan Tambahan', type: 'textarea', width: 'full' },
  ];

  return (
    <CrudTable
      title="Request Private Umrah"
      endpoint="/private/requests"
      createEndpoint="/private/request" // Endpoint khusus untuk create
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari request..."
    />
  );
};

export default PrivateUmrah;