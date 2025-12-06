import React, { useState } from 'react';
import useCRUD from '../hooks/useCRUD'; // HAPUS kurung kurawal {}
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import { Calendar, DollarSign, Briefcase } from 'lucide-react';
import Alert from '../components/Alert';

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const columns = [
    { header: 'Nama Paket', accessor: 'name' },
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
          <p className="text-sm text-gray-500">Kelola katalog paket perjalanan</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
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
        searchPlaceholder="Cari nama paket..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Paket Umroh" : "Buat Paket Baru"}
        size="xl" 
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Info Dasar
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Misal: Paket Hemat Syawal"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Durasi (Hari)</label>
                    <div className="relative mt-1">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                         </div>
                        <input
                            type="number"
                            required
                            className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={formData.duration_days}
                            onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                        />
                    </div>
                </div>
             </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Harga Per Kamar
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Quad (Sekamar Ber-4)</label>
                    <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.price_quad}
                        onChange={(e) => setFormData({ ...formData, price_quad: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Triple (Sekamar Ber-3)</label>
                    <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.price_triple}
                        onChange={(e) => setFormData({ ...formData, price_triple: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Double (Sekamar Ber-2)</label>
                    <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.price_double}
                        onChange={(e) => setFormData({ ...formData, price_double: e.target.value })}
                    />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Hotel Makkah</label>
                <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formData.hotel_makkah}
                    onChange={(e) => setFormData({ ...formData, hotel_makkah: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Hotel Madinah</label>
                <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formData.hotel_madinah}
                    onChange={(e) => setFormData({ ...formData, hotel_madinah: e.target.value })}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi / Fasilitas</label>
            <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tulis detail fasilitas di sini..."
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Status Publikasi</label>
             <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
             >
                <option value="active">Aktif (Tampil di Katalog)</option>
                <option value="draft">Draft (Sembunyikan)</option>
             </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
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