import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import api from '../utils/api';
import { 
    CheckCircle, XCircle, FileText, Download, Plus, 
    ArrowUpCircle, ArrowDownCircle, Calendar, Filter, Wallet 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Finance = () => {
    // --- STATE ---
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('income'); // 'income' | 'expense'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    
    // Filter State
    const [filterDate, setFilterDate] = useState({ 
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Awal bulan ini
        end: new Date().toISOString().split('T')[0] // Hari ini
    });

    // Form State (untuk Input Pengeluaran/Pemasukan Manual)
    const initialForm = {
        type: 'expense', 
        category: 'Operasional',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash'
    };
    const [formData, setFormData] = useState(initialForm);

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // Menggunakan endpoint export/finance karena menyediakan data list lengkap
            const res = await api.get('umh/v1/export/finance', { 
                params: { 
                    start_date: filterDate.start, 
                    end_date: filterDate.end 
                } 
            });
            
            const data = res.data || [];
            setTransactions(data);

            // Hitung Ringkasan (Client-side calculation)
            const inc = data.filter(t => t.Tipe === 'income' && t.Status === 'verified').reduce((sum, t) => sum + parseFloat(t.Nominal || 0), 0);
            const exp = data.filter(t => t.Tipe === 'expense' && t.Status === 'verified').reduce((sum, t) => sum + parseFloat(t.Nominal || 0), 0);
            setSummary({ income: inc, expense: exp, balance: inc - exp });

        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data keuangan");
        } finally {
            setLoading(false);
        }
    };

    // Load data saat filter tanggal berubah
    useEffect(() => {
        fetchData();
    }, [filterDate]);

    // --- ACTIONS ---

    // 1. Verifikasi Pembayaran (Income dari Booking)
    const handleVerify = async (item) => {
        // Asumsi item.id tersedia. Jika endpoint export tidak return ID, perlu disesuaikan di API Backend.
        // Jika data dari export tidak punya ID, kita tidak bisa verify. 
        // Note: Pastikan api-export.php mengembalikan kolom 'id' juga.
        
        if (!item.id) {
            toast.error("ID Transaksi tidak ditemukan. Pastikan API Export menyertakan ID.");
            return;
        }

        if (!window.confirm(`Verifikasi pembayaran sebesar ${formatCurrency(item.Nominal)}?`)) return;

        try {
            await api.put(`umh/v1/finance/${item.id}/verify`, { status: 'verified' });
            toast.success("Pembayaran Terverifikasi");
            fetchData(); // Refresh list
        } catch (err) {
            toast.error("Gagal verifikasi: " + (err.message || 'Server Error'));
        }
    };

    // 2. Submit Transaksi Baru (Manual)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/finance', {
                ...formData,
                type: activeTab, // Ikuti tab yang sedang aktif
                status: 'verified' // Input admin dianggap langsung verified
            });
            toast.success("Transaksi berhasil dicatat");
            setIsModalOpen(false);
            setFormData(initialForm);
            fetchData();
        } catch (err) {
            toast.error("Gagal menyimpan: " + err.message);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- TABEL CONFIG ---
    
    // Filter data di tabel berdasarkan Tab
    const filteredData = useMemo(() => {
        return transactions.filter(t => t.Tipe === activeTab);
    }, [transactions, activeTab]);

    const columns = [
        { header: 'Tanggal', accessor: 'Tanggal', render: r => (
            <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} className="text-gray-400"/>
                <span>{formatDate(r.Tanggal)}</span>
            </div>
        )},
        { header: 'Kategori', accessor: 'Kategori', render: r => (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                {r.Kategori}
            </span>
        )},
        { header: 'Nominal', accessor: 'Nominal', render: r => (
            <span className={`font-bold ${r.Tipe === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {r.Tipe === 'income' ? '+' : '-'} {formatCurrency(r.Nominal)}
            </span>
        )},
        { header: 'Keterangan', accessor: 'Keterangan', render: r => (
            <div className="text-sm text-gray-600 max-w-xs truncate" title={r.Keterangan}>
                {r.Keterangan || '-'}
            </div>
        )},
        { header: 'Status', accessor: 'Status', render: r => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                r.Status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 
                r.Status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                'bg-red-50 text-red-700 border-red-200'
            }`}>
                {r.Status}
            </span>
        )},
        { header: 'Aksi', accessor: 'id', render: r => (
            <div className="flex gap-2">
                {r.Status === 'pending' && r.Tipe === 'income' && (
                    <button 
                        onClick={() => handleVerify(r)} 
                        className="btn-xs bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded flex items-center gap-1 shadow-sm transition-all"
                        title="Verifikasi Pembayaran"
                    >
                        <CheckCircle size={12}/> Verifikasi
                    </button>
                )}
                {/* Tombol Bukti Bayar (Jika ada URL) */}
                {r.proof_file && (
                    <a href={r.proof_file} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 p-1">
                        <FileText size={16}/>
                    </a>
                )}
            </div>
        )}
    ];

    return (
        <Layout title="Keuangan & Arus Kas">
            {/* RINGKASAN ATAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full text-green-600"><ArrowDownCircle size={24}/></div>
                    <div><div className="text-xs text-gray-500">Total Pemasukan</div><div className="text-xl font-bold text-gray-800">{formatCurrency(summary.income)}</div></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-full text-red-600"><ArrowUpCircle size={24}/></div>
                    <div><div className="text-xs text-gray-500">Total Pengeluaran</div><div className="text-xl font-bold text-gray-800">{formatCurrency(summary.expense)}</div></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Wallet size={24}/></div>
                    <div><div className="text-xs text-gray-500">Saldo Akhir</div><div className={`text-xl font-bold ${summary.balance < 0 ? 'text-red-600' : 'text-blue-800'}`}>{formatCurrency(summary.balance)}</div></div>
                </div>
            </div>

            {/* FILTER & ACTIONS */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    
                    {/* Tab Switcher */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-full lg:w-auto">
                        <button 
                            onClick={() => setActiveTab('income')}
                            className={`flex-1 lg:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pemasukan
                        </button>
                        <button 
                            onClick={() => setActiveTab('expense')}
                            className={`flex-1 lg:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'expense' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pengeluaran
                        </button>
                    </div>

                    {/* Filter Date & Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto items-center">
                        <div className="flex items-center gap-2 border px-3 py-2 rounded-lg bg-gray-50 w-full md:w-auto">
                            <Filter size={16} className="text-gray-400"/>
                            <input 
                                type="date" 
                                className="bg-transparent text-sm outline-none w-full md:w-32"
                                value={filterDate.start}
                                onChange={e => setFilterDate({...filterDate, start: e.target.value})}
                            />
                            <span className="text-gray-400">-</span>
                            <input 
                                type="date" 
                                className="bg-transparent text-sm outline-none w-full md:w-32"
                                value={filterDate.end}
                                onChange={e => setFilterDate({...filterDate, end: e.target.value})}
                            />
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                            {/* Tombol Tambah hanya muncul sesuai konteks */}
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className={`btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 ${activeTab === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                <Plus size={18}/> {activeTab === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran'}
                            </button>
                            
                            <button className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2">
                                <Download size={18}/> Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden min-h-[400px]">
                <CrudTable 
                    columns={columns} 
                    data={filteredData} 
                    loading={loading} 
                    emptyMessage={`Belum ada data ${activeTab === 'income' ? 'pemasukan' : 'pengeluaran'} pada periode ini.`}
                />
            </div>

            {/* MODAL INPUT TRANSAKSI */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Catat ${activeTab === 'income' ? 'Pemasukan' : 'Pengeluaran'} Manual`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
                        Catatan: Gunakan fitur ini untuk transaksi di luar Booking Jemaah (misal: Biaya Listrik, Sewa Kantor, atau Pemasukan Lain-lain).
                    </div>

                    <div>
                        <label className="label">Tanggal Transaksi</label>
                        <input type="date" name="transaction_date" className="input-field" value={formData.transaction_date} onChange={handleChange} required />
                    </div>
                    
                    <div>
                        <label className="label">Kategori</label>
                        <select name="category" className="input-field" value={formData.category} onChange={handleChange}>
                            {activeTab === 'expense' ? (
                                <>
                                    <option value="Operasional Kantor">Operasional Kantor</option>
                                    <option value="Gaji Karyawan">Gaji Karyawan</option>
                                    <option value="Marketing">Marketing / Iklan</option>
                                    <option value="Vendor Visa">Vendor Visa/Tiket</option>
                                    <option value="Perlengkapan">Perlengkapan Jemaah</option>
                                    <option value="Lainnya">Lainnya</option>
                                </>
                            ) : (
                                <>
                                    <option value="Investasi">Investasi Masuk</option>
                                    <option value="Refund Vendor">Refund dari Vendor</option>
                                    <option value="Lainnya">Lainnya</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="label">Nominal (IDR)</label>
                        <input 
                            type="number" 
                            name="amount" 
                            className={`input-field font-bold text-lg ${activeTab==='expense'?'text-red-600':'text-green-600'}`} 
                            value={formData.amount} 
                            onChange={handleChange} 
                            placeholder="0" 
                            required 
                        />
                    </div>

                    <div>
                        <label className="label">Metode Pembayaran</label>
                        <select name="payment_method" className="input-field" value={formData.payment_method} onChange={handleChange}>
                            <option value="cash">Kas Tunai</option>
                            <option value="transfer">Transfer Bank</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Keterangan / Keperluan</label>
                        <textarea name="description" className="input-field h-24" value={formData.description} onChange={handleChange} placeholder="Deskripsi detail transaksi..." required></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className={`btn-primary ${activeTab==='expense'?'bg-red-600 hover:bg-red-700':'bg-green-600 hover:bg-green-700'}`}>
                            Simpan Transaksi
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Finance;