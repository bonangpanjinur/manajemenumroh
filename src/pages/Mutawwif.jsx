import React from 'react';
import CrudTable from '../components/CrudTable';

const Mutawwif = () => {
  const columns = [
    { key: 'name', label: 'Nama Lengkap' },
    { key: 'phone', label: 'No. HP/WA' },
    { 
      key: 'base_location', 
      label: 'Lokasi Basis',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs ${val === 'Makkah' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {val}
        </span>
      )
    },
    { key: 'languages', label: 'Bahasa' },
    { key: 'specialization', label: 'Spesialisasi' },
    { key: 'rating', label: 'Rating', render: (val) => val ? `⭐ ${val}` : '-' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs ${val === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val.toUpperCase()}
        </span>
      )
    },
  ];

  const formFields = [
    { name: 'name', label: 'Nama Mutawwif', type: 'text', required: true, width: 'full' },
    { name: 'phone', label: 'No. WhatsApp', type: 'tel', required: true, width: 'half' },
    { name: 'email', label: 'Email', type: 'email', width: 'half' },
    { 
      name: 'base_location', 
      label: 'Lokasi Basis', 
      type: 'select', 
      options: [
        { value: 'Indonesia', label: 'Indonesia' },
        { value: 'Makkah', label: 'Makkah' },
        { value: 'Madinah', label: 'Madinah' }
      ],
      required: true,
      width: 'half'
    },
    { name: 'experience_years', label: 'Pengalaman (Tahun)', type: 'number', width: 'half' },
    { name: 'languages', label: 'Bahasa (Pisahkan koma)', type: 'text', placeholder: 'Indonesia, Arab, Inggris', width: 'full' },
    { name: 'specialization', label: 'Spesialisasi', type: 'text', placeholder: 'Sejarah, Lansia, VVIP', width: 'full' },
    { name: 'license_number', label: 'Nomor Sertifikat/Lisensi', type: 'text', width: 'full' },
    { name: 'photo_url', label: 'URL Foto Profil', type: 'url', width: 'full' },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      options: [
        { value: 'active', label: 'Aktif' },
        { value: 'inactive', label: 'Tidak Aktif' },
        { value: 'suspended', label: 'Suspend' }
      ],
      width: 'full'
    }
  ];

  return (
    <CrudTable
      title="Manajemen Mutawwif"
      endpoint="/mutawwif"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari Mutawwif..."
    />
  );
};

export default Mutawwif;