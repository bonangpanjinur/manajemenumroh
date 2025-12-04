import React, { useState } from 'react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const Marketing = () => {
  const { data, loading, error, pagination, fetchData, createItem, updateItem, deleteItem } = useCRUD('/marketing');
  
  // State untuk Modal dan Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ 
    campaign_name: '', 
    type: 'Social Media', 
    budget: '', 
    status: 'Active',
    roi_percentage: ''
  });
  const [search, setSearch] = useState('');

  const columns = [
    { header: 'Nama Kampanye', accessor: 'campaign_name' },
    { header: 'Tipe', accessor: 'type' },
    { 
      header: 'Budget', 
      accessor: (item) => `Rp ${parseInt(item.budget).toLocaleString()}` 
    },
    { header: 'ROI (%)', accessor: (item) => item.roi_percentage ? `${item.roi_percentage}%` : '-' },
    { 
      header: 'Status', 
      accessor: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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

  const handlePageChange = (page) => {
    fetchData(page, search);
  };

  // Membuka modal (baik untuk Edit maupun Tambah Baru)
  const openModal = (item = null) => {
    setCurrentItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({ 
        campaign_name: '', 
        type: 'Social Media', 
        budget: '', 
        status: 'Active',
        roi_percentage: '' 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (currentItem) {
      result = await updateItem(currentItem.id, formData);
    } else {
      result = await createItem(formData);
    }
    
    if (result.success) {
      closeModal();
    } else {
      alert('Gagal menyimpan: ' + result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kampanye Marketing</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Buat Kampanye
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <SearchInput onSearch={handleSearch} placeholder="Cari kampanye..." />
      </div>

      {error && <Alert type="error" message={error} />}

      <CrudTable
        columns={columns}
        data={data}
        isLoading={loading}
        // Menambahkan props onEdit dan onDelete agar tombol muncul
        onEdit={(item) => openModal(item)}
        onDelete={(item) => deleteItem(item.id)}
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal Form Marketing */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentItem ? 'Edit Kampanye' : 'Buat Kampanye Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Kampanye</label>
            <input
              type="text"
              value={formData.campaign_name}
              onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
              placeholder="Contoh: Promo Ramadhan 2024"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipe Media</label>
                <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                <option value="Social Media">Social Media</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Offline Event">Offline Event</option>
                <option value="Email Marketing">Email Marketing</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Paused">Paused</option>
                </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Budget (Rp)</label>
                <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Estimasi ROI (%)</label>
                <input
                type="number"
                step="0.01"
                value={formData.roi_percentage}
                onChange={(e) => setFormData({ ...formData, roi_percentage: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="25.5"
                />
            </div>
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
              {currentItem ? 'Simpan Perubahan' : 'Buat Kampanye'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Marketing;