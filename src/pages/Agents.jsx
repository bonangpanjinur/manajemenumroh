import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Users, Plus, Wallet, ArrowUpCircle, Copy, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Agents = () => {
    // endpoint sudah diupdate agar return data balance (saldo) dari JOIN
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/agents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [selectedAgent, setSelectedAgent] = useState(null);
    
    // Form Data
    const initialForm = { name: '', code: '', email: '', phone: '', type: 'agent', bank_name: '', bank_account_number: '', status: 'active' };
    const [form, setForm] = useState(initialForm);
    
    // Topup Form
    const [topupAmount, setTopupAmount] = useState('');
    const [topupNotes, setTopupNotes] = useState('');

    const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

    // Generate random code for new agent
    const generateCode = () => 'AG-' + Math.floor(1000 + Math.random() * 9000);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/agents', {...form, code: form.code || generateCode()});
            else await api.put(`umh/v1/agents/${form.id}`, form);
            
            toast.success("Data Agen Disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan: " + e.message); }
    };

    const handleTopup = async (e) => {
        e.preventDefault();
        if(!selectedAgent) return;
        try {
            await api.post(`umh/v1/agents/${selectedAgent.id}/topup`, {
                amount: parseFloat(topupAmount),
                notes: topupNotes
            });
            toast.success(`Topup ${formatIDR(topupAmount)} berhasil!`);
            setIsTopupModalOpen(false);
            setTopupAmount('');
            setTopupNotes('');
            fetchData(); // Refresh data untuk lihat saldo baru
        } catch (error) {
            toast.error("Gagal topup: " + (error.response?.data?.message || error.message));
        }
    };

    const columns = [
        { header: 'Agen / Mitra', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500">{r.code} ({r.type.toUpperCase()})</div>
            </div>
        )},
        { header: 'Saldo Wallet', accessor: 'balance', render: r => (
            <div className="flex items-center gap-2">
                <span className={`font-mono font-bold text-lg ${r.balance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {formatIDR(r.balance)}
                </span>
                <button 
                    onClick={() => { setSelectedAgent(r); setIsTopupModalOpen(true); }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Topup Saldo"
                >
                    <ArrowUpCircle size={16}/>
                </button>
            </div>
        )},
        { header: 'Kontak & Bank', accessor: 'phone', render: r => (
            <div className="text-xs">
                <div>{r.email} / {r.phone}</div>
                <div className="text-gray-400 flex items-center gap-1">
                    <CreditCard size={10}/> {r.bank_name || '-'}
                </div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => <span className="uppercase text-[10px] bg-gray-100 px-2 py-1 rounded">{r.status}</span> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kemitraan & Agen B2B</h1>
                    <p className="text-gray-500 text-sm">Kelola data agen, kode referral, dan saldo deposit.</p>
                </div>
                <button onClick={() => { setMode('create'); setForm({...initialForm, code: generateCode()}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Agen
                </button>
            </div>

            {/* Info Saldo Total */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Total Saldo Deposit Agen (Kewajiban)</p>
                    <h3 className="text-2xl font-bold text-purple-600 mt-1">
                        {formatIDR(data.reduce((sum, item) => sum + (parseFloat(item.balance) || 0), 0))}
                    </h3>
                </div>
                <Wallet size={40} className="text-purple-400 opacity-50"/>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={(item) => { setMode('edit'); setForm(item); setIsModalOpen(true); }}
                    onDelete={deleteItem}
                />
            </div>

            {/* Modal CRUD Agen */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create'?"Agen Baru":"Edit Agen"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div><label className="label">Nama Agen/Travel</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Kode Agen (Otomatis)</label><input className="input-field bg-gray-100" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} readOnly={mode==='edit'}/></div>
                        <div><label className="label">Tipe</label><select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}><option value="agent">Agen Reguler</option><option value="master">Master Agen</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Email</label><input type="email" className="input-field" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></div>
                        <div><label className="label">No HP</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/></div>
                    </div>
                    <div className="pt-4 mt-4 border-t">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Data Bank (Pencairan Komisi)</h4>
                        <div className="flex gap-2">
                            <input placeholder="Nama Bank" className="input-field w-1/3" value={form.bank_name} onChange={e=>setForm({...form, bank_name:e.target.value})}/>
                            <input placeholder="No Rekening" className="input-field w-2/3" value={form.bank_account_number} onChange={e=>setForm({...form, bank_account_number:e.target.value})}/>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn-primary">Simpan Data Agen</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Topup */}
            <Modal isOpen={isTopupModalOpen} onClose={() => setIsTopupModalOpen(false)} title={`Topup Saldo Agen: ${selectedAgent?.name}`} size="max-w-md">
                <form onSubmit={handleTopup} className="space-y-4">
                    <div className="bg-green-50 p-3 rounded text-sm text-green-800 border border-green-100">
                        Saldo saat ini: <span className="font-bold">{formatIDR(selectedAgent?.balance)}</span>
                    </div>
                    <div>
                        <label className="label">Nominal Topup (Rp)</label>
                        <input type="number" className="input-field text-xl font-bold" value={topupAmount} onChange={e=>setTopupAmount(e.target.value)} autoFocus required/>
                    </div>
                    <div>
                        <label className="label">Catatan</label>
                        <textarea className="input-field" rows="2" value={topupNotes} onChange={e=>setTopupNotes(e.target.value)} placeholder="Contoh: Transfer dari Bank Mandiri"></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={() => setIsTopupModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary px-6">Proses Topup</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Agents;