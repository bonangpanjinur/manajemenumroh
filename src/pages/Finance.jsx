import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; // Import API untuk ambil data booking & karyawan
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const Finance = () => {
  const { data, loading, error, pagination, fetchData, createItem, updateItem, deleteItem } = useCRUD('/finance');
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [search, setSearch] = useState('');
  
  // State untuk Dropdown Relasi
  const [bookingsList, setBookingsList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);

  // State Summary Card
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });

  useEffect(() => {
    if(data.length > 0) {
        const inc = data.filter(i => i.type === 'income').reduce((acc, cur) => acc + Number(cur.amount), 0);
        const exp = data.filter(i => i.type === 'expense').reduce((acc, cur) => acc + Number(cur.amount), 0);
        setSummary({ income: inc, expense: exp, balance: inc - exp });
    }
  }, [data]);

  // Fetch Data Relasi (Booking & Karyawan) saat modal dibuka atau komponen diload
  const fetchRelations = async () => {
    setLoadingRelations(true);
    try {
        const [resBookings, resEmployees] = await Promise.all([
            api.get('/bookings?status=Booked,DP,Lunas'), // Ambil booking aktif
            api.get('/users?role=staff,agent') // Ambil data karyawan/agen
        ]);
        setBookingsList(resBookings.data.data || []);
        setEmployeesList(resEmployees.data.data || []);
    } catch (err) {
        console.error("Gagal mengambil data relasi", err);
    } finally {
        setLoadingRelations(false);
    }
  };

  useEffect(() => {
      fetchRelations();
  }, []);

  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    title: '',
    type: 'income',
    category: 'Pembayaran Jamaah',
    amount: 0,
    reference_number: '', 
    description: '',
    related_id: '', // ID Booking atau ID Karyawan
    related_name: '' // Nama Booking/Karyawan untuk display
  };
  const [formData, setFormData] = useState(initialFormState);

  const filteredData = activeTab === 'all' 
    ? data 
    : data.filter(item => item.type === activeTab);

  const columns = [
    { header: 'Tanggal', accessor: 'date' },
    { 
        header: 'Tipe', 
        accessor: (item) => (
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                item.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
                {item.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}
            </span>
        ) 
    },
    { header: 'Keterangan', accessor: 'title' },
    { header: 'Kategori', accessor: 'category' },
    { 
        header: 'Relasi', 
        accessor: (item) => item.related_name ? <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.related_name}</span> : '-'
    },
    { 
        header: 'Nominal', 
        accessor: (item) => (
            <span className={`font-mono ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {item.type === 'expense' ? '- ' : ''}
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.amount)}
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
    let result;
    
    // Cari nama relasi untuk disimpan (redundansi display)
    let relationName = '';
    if (formData.category === 'Pembayaran Jamaah') {
        const b = bookingsList.find(i => i.id == formData.related_id);
        if(b) relationName = `${b.booking_code} - ${b.contact_name}`;
    } else if (formData.category === 'Gaji Karyawan') {
        const e = employeesList.find(i => i.id == formData.related_id);
        if(e) relationName = e.name;
    }

    const payload = { ...formData, related_name: relationName || formData.related_name };

    if (currentItem) {
      result = await updateItem(currentItem.id, payload);
    } else {
      result = await createItem(payload);
    }
    
    if (result.success) {
      closeModal();
      // Data table otomatis reload karena useCRUD memanggil fetchData setelah success
    } else {
      alert('Gagal menyimpan: ' + result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Keuangan & Kas</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Catat Transaksi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-green-500">
              <p className="text-xs text-gray-500 uppercase">Total Pemasukan</p>
              <p className="text-xl font-bold text-green-700">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.income)}
              </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-red-500">
              <p className="text-xs text-gray-500 uppercase">Total Pengeluaran</p>
              <p className="text-xl font-bold text-red-700">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.expense)}
              </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
              <p className="text-xs text-gray-500 uppercase">Saldo Kas</p>
              <p className="text-xl font-bold text-blue-700">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.balance)}
              </p>
          </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-lg border border-gray-100">
        <div className="flex space-x-2">
            {['all', 'income', 'expense'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm rounded-md transition-colors capitalize ${activeTab === tab ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {tab === 'all' ? 'Semua' : tab === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </button>
            ))}
        </div>
        <div className="w-full sm:w-64">
             <SearchInput onSearch={handleSearch} placeholder="Cari transaksi..." />
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <CrudTable
        columns={columns}
        data={filteredData}
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
        title={currentItem ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Transaksi</label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value, category: e.target.value === 'income' ? 'Pembayaran Jamaah' : 'Operasional Kantor' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                    <option value="income">Pemasukan (Income)</option>
                    <option value="expense">Pengeluaran (Expense)</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    required
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, related_id: '' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                    {formData.type === 'income' ? (
                        <>
                            <option value="Pembayaran Jamaah">Pembayaran Jamaah</option>
                            <option value="Komisi Agen">Refund / Komisi</option>
                            <option value="Lainnya">Lainnya</option>
                        </>
                    ) : (
                        <>
                            <option value="Gaji Karyawan">Gaji Karyawan</option>
                            <option value="Vendor Hotel">Vendor Hotel</option>
                            <option value="Vendor Pesawat">Vendor Pesawat</option>
                            <option value="Operasional Kantor">Operasional Kantor</option>
                            <option value="Marketing">Biaya Marketing</option>
                        </>
                    )}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Nominal (Rp)</label>
                <input
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    required
                />
             </div>
          </div>

          {/* Dynamic Field: Relasi Booking (Pemasukan) */}
          {formData.type === 'income' && formData.category === 'Pembayaran Jamaah' && (
              <div className="bg-green-50 p-3 rounded border border-green-200">
                  <label className="block text-sm font-medium text-green-800 mb-1">Pilih Booking Jamaah</label>
                  {loadingRelations ? <Spinner size="sm"/> : (
                      <select
                          value={formData.related_id}
                          onChange={(e) => setFormData({ ...formData, related_id: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                          required
                      >
                          <option value="">-- Pilih Kode Booking --</option>
                          {bookingsList.map(b => (
                              <option key={b.id} value={b.id}>{b.booking_code} - {b.contact_name}</option>
                          ))}
                      </select>
                  )}
              </div>
          )}

          {/* Dynamic Field: Relasi Karyawan (Gaji) */}
          {formData.type === 'expense' && formData.category === 'Gaji Karyawan' && (
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <label className="block text-sm font-medium text-blue-800 mb-1">Pilih Karyawan</label>
                  {loadingRelations ? <Spinner size="sm"/> : (
                      <select
                          value={formData.related_id}
                          onChange={(e) => setFormData({ ...formData, related_id: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          required
                      >
                          <option value="">-- Pilih Karyawan --</option>
                          {employeesList.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.name} ({emp.role || 'Staff'})</option>
                          ))}
                      </select>
                  )}
                  <p className="text-xs text-blue-600 mt-1">*Masukkan nominal bersih (Take Home Pay) sesuai laporan HRD.</p>
              </div>
          )}

          <div>
             <label className="block text-sm font-medium text-gray-700">Judul / Keterangan</label>
             <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                required
                placeholder={formData.category === 'Gaji Karyawan' ? 'Gaji Bulan Oktober 2024' : 'Keterangan transaksi...'}
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Catatan Referensi</label>
             <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="No. Invoice / Kode Laporan HRD"
             />
          </div>

          <div className="flex justify-end pt-4">
             <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2">Batal</button>
             <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Simpan Transaksi</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;