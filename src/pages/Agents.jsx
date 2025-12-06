import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Users, CreditCard, Building, Plus, Network, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Agents = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/agents');
    
    // State untuk List Cabang (Induk)
    const [branches, setBranches] = useState([]);
    
    // State UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    
    const initialForm = { 
        name: '', email: '', phone: '', 
        code: '', 
        type: 'agent', // Default 'agent' (Reguler)
        parent_branch_id: '', 
        bank_name: '', bank_account_number: '',
        city: ''
    };
    const [form, setForm] = useState(initialForm);

    // Load daftar cabang saat modal dibuka
    useEffect(() => {
        if (isModalOpen) {
            api.get('umh/v1/agent-branches').then(res => {
                if (res.data.success) setBranches(res.data.data);
            });
        }
    }, [isModalOpen]);

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Validasi Wajib Induk untuk Agen Reguler
        if (form.type === 'agent' && !form.parent_branch_id) {
            return toast.error("Agen Reguler wajib memilih Induk Cabang!");
        }

        try {
            const endpoint = mode === 'edit' ? `umh/v1/agents/${form.id}` : 'umh/v1/agents';
            const method = mode === 'edit' ? 'put' : 'post';
            
            await api[method](endpoint, form);
            
            setIsModalOpen(false);
            fetchData();
            toast.success(mode === 'create' ? "Mitra berhasil didaftarkan" : "Data mitra diperbarui");
        } catch (e) { 
            toast.error("Gagal simpan: " + (e.response?.data?.message || e.message)); 
        }
    };

    const columns = [
        { header: 'Nama Mitra', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    {r.type === 'branch' ? 
                        <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"><Building size={10}/> Cabang</span> : 
                        <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"><Users size={10}/> Agen Reguler</span>
                    }
                </div>
            </div>
        )},
        { header: 'Kode', accessor: 'code', render: r => <code className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-xs font-mono text-gray-600">{r.code}</code> },
        { header: 'Induk (Upline)', accessor: 'parent_name', render: r => (
            <div className="text-sm">
                {r.type === 'branch' ? 
                    <span className="text-gray-400 italic text-xs">- Head Office -</span> : 
                    <span className="font-medium text-gray-700">{r.parent_name || 'Kantor Pusat'}</span>
                }
            </div>
        )},
        { header: 'Lokasi & Kontak', accessor: 'city', render: r => (
            <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-1"><MapPin size={10}/> {r.city || '-'}</div>
                <div>{r.phone}</div>
            </div>
        )},
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kemitraan & Cabang</h1>
                    <p className="text-sm text-gray-500">Manajemen struktur cabang daerah dan agen reguler.</p>
                </div>
                <button onClick={() => { setForm(initialForm); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Mitra
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Building size={24}/></div>
                    <div><div className="text-xs text-gray-500 uppercase font-bold">Total Cabang</div><div className="text-xl font-bold text-gray-800">{data.filter(a=>a.type==='branch').length}</div></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24}/></div>
                    <div><div className="text-xs text-gray-500 uppercase font-bold">Total Agen</div><div className="text-xl font-bold text-gray-800">{data.filter(a=>a.type==='agent').length}</div></div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(r)=>{setForm(r); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title={mode==='create'?"Registrasi Mitra Baru":"Edit Data Mitra"}>
                <form onSubmit={handleSave} className="space-y-5">
                    
                    {/* SECTION 1: STRUKTUR */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                        <h4 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2 tracking-wider">
                            <Network size={14}/> Struktur Organisasi
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Tipe Kemitraan</label>
                                <select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                                    <option value="agent">Agen Reguler</option>
                                    <option value="branch">Kantor Cabang</option>
                                </select>
                            </div>
                            
                            {/* Kondisional: Induk hanya muncul jika Agen */}
                            {form.type === 'agent' && (
                                <div>
                                    <label className="label">Induk Cabang (Upline)</label>
                                    <select 
                                        className="input-field border-blue-300 bg-white shadow-sm focus:ring-blue-200" 
                                        value={form.parent_branch_id} 
                                        onChange={e=>setForm({...form, parent_branch_id:e.target.value})}
                                        required
                                    >
                                        <option value="">-- Pilih Induk --</option>
                                        <option value="1" className="font-bold text-blue-700">★ Kantor Pusat (Default)</option>
                                        {branches.filter(b => b.id != 1).map(b => (
                                            <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-500 mt-1">Agen wajib terdaftar di bawah satu cabang/pusat.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 2: IDENTITAS */}
                    <div className="space-y-4">
                        <div>
                            <label className="label">Nama Lengkap / Nama Travel</label>
                            <input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required placeholder="Contoh: Amanah Tour (Budi Santoso)"/>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">No. HP / WhatsApp</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/></div>
                            <div><label className="label">Kota Domisili</label><input className="input-field" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}/></div>
                        </div>
                        <div><label className="label">Email (Opsional)</label><input type="email" className="input-field" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></div>
                    </div>
                    
                    {/* SECTION 3: BANK */}
                    <div className="border-t pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><CreditCard size={12}/> Rekening Pencairan Komisi</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">Nama Bank</label><input className="input-field" placeholder="BCA / Mandiri" value={form.bank_name} onChange={e=>setForm({...form, bank_name:e.target.value})}/></div>
                            <div><label className="label">No. Rekening</label><input className="input-field" value={form.bank_account_number} onChange={e=>setForm({...form, bank_account_number:e.target.value})}/></div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                        <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Agents;