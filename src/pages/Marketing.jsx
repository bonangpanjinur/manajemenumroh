import React, { useState } from 'react';
import useCRUD from '../hooks/useCRUD';
import { Kanban, Phone, User, Plus, MessageSquare, ArrowRight } from 'lucide-react';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Marketing = () => {
    const { data: leads = [], loading, fetchData } = useCRUD('umh/v1/leads');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', source: 'Instagram', status: 'new', notes: '' });

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`umh/v1/leads/${id}`, { status: newStatus });
            toast.success("Status prospek diperbarui");
            fetchData(); // Refresh UI
        } catch (e) { toast.error("Gagal update status"); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/leads', form);
            setIsModalOpen(false);
            fetchData();
            toast.success("Lead baru ditambahkan");
        } catch (e) { toast.error("Gagal simpan lead"); }
    };

    const stages = [
        { id: 'new', label: 'Baru Masuk', color: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700' },
        { id: 'contacted', label: 'Sedang Follow-up', color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
        { id: 'hot', label: 'Hot Prospek', color: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
        { id: 'deal', label: 'Closing / Deal', color: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' }
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Marketing CRM</h1>
                    <p className="text-sm text-gray-500">Pipeline penjualan dan manajemen calon jemaah.</p>
                </div>
                <button onClick={()=>{setForm({name:'', phone:'', source:'Instagram', status:'new', notes:''}); setIsModalOpen(true)}} className="btn-primary flex gap-2">
                    <Plus size={18}/> Tambah Leads
                </button>
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-4 min-w-[1200px] h-full">
                    {stages.map((stage, index) => {
                        const stageLeads = Array.isArray(leads) ? leads.filter(l => l.status === stage.id) : [];
                        return (
                            <div key={stage.id} className={`flex-1 min-w-[280px] rounded-xl ${stage.color} border ${stage.border} flex flex-col`}>
                                {/* Stage Header */}
                                <div className={`p-4 font-bold ${stage.text} flex justify-between items-center border-b ${stage.border} bg-white/50 rounded-t-xl`}>
                                    <span>{stage.label}</span>
                                    <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm border">{stageLeads.length}</span>
                                </div>
                                
                                {/* Leads List (Droppable Area Idea) */}
                                <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                    {stageLeads.map(lead => (
                                        <div key={lead.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-gray-800 flex items-center gap-2">
                                                    <User size={16} className="text-gray-400"/> {lead.name}
                                                </div>
                                                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{lead.source}</span>
                                            </div>
                                            
                                            <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                                <Phone size={12}/> {lead.phone || '-'}
                                            </div>

                                            {lead.notes && (
                                                <div className="mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100 flex gap-2">
                                                    <MessageSquare size={12} className="shrink-0 mt-0.5"/> {lead.notes}
                                                </div>
                                            )}

                                            <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                 {/* Move Prev */}
                                                 {index > 0 ? (
                                                    <button onClick={()=>updateStatus(lead.id, stages[index-1].id)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100">
                                                        ← Mundur
                                                    </button>
                                                 ) : <div></div>}

                                                 {/* Move Next */}
                                                 {index < stages.length - 1 && (
                                                    <button onClick={()=>updateStatus(lead.id, stages[index+1].id)} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded font-medium flex items-center gap-1">
                                                        Lanjut <ArrowRight size={12}/>
                                                    </button>
                                                 )}
                                            </div>
                                        </div>
                                    ))}
                                    {stageLeads.length === 0 && <div className="text-center text-xs text-gray-400 py-8 italic">Belum ada data</div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title="Input Leads Baru">
                <form onSubmit={handleSave} className="space-y-4">
                    <div><label className="label">Nama Prospek</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    <div><label className="label">Nomor WhatsApp</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="628..."/></div>
                    <div><label className="label">Sumber Datang</label><select className="input-field" value={form.source} onChange={e=>setForm({...form, source:e.target.value})}><option value="Instagram">Instagram</option><option value="Facebook">Facebook Ads</option><option value="TikTok">TikTok</option><option value="Website">Website</option><option value="Walk-in">Datang Langsung</option></select></div>
                    <div><label className="label">Catatan Awal</label><textarea className="input-field" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Kebutuhan jemaah (misal: Mau berangkat Ramadhan)"/></div>
                    <button className="btn-primary w-full mt-4">Simpan Leads</button>
                </form>
            </Modal>
        </div>
    );
};
export default Marketing;