import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { DollarSign, TrendingUp, TrendingDown, Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const FinanceCard = ({ title, amount, type, icon: Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className={`text-2xl font-bold ${type === 'income' ? 'text-green-600' : type === 'expense' ? 'text-red-600' : 'text-gray-900'}`}>
                {amount}
            </h3>
        </div>
        <div className={`p-3 rounded-full ${type === 'income' ? 'bg-green-100 text-green-600' : type === 'expense' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <Icon size={24} />
        </div>
    </div>
);

const Finance = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/finance');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({ type: 'income', amount: 0, title: '', transaction_date: new Date().toISOString().split('T')[0] });

    // Helper format uang
    const formatMoney = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/finance', form);
            else await api.put(`umh/v1/finance/${form.id}`, form);
            
            toast.success("Transaksi disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan"); }
    };

    const columns = [
        { header: 'Tanggal', accessor: 'transaction_date', render: r => <span className="text-gray-600">{r.transaction_date}</span> },
        { header: 'Keterangan', accessor: 'title', render: r => <span className="font-medium text-gray-800">{r.title}</span> },
        { header: 'Tipe', accessor: 'type', render: r => (
            <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${r.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {r.type === 'income' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {r.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </span>
        )},
        { header: 'Jumlah', accessor: 'amount', render: r => (
            <span className={`font-bold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {r.type === 'expense' ? '-' : '+'} {formatMoney(r.amount)}
            </span>
        )},
        { header: 'Status', accessor: 'status', render: r => <span className="text-xs bg-gray-100 px-2 py-1 rounded">{r.status || 'Verified'}</span> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Keuangan</h1>
                        <p className="text-gray-500 text-sm">Laporan arus kas dan pencatatan transaksi.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary flex items-center gap-2"><FileText size={18} /> Export</button>
                    <button onClick={() => { setForm({ type: 'income', amount: 0, title: '', transaction_date: new Date().toISOString().split('T')[0] }); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                        <Plus size={18} /> Transaksi Baru
                    </button>
                </div>
            </div>

            {/* Dashboard Cards (Static Placeholder for demo, dynamic in real app implementation) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FinanceCard title="Pemasukan (Est)" amount={formatMoney(data.filter(i=>i.type==='income').reduce((a,b)=>a+Number(b.amount),0))} type="income" icon={TrendingUp} />
                <FinanceCard title="Pengeluaran (Est)" amount={formatMoney(data.filter(i=>i.type==='expense').reduce((a,b)=>a+Number(b.amount),0))} type="expense" icon={TrendingDown} />
                <FinanceCard title="Saldo Kas" amount={formatMoney(data.reduce((acc, curr) => curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0))} type="neutral" icon={DollarSign} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b font-bold text-gray-700">Riwayat Transaksi Terakhir</div>
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={(item)=>deleteItem(item.id)} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Catat Transaksi" : "Edit Transaksi"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jenis Transaksi</label>
                            <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                <option value="income">Pemasukan (Income)</option>
                                <option value="expense">Pengeluaran (Expense)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Tanggal</label>
                            <input type="date" className="input-field" value={form.transaction_date} onChange={e => setForm({...form, transaction_date: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="label">Judul / Keterangan</label>
                        <input type="text" className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Contoh: Pembayaran Vendor Hotel" required />
                    </div>
                    <div>
                        <label className="label">Nominal (Rp)</label>
                        <input type="number" className="input-field text-lg font-bold" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                    </div>
                    <div>
                        <label className="label">Detail / Catatan</label>
                        <textarea className="input-field" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Finance;