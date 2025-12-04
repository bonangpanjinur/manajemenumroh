import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const Agents = () => {
  const { data, loading, error, pagination, fetchData, createItem, updateItem, deleteItem } = useCRUD('/agents');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [search, setSearch] = useState('');
  
  // List agen induk untuk dropdown hierarchy
  const [parentAgents, setParentAgents] = useState([]);

  // Ambil data agen yang bisa jadi upline (Cabang & Agen) dari data existing
  useEffect(() => {
    if (data) {
        const potentialParents = data.filter(a => a.level === 'Cabang' || a.level === 'Agen');
        setParentAgents(potentialParents);
    }
  }, [data]);

  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    city: '',
    level: 'Agen', // Cabang, Agen, Sub Agen
    parent_agent_id: '', // Jika Sub Agen, siapa induknya
    commission_rate: 0,
    status: 'Active'
  };
  const [formData, setFormData] = useState(initialFormState);

  const columns = [
    { header: 'Nama Agen', accessor: 'name' },
    { 
        header: 'Level Kemitraan', 
        accessor: (item) => {
            let color = 'bg-gray-100 text-gray-800';
            if (item.level === 'Cabang') color = 'bg-purple-100 text-purple-800';
            if (item.level === 'Agen') color = 'bg-blue-100 text-blue-800';
            if (item.level === 'Sub Agen') color = 'bg-yellow-100 text-yellow-800';
            
            return (
                <div className="flex flex-col">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-max ${color}`}>
                        {item.level}
                    </span>
                    {item.parent_agent_name && (
                        <span className="text-[10px] text-gray-400 mt-1">Upline: {item.parent_agent_name}</span>
                    )}
                </div>
            );
        }
    },
    { header: 'Kota / Domisili', accessor: 'city' },
    { header: 'Telepon', accessor: 'phone' },
    { 
      header: 'Komisi', 
      accessor: (item) => `Rp ${new Intl.NumberFormat('id-ID').format(item.commission_rate || 0)}` 
    },
    { 
      header: 'Status', 
      accessor: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      ) 
    },
  ];

  const handleSearch = (value) => {
    setSearch(value);
    fetchData(1, value);
  };

  const openModal = (item = null) => {
    setCurrentItem(item);
    setFormData(item || initialFormState);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Cari nama upline untuk disimpan sementara (display purpose)
    let parentName = '';
    if (formData.level === 'Sub Agen' && formData.parent_agent_id) {
        const parent = parentAgents.find(p => p.id == formData.parent_agent_id);
        if (parent) parentName = parent.name;
    }
    
    const payload = { ...formData, parent_agent_name: parentName };

    let result;
    if (currentItem) {
      result = await updateItem(currentItem.id, payload);
    } else {
      result = await createItem(payload);
    }
    
    if (result.success) {
      closeModal();
      // Auto-reload data terjamin via useCRUD
    } else {
      alert('Gagal menyimpan: ' + result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Kemitraan & Agen</h1>
            <p className="text-sm text-gray-500">Kelola struktur Cabang, Agen, dan Sub-Agen.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Daftar Mitra Baru
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <SearchInput onSearch={handleSearch} placeholder="Cari nama agen atau kota..." />
      </div>

      {error && <Alert type="error" message={error} />}

      <CrudTable
        columns={columns}
        data={data}
        isLoading={loading}
        onEdit={openModal}
        onDelete={(item) => deleteItem(item.id)}
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => fetchData(page, search)}
      />

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentItem ? 'Edit Data Mitra' : 'Registrasi Mitra Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Level Kemitraan</label>
                <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value, parent_agent_id: e.target.value !== 'Sub Agen' ? '' : formData.parent_agent_id })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                    <option value="Cabang">Cabang (Branch)</option>
                    <option value="Agen">Agen Resmi</option>
                    <option value="Sub Agen">Sub Agen (Referral)</option>
                </select>
             </div>
             
             {/* Kondisional: Jika Sub Agen, harus pilih Induk */}
             {formData.level === 'Sub Agen' ? (
                 <div>
                    <label className="block text-sm font-medium text-yellow-700">Induk Agen (Upline)</label>
                    <select
                        value={formData.parent_agent_id}
                        onChange={(e) => setFormData({ ...formData, parent_agent_id: e.target.value })}
                        className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border bg-yellow-50"
                        required
                    >
                        <option value="">-- Pilih Agen Induk --</option>
                        {parentAgents.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.level})</option>
                        ))}
                    </select>
                 </div>
             ) : (
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                 </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Komisi per Jamaah (Rp)</label>
                <input
                type="number"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Kota / Domisili</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Contoh: Surabaya"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              {loading && <Spinner size="sm" className="mr-2" />}
              {currentItem ? 'Simpan Perubahan' : 'Daftar Mitra'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Agents;