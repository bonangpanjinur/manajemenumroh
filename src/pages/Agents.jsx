import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Users, CreditCard, Building, Plus, Copy, Network } from 'lucide-react';
import toast from 'react-hot-toast';

const Agents = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/agents');
    
    // State untuk List Cabang (Parent)
    const [branches, setBranches] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    
    // Initial Form
    const initialForm = { 
        name: '', email: '', phone: '', 
        code: '', 
        type: 'agent', // Default agent
        parent_branch_id: '', // Wajib jika type agent
        bank_name: '', bank_account_number: '',
        city: ''
    };
    const [form, setForm] = useState(initialForm);

    // Load Data Cabang saat modal dibuka
    useEffect(() => {
        if (isModalOpen) {
            api.get('umh/v1/agent-branches').then(res => {
                if (res.data.success) setBranches(res.data.data);
            });
        }
    }, [isModalOpen]);

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Validasi: Agen harus punya induk
        if (form.type === 'agent' && !form.parent_branch_id) {
            return toast.error("Agen Reguler wajib memilih Induk Cabang (Pusat/Cabang)");
        }

        try {
            if (mode === 'create') await api.post('umh/v1/agents', form);
            else await api.put(`umh/v1/agents/${form.id}`, form);
            
            setIsModalOpen(false);
            fetchData();
            toast.success("Data Mitra Disimpan");
        } catch (e) { 
            toast.error("Gagal simpan: " + (e.response?.data?.message || e.message)); 
        }
    };

    const columns = [
        { header: 'Nama Mitra', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    {r.type === 'branch' ? <Building size={10} className="text-purple-500"/> : <Users size={10}/>}
                    <span className="uppercase">{r.type === 'branch' ? 'Cabang Resmi' : 'Agen Reguler'}</span>
                </div>
            </div>
        )},
        { header: 'Kode', accessor: 'code', render: r => <code className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-blue-600">{r.code}</code> },
        { header: 'Induk (Upline)', accessor: 'parent_name', render: r => (
            <div className="text-sm text-gray-600">
                {r.type === 'branch' ? <span className="text-purple-600 font-bold">- (Head)</span> : (r.parent_name || 'Pusat')}
            </div>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => <div className="text-xs"><div>{r.phone}</div><div className="text-gray-400">{r.city}</div></div> },
        { header: 'Total Jemaah', accessor: 'id', render: r => <span className="font-bold text-center block">-</span> } // Placeholder
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kemitraan & Cabang</h1>
                    <p className="text-sm text-gray-500">Manajemen struktur cabang dan agen reguler.</p>
                </div>
                <button onClick={() => { setForm(initialForm); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Mitra
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Building size={24}/></div>
                    <div><div className="text-sm text-gray-500">Total Cabang</div><div className="text-xl font-bold">{data.filter(a=>a.type==='branch').length}</div></div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24}/></div>
                    <div><div className="text-sm text-gray-500">Total Agen</div><div className="text-xl font-bold">{data.filter(a=>a.type==='agent').length}</div></div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(r)=>{setForm(r); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title={mode==='create'?"Registrasi Mitra":"Edit Mitra"}>
                <form onSubmit={handleSave} className="space-y-4">
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                        <h4 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2"><Network size={12}/> Struktur Kemitraan</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Tipe Kemitraan</label>
                                <select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                                    <option value="agent">Agen Reguler</option>
                                    <option value="branch">Cabang (Master)</option>
                                </select>
                            </div>
                            
                            {/* Dropdown Parent HANYA muncul jika tipe adalah AGEN */}
                            {form.type === 'agent' && (
                                <div>
                                    <label className="label">Induk Cabang (Upline)</label>
                                    <select 
                                        className="input-field border-blue-300 bg-white" 
                                        value={form.parent_branch_id} 
                                        onChange={e=>setForm({...form, parent_branch_id:e.target.value})}
                                        required
                                    >
                                        <option value="">-- Pilih Induk --</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="text-[10px] text-blue-600">
                            {form.type === 'branch' 
                                ? 'Cabang dapat memiliki banyak Agen Reguler di bawahnya.' 
                                : 'Agen Reguler wajib menginduk ke salah satu Cabang/Pusat.'}
                        </div>
                    </div>

                    <div><label className="label">Nama Lengkap / Nama Travel</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">No. HP / WA</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/></div>
                        <div><label className="label">Kota Domisili</label><input className="input-field" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}/></div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Data Bank (Pencairan Komisi)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">Nama Bank</label><input className="input-field" placeholder="BCA" value={form.bank_name} onChange={e=>setForm({...form, bank_name:e.target.value})}/></div>
                            <div><label className="label">No. Rekening</label><input className="input-field" value={form.bank_account_number} onChange={e=>setForm({...form, bank_account_number:e.target.value})}/></div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4"><button className="btn-primary w-full">Simpan Data</button></div>
                </form>
            </Modal>
        </div>
    );
};

export default Agents;