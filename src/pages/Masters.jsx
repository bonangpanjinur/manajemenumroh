import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';

// Komponen Tab Sederhana
const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
    {['locations', 'airlines', 'hotels', 'banks'].map((tab) => (
      <button
        key={tab}
        className={`px-6 py-3 font-medium text-sm capitalize whitespace-nowrap focus:outline-none ${
          activeTab === tab 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab(tab)}
      >
        {tab === 'banks' ? 'Rekening Bank' : `Master ${tab}`}
      </button>
    ))}
  </div>
);

const Masters = () => {
  const [activeTab, setActiveTab] = useState('locations');

  // Konfigurasi per Tab
  const configs = {
    locations: {
      title: 'Data Lokasi (Kota/Bandara)',
      endpoint: '/masters?type=locations',
      createEndpoint: '/masters', 
      columns: [
        { key: 'name', label: 'Nama Lokasi' },
        { key: 'code', label: 'Kode (IATA/City)' },
        { key: 'type', label: 'Tipe', render: (val) => val === 'airport' ? '✈️ Bandara' : '🏙️ Kota' },
        { key: 'country', label: 'Negara' }
      ],
      formFields: [
        { name: 'type_submit', label: 'Hidden Type', type: 'hidden', defaultValue: 'locations' }, // Penanda buat API
        { name: 'name', label: 'Nama Lokasi', type: 'text', required: true, width: 'full' },
        { name: 'code', label: 'Kode (3 Huruf)', type: 'text', width: 'half' },
        { name: 'type', label: 'Tipe', type: 'select', options: [{value: 'city', label: 'Kota'}, {value: 'airport', label: 'Bandara'}], width: 'half' },
        { name: 'country', label: 'Negara', type: 'text', defaultValue: 'Saudi Arabia', width: 'full' }
      ]
    },
    airlines: {
      title: 'Data Maskapai Penerbangan',
      endpoint: '/masters?type=airlines',
      columns: [
        { key: 'name', label: 'Nama Maskapai' },
        { key: 'code', label: 'Kode' },
        { key: 'origin', label: 'Hub Asal' },
        { key: 'type', label: 'Jenis' }
      ],
      formFields: [
        { name: 'type_submit', label: 'Hidden Type', type: 'hidden', defaultValue: 'airlines' },
        { name: 'name', label: 'Nama Maskapai', type: 'text', required: true, width: 'full' },
        { name: 'code', label: 'Kode Maskapai', type: 'text', width: 'half' },
        { name: 'type', label: 'Jenis', type: 'select', options: [{value: 'International', label: 'International'}, {value: 'Domestic', label: 'Domestic'}], width: 'half' },
        { name: 'origin', label: 'Hub Asal (Ex: CGK)', type: 'text', width: 'half' },
        { name: 'logo_url', label: 'URL Logo', type: 'url', width: 'full' }
      ]
    },
    hotels: {
      title: 'Data Hotel (Makkah & Madinah)',
      endpoint: '/masters?type=hotels',
      columns: [
        { key: 'name', label: 'Nama Hotel' },
        { key: 'city', label: 'Kota', render: (val) => val === 'Makkah' ? '🕋 Makkah' : '🕌 Madinah' },
        { key: 'rating', label: 'Bintang', render: (val) => '⭐'.repeat(val) },
        { key: 'distance_to_haram', label: 'Jarak', render: (val) => `${val} m` }
      ],
      formFields: [
        { name: 'type_submit', label: 'Hidden Type', type: 'hidden', defaultValue: 'hotels' },
        { name: 'name', label: 'Nama Hotel', type: 'text', required: true, width: 'full' },
        { name: 'city', label: 'Kota', type: 'select', options: [{value: 'Makkah', label: 'Makkah'}, {value: 'Madinah', label: 'Madinah'}], required: true, width: 'half' },
        { name: 'rating', label: 'Bintang', type: 'select', options: ['3', '4', '5'].map(v => ({value: v, label: `${v} Bintang`})), width: 'half' },
        { name: 'distance_to_haram', label: 'Jarak ke Haram (meter)', type: 'number', width: 'half' },
        { name: 'map_url', label: 'Link Google Maps', type: 'url', width: 'full' }
      ]
    },
    banks: {
      title: 'Rekening Bank Perusahaan',
      endpoint: '/utils/banks', 
      columns: [
        { key: 'bank_name', label: 'Bank' },
        { key: 'account_number', label: 'No. Rekening' },
        { key: 'account_holder', label: 'Atas Nama' },
        { key: 'is_primary', label: 'Utama', render: (val) => val == 1 ? '✅' : '-' }
      ],
      formFields: [
        { name: 'bank_name', label: 'Nama Bank', type: 'text', required: true, width: 'half' },
        { name: 'account_number', label: 'No. Rekening', type: 'text', required: true, width: 'half' },
        { name: 'account_holder', label: 'Atas Nama', type: 'text', required: true, width: 'full' },
        { name: 'is_primary', label: 'Rekening Utama?', type: 'select', options: [{value: '1', label: 'Ya'}, {value: '0', label: 'Tidak'}], width: 'full' }
      ]
    }
  };

  const currentConfig = configs[activeTab];

  return (
    <div className="p-4">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <CrudTable
        key={activeTab} // Force re-render saat tab ganti
        title={currentConfig.title}
        endpoint={currentConfig.endpoint}
        createEndpoint={currentConfig.createEndpoint || currentConfig.endpoint} 
        columns={currentConfig.columns}
        formFields={currentConfig.formFields}
        searchPlaceholder={`Cari ${activeTab}...`}
      />
    </div>
  );
};

export default Masters;