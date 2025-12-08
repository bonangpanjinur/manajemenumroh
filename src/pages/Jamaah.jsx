import React from 'react';
import CrudTable from '../components/CrudTable';

const Jamaah = () => {
  const columns = [
    { 
      key: 'full_name', 
      label: 'Nama Jamaah',
      render: (val, row) => (
        <div>
          <div className="font-bold text-gray-800">{val}</div>
          <div className="text-xs text-gray-500">{row.nik || 'No NIK -'}</div>
        </div>
      )
    },
    { 
      key: 'gender', 
      label: 'JK', 
      render: (val) => val === 'L' ? <span className="bg-blue-100 text-blue-800 px-2 rounded text-xs">Laki-laki</span> : <span className="bg-pink-100 text-pink-800 px-2 rounded text-xs">Perempuan</span> 
    },
    { key: 'phone', label: 'No. HP', render: (val) => val ? val : '-' },
    { key: 'passport_number', label: 'No. Paspor', render: (val) => val ? <span className="font-mono text-purple-700">{val}</span> : <span className="text-red-400 text-xs">Belum Ada</span> },
    { key: 'city', label: 'Kota Domisili' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => val === 'berangkat' ? <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">BERANGKAT</span> : <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{val.toUpperCase()}</span>
    }
  ];

  const formFields = [
    { section: 'Identitas Pribadi' },
    { name: 'full_name', label: 'Nama Lengkap (Sesuai KTP)', type: 'text', required: true, width: 'half' },
    { name: 'full_name_ar', label: 'Nama dalam Bahasa Arab', type: 'text', width: 'half' },
    { name: 'nik', label: 'Nomor Induk Kependudukan (NIK)', type: 'text', required: true, width: 'half' },
    { name: 'gender', label: 'Jenis Kelamin', type: 'select', options: [{value: 'L', label: 'Laki-laki'}, {value: 'P', label: 'Perempuan'}], required: true, width: 'quarter' },
    { name: 'clothing_size', label: 'Ukuran Baju (Batik/Seragam)', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'].map(s => ({value:s, label:s})), width: 'quarter' },
    
    { section: 'Kontak & Alamat' },
    { name: 'phone', label: 'No. WhatsApp Aktif', type: 'tel', required: true, width: 'half' },
    { name: 'email', label: 'Alamat Email', type: 'email', width: 'half' },
    { name: 'city', label: 'Kota Domisili', type: 'text', width: 'half' },
    { name: 'address', label: 'Alamat Lengkap', type: 'textarea', width: 'half' },

    { section: 'Dokumen Perjalanan (Paspor)' },
    { name: 'passport_number', label: 'Nomor Paspor', type: 'text', width: 'third' },
    { name: 'scan_passport', label: 'URL Scan Paspor', type: 'url', width: 'third', placeholder: 'https://...' },
    { name: 'scan_photo', label: 'URL Pasfoto 4x6', type: 'url', width: 'third', placeholder: 'https://...' },

    { section: 'Data Keluarga & Kesehatan' },
    { name: 'father_name', label: 'Nama Ayah Kandung', type: 'text', width: 'half' },
    { name: 'spouse_name', label: 'Nama Pasangan (Suami/Istri)', type: 'text', width: 'half' },
    { name: 'disease_history', label: 'Riwayat Penyakit (Penting)', type: 'textarea', placeholder: 'Jantung, Diabetes, Asma, dll. Tulis (-) jika sehat.', width: 'full' },
  ];

  return (
    <CrudTable
      title="Database Jamaah"
      endpoint="/jamaah"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari nama, NIK, atau paspor..."
    />
  );
};

export default Jamaah;