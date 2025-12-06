import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import { Calendar, DollarSign, Briefcase, Tag, Hotel, AlignLeft, CheckCircle } from 'lucide-react';
import Alert from '../components/Alert';
import api from '../utils/api'; // PERBAIKAN: Hapus kurung kurawal { }

const Packages = () => {
  const {
    items,
    loading,
    error,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    handlePageChange,
    handleSearch
  } = useCRUD('packages');

  // State untuk Data Master (Relasi)
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]); // State untuk menyimpan semua data hotel
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    duration_days: 9,
    price_quad: 0,
    price_triple: 0,
    price_double: 0,
    hotel_makkah: '',
    hotel_madinah: '',
    description: '',
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);

  // Ambil data Kategori & Hotel saat halaman dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Kategori
        const catRes = await api.get('/package-categories'); 
        const catData = Array.isArray(catRes) ? catRes : (catRes.data || []);
        setCategories(catData);

        // 2. Fetch Master Hotel
        // Pastikan endpoint '/masters' mendukung parameter type=hotel di backend PHP Anda
        const hotelRes = await api.get('/masters?type=hotel');
        const hotelData = Array.isArray(hotelRes) ? hotelRes : (hotelRes.data || []);
        setHotels(hotelData);

      } catch (err) {
        console.error("Gagal mengambil data master:", err);
      }
    };

    fetchData();
  }, []);

  // Filter Hotel berdasarkan Kota untuk Dropdown
  const makkahHotels = hotels.filter(h => 
    h.city?.toLowerCase().includes('makkah') || h.city?.toLowerCase().includes('mecca')
  );
  
  const madinahHotels = hotels.filter(h => 
    h.city?.toLowerCase().includes('madinah') || h.city?.toLowerCase().includes('medina')
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => String(c.id) === String(catId));
    return cat ? cat.name : '-';
  };

  const columns = [
    { header: 'Nama Paket', accessor: 'name' },
    { 
        header: 'Kategori', 
        accessor: (item) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.category_name || getCategoryName(item.category_id)}
            </span>
        ) 
    },
    { header: 'Durasi', accessor: (item) => `${item.duration_days} Hari` },
    { header: 'Harga (Quad)', accessor: (item) => formatCurrency(item.price_quad) },
    { header: 'Hotel Makkah', accessor: 'hotel_makkah' },
    { header: 'Status', accessor: (item) => (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {item.status === 'active' ? 'Aktif' : 'Draft'}
      </span>
    )}
  ];

  const handleAdd = () => {
    setFormData({
      name: '',
      category_id: '',
      duration_days: 9,
      price_quad: 0,
      price_triple: 0,
      price_double: 0,
      hotel_makkah: '',
      hotel_madinah: '',
      description: '',
      status: 'active'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateItem(editingId, formData);
      } else {
        await createItem(formData);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Paket Umroh</h1>
          <p className="text-sm text-gray-500">Kelola katalog dan harga paket perjalanan</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Briefcase className="w-4 h-4" />
          Buat Paket Baru
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      <CrudTable
        columns={columns}
        data={items}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteItem}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder="Cari paket berdasarkan nama..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Paket Umroh" : "Buat Paket Baru"}
        size="xl" 
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* GROUP 1: Informasi Utama */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
             <h4 className="text-sm font-bold text-indigo-600 mb-4 flex items-center gap-2 border-b pb-2">
                <Briefcase className="w-4 h-4" /> Informasi Utama
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Paket */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Paket Umroh Awal Ramadhan 2024"
                    />
                </div>

                {/* Kategori (Relasi) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori Paket</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            required
                            className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        >
                            <option value="">Pilih Kategori...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Durasi */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Durasi Perjalanan</label>
                    <div className="relative mt-1">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                         </div>
                        <input
                            type="number"
                            required
                            min="1"
                            className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={formData.duration_days}
                            onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                            placeholder="9"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Hari</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* GROUP 2: Harga */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <h4 className="text-sm font-bold text-green-600 mb-4 flex items-center gap-2 border-b pb-2">
                <DollarSign className="w-4 h-4" /> Daftar Harga (Per Pax)
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Quad (Sekamar 4)</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Rp</span>
                        </div>
                        <input
                            type="number"
                            className="pl-10 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                            value={formData.price_quad}
                            onChange={(e) => setFormData({ ...formData, price_quad: e.target.value })}
                            placeholder="0"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Triple (Sekamar 3)</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Rp</span>
                        </div>
                        <input
                            type="number"
                            className="pl-10 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                            value={formData.price_triple}
                            onChange={(e) => setFormData({ ...formData, price_triple: e.target.value })}
                            placeholder="0"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Double (Sekamar 2)</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Rp</span>
                        </div>
                        <input
                            type="number"
                            className="pl-10 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                            value={formData.price_double}
                            onChange={(e) => setFormData({ ...formData, price_double: e.target.value })}
                            placeholder="0"
                        />
                    </div>
                </div>
             </div>
          </div>

          {/* GROUP 3: Akomodasi & Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-orange-500" /> Akomodasi
                </h4>
                <div className="space-y-3">
                    {/* Hotel Makkah */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hotel Makkah</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                            value={formData.hotel_makkah}
                            onChange={(e) => setFormData({ ...formData, hotel_makkah: e.target.value })}
                        >
                            <option value="">-- Pilih Hotel Makkah --</option>
                            {makkahHotels.length > 0 ? (
                                makkahHotels.map((h, idx) => (
                                    <option key={h.id || idx} value={h.name}>
                                        {h.name} {h.rating ? `(${h.rating}*)` : ''}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Data hotel Makkah tidak ditemukan</option>
                            )}
                        </select>
                        {makkahHotels.length === 0 && (
                            <input 
                                type="text" 
                                className="mt-2 block w-full text-xs border-gray-200 rounded p-1"
                                placeholder="Atau ketik manual nama hotel..."
                                value={formData.hotel_makkah}
                                onChange={(e) => setFormData({ ...formData, hotel_makkah: e.target.value })}
                            />
                        )}
                    </div>

                    {/* Hotel Madinah */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hotel Madinah</label>
                         <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                            value={formData.hotel_madinah}
                            onChange={(e) => setFormData({ ...formData, hotel_madinah: e.target.value })}
                        >
                            <option value="">-- Pilih Hotel Madinah --</option>
                            {madinahHotels.length > 0 ? (
                                madinahHotels.map((h, idx) => (
                                    <option key={h.id || idx} value={h.name}>
                                        {h.name} {h.rating ? `(${h.rating}*)` : ''}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Data hotel Madinah tidak ditemukan</option>
                            )}
                        </select>
                         {madinahHotels.length === 0 && (
                            <input 
                                type="text" 
                                className="mt-2 block w-full text-xs border-gray-200 rounded p-1"
                                placeholder="Atau ketik manual nama hotel..."
                                value={formData.hotel_madinah}
                                onChange={(e) => setFormData({ ...formData, hotel_madinah: e.target.value })}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-gray-500" /> Detail Lainnya
                </h4>
                <div className="space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Status Publikasi</label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CheckCircle className="h-4 w-4 text-gray-400" />
                            </div>
                            <select
                                className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Aktif (Tampil di Katalog)</option>
                                <option value="draft">Draft (Sembunyikan)</option>
                                <option value="archived">Arsip (Tidak Aktif)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi / Fasilitas</label>
                        <textarea
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tulis fasilitas termasuk/tidak termasuk..."
                        />
                    </div>
                </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingId ? 'Simpan Perubahan' : 'Buat Paket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Packages;