import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Users, CreditCard, Share2, Plus, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const Agents = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/agents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', code: '', type: 'agent', bank_name: '', bank_account_number: '' });
    const [mode, setMode] = useState('create');

    // Generate random code for new agent
    const generateCode = () => {
        const code = 'AG-' + Math.floor(1000 + Math.random() * 9000);
        setForm(prev => ({ ...prev, code: code }));
    }

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/agents', form);
            else await api.put(`umh/v1/agents/${form.id}`, form); // Assuming ID exists on edit
            setIsModalOpen(false);
            fetchData();
            toast.success("Data Agen Disimpan");
        } catch (e) { toast.error("Gagal simpan"); }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success("Kode disalin");
    };

    const columns = [
        { header: 'Agen / Mitra', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500">{r.type.toUpperCase()}</div>
            </div>
        )},
        { header: 'Kode Referral', accessor: 'code', render: r => (
            <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-200 w-fit cursor-pointer hover:bg-gray-100" onClick={() => copyCode(r.code)}>
                <span className="font-mono font-bold text-blue-600">{r.code}</span>
                <Copy size={12} className="text-gray-400"/>
            </div>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div className="text-xs">
                <div>{r.phone}</div>
                <div className="text-gray-400">{r.email}</div>
            </div>
        )},
        { header: 'Bank', accessor: 'bank_name', render: r => (
            <div className="text-xs">
                <div>{r.bank_name}</div>
                <div className="font-mono">{r.bank_account_number}</div>
            </div>
        )},
        // Simulasi Data Kinerja (Harusnya dari API Backend yang menghitung total jamaah)
        { header: 'Total Jemaah', accessor: 'id', render: r => <span className="font-bold text-center block">0</span> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kemitraan & Agen</h1>
                    <p className="text-sm text-gray-500">Manajemen mitra penjualan dan komisi.</p>
                </div>
                <button onClick={() => { setForm({name:'', email:'', phone:'', code:'', type:'agent', bank_name:'', bank_account_number:''}); generateCode(); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Mitra Baru
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm">Total Agen Aktif</p>
                            <h3 className="text-3xl font-bold mt-1">{data.length}</h3>
                        </div>
                        <Users className="opacity-20" size={40}/>
                    </div>
                </div>
                 <div className="bg-white rounded-xl p-4 border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm">Total Komisi (Pending)</p>
                            <h3 className="text-2xl font-bold mt-1 text-gray-800">Rp 0</h3>
                        </div>
                        <CreditCard className="text-orange-500" size={24}/>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title={mode==='create'?"Registrasi Mitra":"Edit Mitra"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Kode Agen (Auto)</label><input className="input-field bg-gray-100 font-mono" value={form.code} readOnly /></div>
                        <div>
                            <label className="label">Tipe Kemitraan</label>
                            <select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                                <option value="agent">Agen Reguler</option>
                                <option value="master">Master Agen (Perwakilan)</option>
                                <option value="freelance">Freelance</option>
                            </select>
                        </div>
                    </div>
                    <div><label className="label">Nama Lengkap</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">No. HP / WA</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required/></div>
                        <div><label className="label">Email</label><input className="input-field" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Rekening Pencairan Komisi</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">Nama Bank</label><input className="input-field" placeholder="BCA/Mandiri" value={form.bank_name} onChange={e=>setForm({...form, bank_name:e.target.value})}/></div>
                            <div><label className="label">No. Rekening</label><input className="input-field" type="number" value={form.bank_account_number} onChange={e=>setForm({...form, bank_account_number:e.target.value})}/></div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4"><button className="btn-primary w-full">Simpan Data Mitra</button></div>
                </form>
            </Modal>
        </div>
    );
};

export default Agents;