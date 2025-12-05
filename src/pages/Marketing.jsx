import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Kanban, Phone, User, CheckCircle, XCircle, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Marketing = () => {
    // Kita gunakan tabel 'leads' sebagai inti CRM
    const { data: leads, loading, fetchData } = useCRUD('umh/v1/leads');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', source: 'Instagram', status: 'new', notes: '' });

    // Helper untuk mengubah status Lead (Drag & Drop simulasi dengan tombol)
    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`umh/v1/leads/${id}`, { status: newStatus });
            toast.success("Status Updated");
            fetchData();
        } catch (e) { toast.error("Gagal update status"); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/leads', form);
            setIsModalOpen(false);
            fetchData();
            toast.success("Lead ditambahkan");
        } catch (e) { toast.error("Gagal simpan"); }
    };

    // Pipeline Columns
    const stages = [
        { id: 'new', label: 'Leads Baru', color: 'bg-gray-100', text: 'text-gray-700' },
        { id: 'contacted', label: 'Dihubungi', color: 'bg-blue-50', text: 'text-blue-700' },
        { id: 'hot', label: 'Hot Prospek', color: 'bg-orange-50', text: 'text-orange-700' },
        { id: 'deal', label: 'Closing / Deal', color: 'bg-green-50', text: 'text-green-700' }
    ];

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Marketing CRM</h1>
                    <p className="text-sm text-gray-500">Pipeline penjualan dan manajemen calon jemaah.</p>
                </div>
                <button onClick={()=>{setForm({name:'', phone:'', source:'Instagram', status:'new'}); setIsModalOpen(true)}} className="btn-primary flex gap-2">
                    <Plus size={18}/> Tambah Leads
                </button>
            </div>

            {/* KANBAN BOARD VIEW */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-4 min-w-[1000px] h-full">
                    {stages.map(stage => {
                        const stageLeads = leads.filter(l => l.status === stage.id);
                        return (
                            <div key={stage.id} className={`flex-1 min-w-[250px] rounded-xl ${stage.color} p-4 flex flex-col`}>
                                <div className={`font-bold ${stage.text} mb-3 flex justify-between`}>
                                    <span>{stage.label}</span>
                                    <span className="bg-white px-2 rounded text-sm shadow-sm">{stageLeads.length}</span>
                                </div>
                                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                                    {stageLeads.map(lead => (
                                        <div key={lead.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <div className="font-bold text-gray-800 flex items-center gap-2">
                                                <User size={14}/> {lead.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Phone size={10}/> {lead.phone || '-'}
                                            </div>
                                            <div className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded w-fit mt-2">
                                                Sumber: {lead.source}
                                            </div>
                                            
                                            {/* Action Buttons to move pipeline */}
                                            <div className="mt-3 pt-2 border-t flex justify-end gap-1">
                                                {stage.id !== 'new' && (
                                                    <button onClick={()=>updateStatus(lead.id, stages[stages.findIndex(s=>s.id===stage.id)-1].id)} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Mundur">←</button>
                                                )}
                                                {stage.id !== 'deal' && (
                                                    <button onClick={()=>updateStatus(lead.id, stages[stages.findIndex(s=>s.id===stage.id)+1].id)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Maju">→ Next</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {stageLeads.length === 0 && <div className="text-center text-gray-400 text-xs italic py-4">Belum ada data</div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title="Input Leads Baru">
                <form onSubmit={handleSave} className="space-y-4">
                    <div><label className="label">Nama Prospek</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    <div><label className="label">No. WhatsApp</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required/></div>
                    <div>
                        <label className="label">Sumber</label>
                        <select className="input-field" value={form.source} onChange={e=>setForm({...form, source:e.target.value})}>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Website">Website</option>
                            <option value="Referral">Referral</option>
                            <option value="Offline">Event / Offline</option>
                        </select>
                    </div>
                    <div><label className="label">Catatan</label><textarea className="input-field" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}></textarea></div>
                    <div className="flex justify-end pt-4"><button className="btn-primary">Simpan Leads</button></div>
                </form>
            </Modal>
        </div>
    );
};

export default Marketing;