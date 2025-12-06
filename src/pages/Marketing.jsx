import React, { useState } from 'react';
import useCRUD from '../hooks/useCRUD';
import { Kanban, Phone, User, Plus, MessageSquare, ArrowRight, Megaphone, Calendar, DollarSign, Target, BarChart2 } from 'lucide-react';
import Modal from '../components/Modal';
import CrudTable from '../components/CrudTable';
import toast from 'react-hot-toast';
import api from '../utils/api';

// --- SUB-COMPONENT: LEADS KANBAN (CRM) ---
const LeadsKanban = () => {
    const { data: leads = [], loading, fetchData } = useCRUD('umh/v1/leads');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', source: 'Instagram', status: 'new', notes: '' });

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`umh/v1/leads/${id}`, { status: newStatus });
            toast.success("Status prospek diperbarui");
            fetchData();
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
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-700">Pipeline Penjualan</h3>
                <button onClick={()=>{setForm({name:'', phone:'', source:'Instagram', status:'new', notes:''}); setIsModalOpen(true)}} className="btn-primary flex gap-2 py-2 text-xs">
                    <Plus size={14}/> Tambah Leads
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-4 min-w-[1000px] h-full">
                    {stages.map((stage, index) => {
                        const stageLeads = Array.isArray(leads) ? leads.filter(l => l.status === stage.id) : [];
                        return (
                            <div key={stage.id} className={`flex-1 min-w-[260px] rounded-xl ${stage.color} border ${stage.border} flex flex-col`}>
                                <div className={`p-3 font-bold ${stage.text} flex justify-between items-center border-b ${stage.border} bg-white/50 rounded-t-xl`}>
                                    <span>{stage.label}</span>
                                    <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm border">{stageLeads.length}</span>
                                </div>
                                <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar max-h-[calc(100vh-300px)]">
                                    {stageLeads.map(lead => (
                                        <div key={lead.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                                    <User size={14} className="text-gray-400"/> {lead.name}
                                                </div>
                                                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{lead.source}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                                                <Phone size={12}/> {lead.phone || '-'}
                                            </div>
                                            {lead.notes && (
                                                <div className="mt-2 text-[10px] text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100 flex gap-2">
                                                    <MessageSquare size={10} className="shrink-0 mt-0.5"/> {lead.notes}
                                                </div>
                                            )}
                                            <div className="mt-3 pt-2 border-t border-dashed flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                 {index > 0 ? <button onClick={()=>updateStatus(lead.id, stages[index-1].id)} className="text-[10px] text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100">← Mundur</button> : <div></div>}
                                                 {index < stages.length - 1 && <button onClick={()=>updateStatus(lead.id, stages[index+1].id)} className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded font-medium flex items-center gap-1">Lanjut <ArrowRight size={10}/></button>}
                                            </div>
                                        </div>
                                    ))}
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
                    <div><label className="label">Catatan Awal</label><textarea className="input-field" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Kebutuhan jemaah..."/></div>
                    <button className="btn-primary w-full mt-4">Simpan Leads</button>
                </form>
            </Modal>
        </div>
    );
};

// --- SUB-COMPONENT: CAMPAIGN LIST (MANAJEMEN IKLAN) ---
const CampaignList = () => {
    const { data: campaigns = [], loading, fetchData, deleteItem } = useCRUD('umh/v1/marketing');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', platform: 'Meta Ads', budget: 0, start_date: '', end_date: '', status: 'active' });
    const [mode, setMode] = useState('create');

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = mode === 'edit' ? `umh/v1/marketing/${form.id}` : 'umh/v1/marketing';
            const method = mode === 'edit' ? 'put' : 'post';
            await api[method](endpoint, form);
            setIsModalOpen(false);
            fetchData();
            toast.success("Campaign tersimpan");
        } catch (e) { toast.error("Gagal simpan"); }
    };

    const columns = [
        { header: 'Nama Campaign', accessor: 'title', render: r => <div><div className="font-bold text-gray-800">{r.title}</div><div className="text-xs text-gray-500">{r.platform}</div></div> },
        { header: 'Budget', accessor: 'budget', render: r => <span className="font-mono text-sm">Rp {new Intl.NumberFormat('id-ID').format(r.budget)}</span> },
        { header: 'Periode', accessor: 'start_date', render: r => <div className="text-xs text-gray-600 flex items-center gap-1"><Calendar size={12}/> {r.start_date} s/d {r.end_date}</div> },
        { header: 'Status', accessor: 'status', render: r => <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${r.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{r.status}</span> }
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-700">Manajemen Iklan & Campaign</h3>
                <button onClick={()=>{setForm({ title: '', platform: 'Meta Ads', budget: 0, start_date: '', end_date: '', status: 'active' }); setMode('create'); setIsModalOpen(true)}} className="btn-primary flex gap-2 py-2 text-xs">
                    <Plus size={14}/> Buat Campaign
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={campaigns} loading={loading} onDelete={deleteItem} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title={mode==='create'?"Buat Campaign Iklan":"Edit Campaign"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div><label className="label">Nama Campaign</label><input className="input-field" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required placeholder="Contoh: Promo Ramadhan Batch 1"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Platform</label><select className="input-field" value={form.platform} onChange={e=>setForm({...form, platform:e.target.value})}><option value="Meta Ads">Meta Ads (FB/IG)</option><option value="Google Ads">Google Ads</option><option value="TikTok Ads">TikTok Ads</option><option value="Influencer">Influencer</option><option value="Offline">Brosur / Spanduk</option></select></div>
                        <div><label className="label">Budget (Rp)</label><input type="number" className="input-field" value={form.budget} onChange={e=>setForm({...form, budget:e.target.value})}/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Tanggal Mulai</label><input type="date" className="input-field" value={form.start_date} onChange={e=>setForm({...form, start_date:e.target.value})}/></div>
                        <div><label className="label">Tanggal Selesai</label><input type="date" className="input-field" value={form.end_date} onChange={e=>setForm({...form, end_date:e.target.value})}/></div>
                    </div>
                    <div><label className="label">Status</label><select className="input-field" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}><option value="active">Aktif Tayang</option><option value="paused">Dihentikan Sementara</option><option value="completed">Selesai</option></select></div>
                    <button className="btn-primary w-full mt-4">Simpan Campaign</button>
                </form>
            </Modal>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const Marketing = () => {
    const [activeTab, setActiveTab] = useState('leads');

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Marketing Center</h1>
                    <p className="text-sm text-gray-500">Pusat pengelolaan prospek dan aktivitas periklanan.</p>
                </div>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <button onClick={()=>setActiveTab('leads')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab==='leads'?'bg-blue-600 text-white shadow':'text-gray-500 hover:text-gray-800'}`}>
                        <Target size={16}/> Pipeline Leads
                    </button>
                    <button onClick={()=>setActiveTab('campaigns')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab==='campaigns'?'bg-blue-600 text-white shadow':'text-gray-500 hover:text-gray-800'}`}>
                        <Megaphone size={16}/> Iklan & Campaign
                    </button>
                </div>
            </div>

            {activeTab === 'leads' ? <LeadsKanban /> : <CampaignList />}
        </div>
    );
};

export default Marketing;