import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const Jamaah = () => {
  const { data, loading, error, pagination, fetchData, createItem, updateItem, deleteItem } = useCRUD('/jamaah');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', passport_number: '', phone: '', address: '', status: 'Calon' });
  const [search, setSearch] = useState('');
  
  // State untuk filter
  const [statusFilter, setStatusFilter] = useState('');

  // Kolom Tabel
  const columns = [
    { header: 'Nama Lengkap', accessor: 'name' },
    { header: 'No. Paspor', accessor: 'passport_number' },
    { header: 'Telepon', accessor: 'phone' },
    { 
      header: 'Status', 
      accessor: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.status === 'Berangkat' ? 'bg-green-100 text-green-800' : 
          item.status === 'Pulang' ? 'bg-gray-100 text-gray-800' : 
          item.status === 'Terdaftar' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {item.status}
        </span>
      ) 
    },
  ];

  // Effect untuk refresh data saat filter berubah
  useEffect(() => {
    // Kita panggil fetchData dengan parameter filter
    // Pastikan useCRUD dan API backend mendukung parameter 'status'
    fetchData(1, search, { status: statusFilter });
  }, [statusFilter]);

  const handleSearch = (value) => {
    setSearch(value);
    fetchData(1, value, { status: statusFilter });
  };

  const handlePageChange = (page) => {
    fetchData(page, search, { status: statusFilter });
  };

  const openModal = (item = null) => {
    setCurrentItem(item);
    setFormData(item || { name: '', passport_number: '', phone: '', address: '', status: 'Calon' });
    setIsModalOpen(true);
  };

  const openDetailModal = (item) => {
    setCurrentItem(item);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDetailModalOpen(false);
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

  const handlePrintManifest = () => {
      const printUrl = `/wp-admin/admin-ajax.php?action=umroh_print_manifest`; 
      window.open(printUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Jamaah</h1>
        <div className="flex gap-2">
            <button
                onClick={handlePrintManifest}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center shadow-sm"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Cek Manifest
            </button>
            <button
                onClick={() => openModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Jamaah
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-1/2">
            <SearchInput onSearch={handleSearch} placeholder="Cari nama atau paspor..." />
        </div>
        
        {/* Dropdown Filter Status */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter Status:</label>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
                <option value="">Semua Status</option>
                <option value="Calon">Calon</option>
                <option value="Terdaftar">Terdaftar</option>
                <option value="Berangkat">Berangkat</option>
                <option value="Pulang">Pulang</option>
            </select>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <CrudTable
        columns={columns}
        data={data}
        isLoading={loading}
        onEdit={(item) => openModal(item)}
        onDelete={(item) => deleteItem(item.id)}
        onDetail={(item) => openDetailModal(item)}
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal Form Tambah/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentItem ? 'Edit Jamaah' : 'Tambah Jamaah Baru'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Paspor</label>
                <input
                type="text"
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="Calon">Calon</option>
              <option value="Terdaftar">Terdaftar</option>
              <option value="Berangkat">Berangkat</option>
              <option value="Pulang">Pulang</option>
            </select>
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
              {currentItem ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Manifest */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeModal}
        title="Detail Data Jamaah"
      >
        {currentItem && (
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Nama Lengkap</p>
                            <p className="font-semibold text-gray-800">{currentItem.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Nomor Paspor</p>
                            <p className="font-semibold text-gray-800">{currentItem.passport_number}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Telepon</p>
                            <p className="font-semibold text-gray-800">{currentItem.phone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Status</p>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                currentItem.status === 'Berangkat' ? 'bg-green-100 text-green-800' : 
                                currentItem.status === 'Pulang' ? 'bg-gray-100 text-gray-800' : 
                                'bg-yellow-100 text-yellow-800'
                                }`}>
                                {currentItem.status}
                            </span>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-500">Alamat</p>
                            <p className="font-semibold text-gray-800">{currentItem.address || '-'}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-4">
                    <button
                        onClick={closeModal}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        )}
      </Modal>

    </div>
  );
};

export default Jamaah;