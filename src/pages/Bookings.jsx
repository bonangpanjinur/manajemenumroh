import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; // Direct API call for fetching packages/jamaah list
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const Bookings = () => {
  const { data, loading, error, pagination, fetchData, createItem, updateItem, deleteItem } = useCRUD('/bookings');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [search, setSearch] = useState('');
  
  // Data Pembantu
  const [packages, setPackages] = useState([]);
  const [linkedJamaah, setLinkedJamaah] = useState([]); // List jamaah dalam booking ini
  const [loadingExtras, setLoadingExtras] = useState(false);

  // Form State
  const initialFormState = {
    booking_code: '', // Auto-generated usually
    contact_name: '', // Penanggung jawab
    contact_phone: '',
    package_id: '',
    total_pax: 1,
    travel_date: '',
    status: 'Booked', // Booked, DP, Lunas, Cancel
    notes: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Ambil data Paket untuk Dropdown
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/packages?status=Open'); // Asumsi endpoint ada
        setPackages(res.data.data || []);
      } catch (err) {
        console.error("Failed loading packages", err);
      }
    };
    fetchPackages();
  }, []);

  const columns = [
    { 
      header: 'Kode Booking', 
      accessor: (item) => <span className="font-mono font-bold text-blue-600">{item.booking_code}</span> 
    },
    { header: 'Penanggung Jawab', accessor: 'contact_name' },
    { header: 'Paket', accessor: 'package_name' }, // Asumsi backend join table
    { header: 'Jml Pax', accessor: 'total_pax' },
    { header: 'Tgl Keberangkatan', accessor: 'travel_date' },
    { 
      header: 'Status Pembayaran', 
      accessor: (item) => {
        let color = 'bg-gray-100 text-gray-800';
        if (item.status === 'Lunas') color = 'bg-green-100 text-green-800';
        if (item.status === 'DP') color = 'bg-blue-100 text-blue-800';
        if (item.status === 'Cancel') color = 'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
            {item.status}
          </span>
        );
      } 
    },
  ];

  const handleSearch = (value) => {
    setSearch(value);
    fetchData(1, value);
  };

  const handlePageChange = (page) => {
    fetchData(page, search);
  };

  // --- Modal Logic ---

  const openModal = (item = null) => {
    setCurrentItem(item);
    setFormData(item || initialFormState);
    setIsModalOpen(true);
  };

  // Logic Khusus Detail: Ambil list jamaah yang terkait booking ini
  const openDetailModal = async (item) => {
    setCurrentItem(item);
    setIsDetailModalOpen(true);
    setLinkedJamaah([]);
    setLoadingExtras(true);
    try {
        // Asumsi endpoint: /bookings/{id}/jamaah
        // Jika backend belum siap, ini akan kosong
        const res = await api.get(`/bookings/${item.id}/jamaah`);
        setLinkedJamaah(res.data.data || []);
    } catch (err) {
        console.warn("Belum ada endpoint detail jamaah", err);
        // Mock data sementara untuk demo
        setLinkedJamaah([
            { id: 1, name: item.contact_name, status: 'Berangkat', passport: 'X12345' },
            { id: 2, name: 'Anggota Keluarga 1', status: 'Berangkat', passport: 'X67890' }
        ]);
    } finally {
        setLoadingExtras(false);
    }
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
      // Generate dummy code if empty (Backend harusnya handle ini)
      const payload = { 
        ...formData, 
        booking_code: formData.booking_code || `B-${Date.now().toString().substr(-6)}` 
      };
      result = await createItem(payload);
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
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Booking</h1>
            <p className="text-sm text-gray-500">Kelola reservasi paket dan grup jamaah.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Booking Baru
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <SearchInput onSearch={handleSearch} placeholder="Cari Kode Booking atau Nama..." />
      </div>

      {error && <Alert type="error" message={error} />}

      <CrudTable
        columns={columns}
        data={data}
        isLoading={loading}
        onEdit={openModal}
        onDelete={(item) => deleteItem(item.id)}
        onDetail={openDetailModal}
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* --- Modal Form Input/Edit --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentItem ? 'Edit Booking' : 'Booking Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Penanggung Jawab (PJ)</label>
                <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                required
                placeholder="Nama Kepala Keluarga/Ketua"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">No. Telepon PJ</label>
                <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                required
                />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Pilih Paket Umroh</label>
             <select
                value={formData.package_id}
                onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                required
             >
                <option value="">-- Pilih Paket --</option>
                {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.departure_date})</option>
                ))}
             </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Jumlah Pax (Orang)</label>
                <input
                type="number"
                min="1"
                value={formData.total_pax}
                onChange={(e) => setFormData({ ...formData, total_pax: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Status Pembayaran</label>
                <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                    <option value="Booked">Booked (Belum Bayar)</option>
                    <option value="DP">Sudah DP</option>
                    <option value="Lunas">Lunas</option>
                    <option value="Cancel">Dibatalkan</option>
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Catatan Khusus</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Contoh: Request kamar connecting door, kursi roda, dll."
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
             <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2">Batal</button>
             <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </Modal>

      {/* --- Modal Detail Booking (Master-Detail View) --- */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeModal}
        title={`Detail Booking: ${currentItem?.booking_code || ''}`}
      >
        {currentItem && (
            <div className="space-y-6">
                {/* Informasi Utama */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Penanggung Jawab</p>
                        <p className="font-semibold">{currentItem.contact_name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Paket</p>
                        <p className="font-semibold">{currentItem.package_name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Total Pax</p>
                        <p className="font-semibold">{currentItem.total_pax} Orang</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Status</p>
                        <span className="font-bold text-blue-600">{currentItem.status}</span>
                    </div>
                </div>

                {/* List Jamaah dalam Booking ini */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900 border-b pb-1">Daftar Jamaah (Manifest)</h4>
                        <button className="text-xs text-blue-600 hover:text-blue-800">+ Tambah Anggota</button>
                    </div>
                    
                    {loadingExtras ? (
                        <Spinner size="sm" />
                    ) : linkedJamaah.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-2 text-left">Nama</th>
                                    <th className="px-2 py-2 text-left">Paspor</th>
                                    <th className="px-2 py-2 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {linkedJamaah.map((j, idx) => (
                                    <tr key={j.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-2 py-2">{j.name}</td>
                                        <td className="px-2 py-2 font-mono text-gray-500">{j.passport || '-'}</td>
                                        <td className="px-2 py-2">{j.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
                            Belum ada data jamaah yang dihubungkan ke booking ini.
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <button onClick={closeModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md">Tutup</button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default Bookings;