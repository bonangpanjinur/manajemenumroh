import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; // Import API untuk fetch data bookings
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const Logistics = () => {
  // Main CRUD untuk Logistik
  const { data, loading, error, pagination, fetchData, createItem, updateItem, deleteItem } = useCRUD('/logistics');
  
  // State lokal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [bookingsList, setBookingsList] = useState([]); // Untuk dropdown pilihan booking
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [search, setSearch] = useState('');

  // Initial Form State
  const initialFormState = { 
    booking_id: '', 
    item_name: 'Koper & Perlengkapan', 
    quantity: 1, 
    status: 'Pending', 
    notes: '',
    recipient_name: '' // Nama penerima barang
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch data bookings untuk dropdown saat komponen di-load
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        // Asumsi endpoint ini mengembalikan daftar booking aktif
        const response = await api.get('/bookings?status=Confirmed'); 
        setBookingsList(response.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil data booking", err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, []);

  // Definisi Kolom Tabel
  const columns = [
    { 
      header: 'Kode Booking', 
      accessor: (item) => (
        <span className="font-mono text-blue-600 font-medium">
          {item.booking_code || '-'}
        </span>
      )
    },
    { header: 'Nama Jamaah / Penerima', accessor: 'recipient_name' },
    { header: 'Item', accessor: 'item_name' },
    { header: 'Qty', accessor: 'quantity' },
    { 
      header: 'Status', 
      accessor: (item) => {
        let colorClass = 'bg-gray-100 text-gray-800';
        if (item.status === 'Diterima') colorClass = 'bg-green-100 text-green-800';
        if (item.status === 'Disiapkan') colorClass = 'bg-blue-100 text-blue-800';
        if (item.status === 'Pending') colorClass = 'bg-yellow-100 text-yellow-800';
        
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
            {item.status}
          </span>
        );
      } 
    },
    { header: 'Catatan', accessor: 'notes' }
  ];

  const handleSearch = (value) => {
    setSearch(value);
    fetchData(1, value);
  };

  const handlePageChange = (page) => {
    fetchData(page, search);
  };

  const openModal = (item = null) => {
    setCurrentItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Cari booking code berdasarkan ID untuk disimpan sebagai redundansi/display jika perlu
    const selectedBooking = bookingsList.find(b => b.id == formData.booking_id);
    const payload = {
        ...formData,
        booking_code: selectedBooking ? selectedBooking.booking_code : '' 
    };

    let result;
    if (currentItem) {
      result = await updateItem(currentItem.id, payload);
    } else {
      result = await createItem(payload);
    }
    
    if (result.success) {
      closeModal();
    } else {
      alert('Gagal menyimpan: ' + result.error);
    }
  };

  // Handler saat Booking dipilih di dropdown
  const handleBookingChange = (e) => {
    const selectedId = e.target.value;
    const booking = bookingsList.find(b => b.id == selectedId);
    
    setFormData({
      ...formData,
      booking_id: selectedId,
      // Otomatis isi nama penerima dari data booking (misal nama kontak utama)
      recipient_name: booking ? booking.contact_name || booking.jamaah_name : ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Logistik</h1>
            <p className="text-sm text-gray-500">Pantau distribusi perlengkapan (Koper, Batik, Ihram) per Booking.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Distribusi Baru
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
        onEdit={(item) => openModal(item)}
        onDelete={(item) => deleteItem(item.id)}
        onDetail={(item) => alert(`Detail logistik untuk ${item.booking_code}`)} // Bisa diganti modal detail
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentItem ? 'Update Status Logistik' : 'Input Pengambilan Logistik'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Field: Pilih Booking */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Kode Booking</label>
            {loadingBookings ? (
                <p className="text-xs text-gray-500 animate-pulse">Memuat data booking...</p>
            ) : (
                <select
                value={formData.booking_id}
                onChange={handleBookingChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                required
                disabled={currentItem} // Jika edit, biasanya booking ID tidak boleh diganti agar konsisten
                >
                <option value="">-- Pilih Booking --</option>
                {bookingsList.map((b) => (
                    <option key={b.id} value={b.id}>
                    {b.booking_code} - {b.contact_name || b.jamaah_name} ({b.package_name})
                    </option>
                ))}
                </select>
            )}
            <p className="text-xs text-gray-500 mt-1">Pilih Booking ID untuk mengaitkan logistik.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Penerima</label>
                <input
                type="text"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Nama Jamaah/Perwakilan"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Barang</label>
                <select
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                    <option value="Koper & Perlengkapan">Set Koper Lengkap</option>
                    <option value="Kain Ihram">Kain Ihram</option>
                    <option value="Batik Seragam">Batik Seragam</option>
                    <option value="Oleh-oleh Air Zamzam">Air Zamzam (5L)</option>
                    <option value="Dokumen Paspor">Dokumen Paspor</option>
                </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Jumlah (Qty)</label>
                <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                <option value="Pending">Pending (Belum Diambil)</option>
                <option value="Disiapkan">Sedang Disiapkan</option>
                <option value="Diterima">Sudah Diterima</option>
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Contoh: Diambil oleh anak Pak Budi"
            ></textarea>
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
              {currentItem ? 'Simpan Perubahan' : 'Catat Distribusi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Logistics;