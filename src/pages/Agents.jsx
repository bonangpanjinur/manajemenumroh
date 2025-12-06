import React, { useState } from 'react';
import useCRUD from '../hooks/useCRUD'; // HAPUS kurung kurawal {}
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import AsyncCitySelect from '../components/AsyncCitySelect';
import { User, Phone, Mail, Award, AlertCircle } from 'lucide-react'; // Hapus MapPin jika tidak dipakai langsung
import Alert from '../components/Alert';

const Agents = () => {
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
  } = useCRUD('agents');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    level: 'bronze',
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  const columns = [
    { header: 'Nama Agen', accessor: 'name' },
    { header: 'Level', accessor: (item) => (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full 
        ${item.level === 'gold' ? 'bg-yellow-100 text-yellow-800' : 
          item.level === 'silver' ? 'bg-gray-100 text-gray-800' : 
          'bg-orange-100 text-orange-800'}`}>
        {item.level ? item.level.toUpperCase() : '-'}
      </span>
    )},
    { header: 'Kota Domisili', accessor: 'city' },
    { header: 'Kontak', accessor: (item) => (
      <div className="text-sm">
        <div>{item.phone}</div>
        <div className="text-gray-500 text-xs">{item.email}</div>
      </div>
    )},
    { header: 'Status', accessor: (item) => (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {item.status === 'active' ? 'Aktif' : 'Non-Aktif'}
      </span>
    )}
  ];

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      level: 'bronze',
      status: 'active'
    });
    setEditingId(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      email: item.email,
      phone: item.phone,
      city: item.city,
      level: item.level || 'bronze',
      status: item.status || 'active'
    });
    setEditingId(item.id);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.name || !formData.phone) {
        setFormError('Nama dan Telepon wajib diisi.');
        return;
    }

    try {
      if (editingId) {
        await updateItem(editingId, formData);
      } else {
        await createItem(formData);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      setFormError('Gagal menyimpan data. Silakan coba lagi.');
    }
  };

  const handleCityChange = (cityValue) => {
      setFormData({ ...formData, city: cityValue });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kemitraan Agen</h1>
          <p className="text-sm text-gray-500">Kelola data agen dan mitra travel Anda</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <User className="w-4 h-4" />
          Tambah Agen
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
        searchPlaceholder="Cari nama agen atau kota..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Agen" : "Tambah Agen Baru"}
        size="lg"
      >
        {formError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{formError}</p>
                    </div>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama Agen"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp/HP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota Domisili</label>
              <div className="relative">
                 <AsyncCitySelect 
                    value={formData.city}
                    onChange={handleCityChange}
                    placeholder="Ketik untuk mencari kota..."
                 />
              </div>
              <p className="text-xs text-gray-500 mt-1">Ketik minimal 3 karakter untuk mencari.</p>
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Kemitraan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Award className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
                <option value="suspended">Ditangguhkan</option>
              </select>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
            >
              {editingId ? 'Simpan Perubahan' : 'Tambah Agen'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Agents;