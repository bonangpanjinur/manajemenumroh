import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
  // Tambahkan state untuk data tabel
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [masters, setMasters] = useState({
    categories: [],
    airlines: [],
    hotels_makkah: [],
    hotels_madinah: []
  });

  // Fungsi untuk memuat data tabel (Paket)
  const fetchTableData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/packages');
      // Pastikan response selalu array agar tidak error .map()
      setTableData(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Gagal memuat data paket:", error);
      setTableData([]); // Fallback ke array kosong jika error
    } finally {
      setLoading(false);
    }
  };

  // Fetch Data Master & Data Tabel saat pertama kali load
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [cats, airs, hotels] = await Promise.all([
          api.get('/package-categories'),
          api.get('/masters?type=airlines'),
          api.get('/masters?type=hotels')
        ]);

        setMasters({
          // Defensive check: Pastikan selalu array
          categories: Array.isArray(cats) ? cats : [],
          airlines: Array.isArray(airs) ? airs : [],
          hotels_makkah: Array.isArray(hotels) ? hotels.filter(h => h.city === 'Makkah') : [],
          hotels_madinah: Array.isArray(hotels) ? hotels.filter(h => h.city === 'Madinah') : []
        });
      } catch (e) {
        console.error("Gagal memuat master data paket", e);
      }
    };

    fetchMasters();
    fetchTableData(); // Panggil fungsi fetch data tabel
  }, []);

  const columns = [
    { 
      key: 'name', 
      label: 'Nama Paket',
      render: (val, row) => (
        <div>
          <div className="font-bold text-gray-800">{val}</div>
          <div className="text-xs text-gray-500">{row.duration_days} Hari - {row.type ? row.type.toUpperCase() : '-'}</div>
        </div>
      )
    },
    { key: 'category_name', label: 'Kategori', render: (val) => <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{val || 'Umum'}</span> },
    { 
      key: 'base_price_quad', 
      label: 'Harga Mulai (Quad)', 
      render: (val) => <span className="font-semibold text-green-700">{formatCurrency(val)}</span>
    },
    { 
      key: 'hotel_makkah_name', 
      label: 'Hotel',
      render: (val, row) => (
        <div className="text-xs">
          <div>🕋 {val || '-'}</div>
          <div>🕌 {row.hotel_madinah_name || '-'}</div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => {
        const colors = { active: 'bg-green-100 text-green-800', draft: 'bg-gray-100 text-gray-800', archived: 'bg-red-100 text-red-800' };
        return <span className={`px-2 py-1 rounded text-xs ${colors[val] || 'bg-gray-100'}`}>{val ? val.toUpperCase() : '-'}</span>;
      }
    }
  ];

  const formFields = [
    { section: 'Informasi Dasar' },
    { name: 'name', label: 'Nama Paket', type: 'text', required: true, width: 'half' },
    { 
      name: 'type', 
      label: 'Tipe Layanan', 
      type: 'select', 
      options: [{value: 'umrah', label: 'Umrah'}, {value: 'haji', label: 'Haji'}, {value: 'tour', label: 'Halal Tour'}], 
      defaultValue: 'umrah',
      width: 'quarter'
    },
    { name: 'duration_days', label: 'Durasi (Hari)', type: 'number', defaultValue: 9, width: 'quarter' },
    { 
      name: 'category_id', 
      label: 'Kategori Paket', 
      type: 'select', 
      // PERBAIKAN: Guard mapping
      options: (masters.categories || []).map(c => ({ value: c.id, label: c.name })),
      width: 'full'
    },

    { section: 'Akomodasi & Transportasi' },
    { 
      name: 'airline_id', 
      label: 'Maskapai', 
      type: 'select', 
      options: (masters.airlines || []).map(a => ({ value: a.id, label: `${a.name} (${a.code})` })),
      width: 'third' 
    },
    { 
      name: 'hotel_makkah_id', 
      label: 'Hotel Makkah', 
      type: 'select', 
      options: (masters.hotels_makkah || []).map(h => ({ value: h.id, label: `${h.name} (${h.rating}★)` })),
      width: 'third' 
    },
    { 
      name: 'hotel_madinah_id', 
      label: 'Hotel Madinah', 
      type: 'select', 
      options: (masters.hotels_madinah || []).map(h => ({ value: h.id, label: `${h.name} (${h.rating}★)` })),
      width: 'third' 
    },

    { section: 'Harga Paket (Per Room Type)' },
    { name: 'currency', label: 'Mata Uang', type: 'select', options: [{value: 'IDR', label: 'IDR'}, {value: 'USD', label: 'USD'}], defaultValue: 'IDR', width: 'quarter' },
    { name: 'base_price_quad', label: 'Harga Quad (Sekamar 4)', type: 'number', required: true, width: 'quarter' },
    { name: 'base_price_triple', label: 'Harga Triple (Sekamar 3)', type: 'number', width: 'quarter' },
    { name: 'base_price_double', label: 'Harga Double (Sekamar 2)', type: 'number', width: 'quarter' },
    { name: 'down_payment_amount', label: 'Minimal DP', type: 'number', width: 'half' },

    { section: 'Detail & Fasilitas' },
    { name: 'description', label: 'Deskripsi Singkat', type: 'textarea', width: 'full' },
    { name: 'included_features', label: 'Termasuk (Include)', type: 'textarea', placeholder: 'Tiket PP, Visa, Makan 3x...', width: 'half' },
    { name: 'excluded_features', label: 'Tidak Termasuk (Exclude)', type: 'textarea', placeholder: 'Paspor, Vaksin, Keperluan Pribadi...', width: 'half' },
    { name: 'terms_conditions', label: 'Syarat & Ketentuan', type: 'textarea', width: 'full' },
    
    { section: 'Media & Status' },
    { name: 'image_url', label: 'URL Gambar Banner', type: 'url', width: 'half' },
    { name: 'brochure_pdf', label: 'URL E-Brochure (PDF)', type: 'url', width: 'half' },
    { 
      name: 'status', 
      label: 'Status Publikasi', 
      type: 'select', 
      options: [{value: 'active', label: 'Aktif (Tampil)'}, {value: 'draft', label: 'Draft'}, {value: 'archived', label: 'Arsip'}], 
      defaultValue: 'active',
      width: 'full' 
    },
  ];

  return (
    <CrudTable
      title="Katalog Paket Umrah & Haji"
      endpoint="/packages"
      data={tableData} // PERBAIKAN: Kirim data eksplisit ke CrudTable
      loading={loading} // PERBAIKAN: Kirim status loading
      onDataLoaded={fetchTableData} // Callback untuk refresh data setelah add/edit/delete (jika didukung CrudTable)
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari nama paket..."
    />
  );
};

export default Packages;