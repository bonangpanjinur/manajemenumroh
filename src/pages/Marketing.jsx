import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Target, Phone, Mail, Megaphone, BarChart, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Marketing = () => {
    const [activeTab, setActiveTab] = useState('leads');

    return (
        <Layout title="Marketing & CRM">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
                <button onClick={() => setActiveTab('leads')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'leads' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Target size={16} /> Database Leads (Prospek)
                </button>
                <button onClick={() => setActiveTab('campaigns')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'campaigns' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Megaphone size={16} /> Kampanye Iklan
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-1">
                {activeTab === 'leads' ? <LeadsTab /> : <CampaignsTab />}
            </div>
        </Layout>
    );
};

// --- TAB LEADS ---
const LeadsTab = () => {
    const { data, loading, fetchData } = useCRUD('umh/v1/marketing/leads');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'WA', status: 'new' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/marketing/leads', form);
            toast.success("Lead berhasil dicatat");
            setIsModalOpen(false);
            fetchData();
            setForm({ name: '', phone: '', email: '', source: 'WA', status: 'new' });
        } catch(e) { toast.error("Gagal simpan"); }
    };

    const columns = [
        { header: 'Nama Prospek', accessor: 'name', render: r => <div className="font-bold text-gray-800">{r.name}</div> },
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div className="text-sm">
                <div className="flex items-center gap-1 text-gray-700"><Phone size={12}/> {r.phone}</div>
                {r.email && <div className="flex items-center gap-1 text-gray-500"><Mail size={12}/> {r.email}</div>}
            </div>
        )},
        { header: 'Sumber', accessor: 'source', render: r => <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{r.source}</span> },
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                r.status === 'new' ? 'bg-blue-100 text-blue-700' :
                r.status === 'deal' ? 'bg-green-100 text-green-700' :
                r.status === 'hot' ? 'bg-orange-100 text-orange-700' : 
                'bg-gray-100 text-gray-600'
            }`}>{r.status}</span>
        )},
        { header: 'Tgl Masuk', accessor: 'created_at', render: r => formatDate(r.created_at) },
    ];

    return (
        <>
            <div className="p-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Daftar Calon Jemaah</h3>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/> Tambah Lead</button>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Input Data Prospek">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Prospek</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">No. WhatsApp</label><input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
                        <div><label className="label">Email (Opsional)</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Sumber Info</label>
                            <select className="input-field" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                                <option value="WA">WhatsApp</option>
                                <option value="IG">Instagram</option>
                                <option value="FB">Facebook Ads</option>
                                <option value="Walk-in">Datang Langsung</option>
                                <option value="Website">Website</option>
                                <option value="Referral">Referral Jemaah</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Status Awal</label>
                            <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="new">New (Baru Masuk)</option>
                                <option value="contacted">Contacted (Dihubungi)</option>
                                <option value="hot">Hot (Potensial)</option>
                                <option value="deal">Deal (Closing)</option>
                                <option value="lost">Lost (Gagal)</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4"><button className="btn-primary">Simpan Prospek</button></div>
                </form>
            </Modal>
        </>
    );
};

// --- TAB CAMPAIGNS ---
const CampaignsTab = () => {
    const { data, loading, fetchData } = useCRUD('umh/v1/marketing/campaigns');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', platform: 'Facebook Ads', budget: 0, start_date: '', end_date: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/marketing/campaigns', form);
            toast.success("Kampanye dibuat");
            setIsModalOpen(false);
            fetchData();
            setForm({ title: '', platform: 'Facebook Ads', budget: 0, start_date: '', end_date: '' });
        } catch(e) { toast.error("Gagal simpan"); }
    };

    const columns = [
        { header: 'Nama Kampanye', accessor: 'title', render: r => <div className="font-bold text-gray-800">{r.title}</div> },
        { header: 'Platform', accessor: 'platform', render: r => <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{r.platform}</span> },
        { header: 'Budget', accessor: 'budget', render: r => <div className="font-mono text-gray-700">{formatCurrency(r.budget)}</div> },
        { header: 'Durasi', accessor: 'start_date', render: r => (
            <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={12}/> {formatDate(r.start_date)} - {formatDate(r.end_date)}
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs uppercase">{r.status}</span> },
    ];

    return (
        <>
            <div className="p-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Manajemen Iklan</h3>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/> Buat Kampanye</button>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Kampanye Iklan">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Judul Kampanye</label><input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Promo Awal Tahun 2025" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Platform</label>
                            <select className="input-field" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                                <option value="Facebook Ads">Facebook Ads</option>
                                <option value="Google Ads">Google Ads</option>
                                <option value="Instagram Ads">Instagram Ads</option>
                                <option value="TikTok Ads">TikTok Ads</option>
                                <option value="Offline">Offline / Banner</option>
                            </select>
                        </div>
                        <div><label className="label">Budget (IDR)</label><input type="number" className="input-field" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Mulai</label><input type="date" className="input-field" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
                        <div><label className="label">Selesai</label><input type="date" className="input-field" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
                    </div>
                    <div className="flex justify-end pt-4"><button className="btn-primary">Simpan Kampanye</button></div>
                </form>
            </Modal>
        </>
    );
};

export default Marketing;