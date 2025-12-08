import React from 'react';
import CrudTable from '../components/CrudTable';
import { formatDate } from '../utils/formatters';

const Manasik = () => {
  const columns = [
    { key: 'title', label: 'Nama Kegiatan' },
    { 
      key: 'event_date', 
      label: 'Tanggal & Waktu',
      render: (val) => <span className="font-semibold">{formatDate(val, true)}</span> // true = with time
    },
    { key: 'location_name', label: 'Lokasi' },
    { key: 'ustadz_name', label: 'Pemateri (Ustadz)' },
    { 
      key: 'id', 
      label: 'Aksi', 
      render: (val) => <button className="text-blue-600 text-xs hover:underline" onClick={() => alert('Fitur Absensi QR akan dibuka di popup')}>Lihat Absensi</button>
    }
  ];

  const formFields = [
    { name: 'title', label: 'Nama Kegiatan Manasik', type: 'text', required: true, width: 'full' },
    { name: 'event_date', label: 'Tanggal & Jam', type: 'datetime-local', required: true, width: 'half' },
    { name: 'location_name', label: 'Lokasi / Hotel', type: 'text', width: 'half' },
    { name: 'ustadz_name', label: 'Nama Pemateri', type: 'text', width: 'half' },
    { name: 'location_map_url', label: 'Link Google Maps', type: 'url', width: 'half' },
    { name: 'notes', label: 'Catatan / Perlengkapan', type: 'textarea', width: 'full' },
  ];

  return (
    <CrudTable
      title="Jadwal Manasik Umrah"
      endpoint="/manasik"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari jadwal..."
    />
  );
};

export default Manasik;