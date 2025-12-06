import React, { useState } from 'react';
import useCRUD from '../hooks/useCRUD'; // HAPUS kurung kurawal {}
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import { Package, Box, Tag, AlertCircle } from 'lucide-react';
import Alert from '../components/Alert';

const Logistics = () => {
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
  } = useCRUD('logistics');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'perlengkapan',
    stock_quantity: 0,
    unit: 'pcs',
    min_stock_alert: 10,
    status: 'available'
  });
  const [editingId, setEditingId] = useState(null);

  const columns = [
    { header: 'Nama Barang', accessor: 'item_name' },
    { header: 'Kategori', accessor: (item) => (
       <span className="capitalize">{item.category}</span>
    )},
    { header: 'Stok', accessor: (item) => (
      <div className="font-semibold">
        {item.stock_quantity} {item.unit}
      </div>
    )},
    { header: 'Status Stok', accessor: (item) => {
        const isLow = parseInt(item.stock_quantity) <= parseInt(item.min_stock_alert);
        return isLow ? (
            <span className="text-red-600 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3"/> Stok Menipis
            </span>
        ) : (
            <span className="text-green-600 text-xs">Aman</span>
        );
    }},
    { header: 'Status', accessor: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
            item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
            {item.status}
        </span>
    )}
  ];

  const handleAdd = () => {
    setFormData({
        item_name: '',
        category: 'perlengkapan',
        stock_quantity: 0,
        unit: 'pcs',
        min_stock_alert: 10,
        status: 'available'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setFormData({
        item_name: item.item_name,
        category: item.category,
        stock_quantity: item.stock_quantity,
        unit: item.unit,
        min_stock_alert: item.min_stock_alert,
        status: item.status
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Logistik</h1>
          <p className="text-sm text-gray-500">Stok koper, kain ihram, dan perlengkapan jamaah</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Package className="w-4 h-4" />
          Tambah Barang
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
        searchPlaceholder="Cari barang..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Barang Logistik" : "Tambah Barang Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Barang</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Box className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    required
                    className="pl-10 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="Contoh: Koper 24 Inch"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                        className="pl-10 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2 bg-white"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="perlengkapan">Perlengkapan</option>
                        <option value="souvenir">Souvenir</option>
                        <option value="dokumen">Dokumen</option>
                        <option value="atribut">Atribut Seragam</option>
                    </select>
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700">Satuan</label>
                <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Pcs, Box, Lusin"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Jumlah Stok</label>
                <input
                    type="number"
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700">Peringatan Stok Minim</label>
                <input
                    type="number"
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                    value={formData.min_stock_alert}
                    onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2 bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
                <option value="available">Tersedia</option>
                <option value="out_of_stock">Habis</option>
                <option value="discontinued">Tidak Dipakai Lagi</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
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
              {editingId ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Logistics;