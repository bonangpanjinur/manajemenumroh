import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; 
import { Plus, Wallet, CheckCircle, Clock, DollarSign, Printer, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const Finance = () => {
    // Gunakan endpoint Unified Finance
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/finance');
    const [jamaahList, setJamaahList] = useState([]);
    
    // Load daftar jemaah untuk dropdown
    useEffect(() => { 
        api.get('umh/v1/jamaah').then(res => {
            const items = Array.isArray(res) ? res : (res.items || res.data || []);
            setJamaahList(items);
        }).catch(()=>[]);
    }, []);

    // Hitung statistik aman (prevent crash)
    const stats = useMemo(() => {
        if (!data || !Array.isArray(data)) return { income: 0, expense: 0, balance: 0 };
        const income = data.reduce((acc, curr) => curr.type === 'income' ? acc + parseFloat(curr.amount || 0) : acc, 0);
        const expense = data.reduce((acc, curr) => curr.type === 'expense' ? acc + parseFloat(curr.amount || 0) : acc, 0);
        return { income, expense, balance: income - expense };
    }, [data]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    const initialForm = {
        type: 'income', // income | expense
        jamaah_id: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'transfer',
        status: 'verified',
        description: ''
    };
    const [formData, setFormData] = useState(initialForm);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validasi manual
        if (!formData.amount || formData.amount <= 0) {
            toast.error("Jumlah harus lebih dari 0");
            return;
        }

        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);

        if (success) {
            setIsModalOpen(false);
            fetchData(); // Refresh
        }
    };

    const handlePrintReceipt = (id) => {
        if (!window.umhData?.siteUrl) return toast.error("URL tidak valid");
        const url = `${window.umhData.siteUrl}/wp-json/umh/v1/print/receipt?ids=${id}`;
        window.open(url, '_blank');
    };

    const columns = [
        { header: 'Tanggal', accessor: 'transaction_date', render: r => <span className="text-gray-600 text-sm">{formatDate(r.transaction_date || r.payment_date)}</span> },
        { header: 'Tipe', accessor: 'type', render: r => (
            r.type === 'income' 
            ? <span className="badge bg-green-50 text-green-700 flex items-center gap-1"><TrendingUp size={12}/> Masuk</span>
            : <span className="badge bg-red-50 text-red-700 flex items-center gap-1"><TrendingDown size={12}/> Keluar</span>
        )},
        { header: 'Keterangan / Jemaah', accessor: 'description', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.jamaah_name || r.description || 'Transaksi Umum'}</div>
                {r.jamaah_name && <div className="text-xs text-gray-500">{r.description}</div>}
            </div>
        )},
        { header: 'Jumlah', accessor: 'amount', render: r => (
            <span className={`font-bold text-base ${r.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                {r.type === 'income' ? '+' : '-'} {formatCurrency(r.amount)}
            </span> 
        )},
        { header: 'Metode', accessor: 'payment_method', render: r => <span className="uppercase text-xs font-semibold bg-gray-100 px-2 py-1 rounded border border-gray-200">{r.payment_method}</span> },
        { header: 'Cetak', accessor: 'id', render: r => (
            r.type === 'income' && (
                <button onClick={() => handlePrintReceipt(r.id)} className="text-gray-500 hover:text-blue-600" title="Cetak Kwitansi">
                    <Printer size={18} />
                </button>
            )
        )}
    ];

    return (
        <Layout title="Keuangan & Kasir">
            {/* Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                    <div className="text-gray-500 text-sm mb-1">Total Pemasukan</div>
                    <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.income)}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                    <div className="text-gray-500 text-sm mb-1">Total Pengeluaran</div>
                    <div className="text-2xl font-bold text-red-700">{formatCurrency(stats.expense)}</div>
                </div>
                <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-blue-100 text-sm mb-1">Saldo Kas</div>
                    <div className="text-2xl font-bold">{formatCurrency(stats.balance)}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2"><Wallet size={20}/> Riwayat Transaksi</h3>
                    <button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2 shadow-md">
                        <Plus size={18}/> Catat Transaksi
                    </button>
                </div>
                
                {loading && !data.length ? <Spinner text="Memuat data keuangan..." /> : (
                    <CrudTable 
                        columns={columns} 
                        data={Array.isArray(data) ? data : []} // Safe check
                        loading={loading} 
                        onEdit={(item) => handleOpenModal('edit', item)}
                        onDelete={(item) => deleteItem(item.id)} 
                    />
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Catat Transaksi Baru" : "Edit Transaksi"} size="max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jenis Transaksi</label>
                            <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="income">Pemasukan (Income)</option>
                                <option value="expense">Pengeluaran (Expense)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Tanggal</label>
                            <input type="date" className="input-field" value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})} required />
                        </div>
                    </div>

                    {formData.type === 'income' && (
                        <div>
                            <label className="label">Terima Dari (Jemaah)</label>
                            <select className="input-field" value={formData.jamaah_id} onChange={e => setFormData({...formData, jamaah_id: e.target.value})}>
                                <option value="">-- Pilih Jemaah (Opsional) --</option>
                                {jamaahList.map(j => (
                                    <option key={j.id} value={j.id}>{j.full_name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="label">Nominal (Rp)</label>
                        <input type="number" className="input-field font-bold text-lg" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required placeholder="0" />
                    </div>

                    <div>
                        <label className="label">Keterangan</label>
                        <textarea className="input-field" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Contoh: Pelunasan, Bayar Listrik, dll..."></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Metode</label>
                            <select className="input-field" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                                <option value="transfer">Transfer Bank</option>
                                <option value="cash">Tunai</option>
                                <option value="qris">QRIS</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="verified">Selesai (Verified)</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-full md:w-auto">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Finance;