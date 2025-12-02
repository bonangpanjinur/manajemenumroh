import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Megaphone, Users, Phone, Calendar, DollarSign, Edit } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const Marketing = () => {
    const [activeTab, setActiveTab] = useState('leads'); // leads | campaigns
    
    // Hook CRUD terpisah untuk masing-masing endpoint
    const leads = useCRUD('umh/v1/marketing/leads');
    const campaigns = useCRUD('umh/v1/marketing/campaigns');

    // State untuk Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create | edit
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Refresh data saat tab berubah
    useEffect(() => {
        if (activeTab === 'leads') leads.fetchData();
        else campaigns.fetchData();
    }, [activeTab]);

    // Handle Buka Modal (Tambah Baru)
    const handleCreate = () => {
        setModalMode('create');
        setCurrentItem(null);
        setFormData({});
        setIsModalOpen(true);
    };

    // Handle Buka Modal (Edit Data)
    const handleEdit = (item) => {
        setModalMode('edit');
        setCurrentItem(item);
        setFormData({ ...item }); // Copy data item ke form
        setIsModalOpen(true);
    };

    // Handle Simpan (Create / Update)
    const handleSave = async (e) => {
        e.preventDefault();
        const apiHook = activeTab === 'leads' ? leads : campaigns;
        
        let success = false;
        if (modalMode === 'create') {
            success = await apiHook.createItem(formData);
        } else {
            success = await apiHook.updateItem(currentItem.id, formData);
        }

        if (success) {
            setIsModalOpen(false);
            setFormData({});
        }
    };

    // --- KONFIGURASI KOLOM TABEL ---

    // 1. Kolom Leads
    const leadColumns = [
        { header: 'Nama Calon', accessor: 'name', className: 'font-bold' },
        { header: 'WhatsApp', accessor: 'phone', render: r => (
            <div className="text-green-600 flex gap-2 items-center font-medium">
                <Phone size={14}/> {r.phone}
            </div>
        )},
        { header: 'Sumber', accessor: 'source', render: r => <span className="text-gray-500 capitalize">{r.source?.replace('_', ' ')}</span> },
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                r.status === 'new' ? 'bg-blue-100 text-blue-700' :
                r.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                r.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
            }`}>
                {r.status}
            </span>
        )},
        { header: 'Follow Up', accessor: 'follow_up_date', render: r => r.follow_up_date ? formatDate(r.follow_up_date) : '-' }
    ];

    // 2. Kolom Kampanye (Sudah ada Tanggal Mulai & Selesai)
    const campaignColumns = [
        { header: 'Judul Kampanye', accessor: 'title', className: 'font-bold' },
        { header: 'Platform', accessor: 'platform', render: r => (
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase border border-purple-100">
                {r.platform}
            </span>
        )},
        { header: 'Mulai', accessor: 'start_date', render: r => (
            <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar size={12}/> {formatDate(r.start_date)}
            </div>
        )},
        { header: 'Selesai', accessor: 'end_date', render: r => (
            <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar size={12}/> {formatDate(r.end_date)}
            </div>
        )},
        { header: 'Budget', accessor: 'budget', render: r => (
            <div className="font-medium text-gray-700">
                {formatCurrency(r.budget)}
            </div>
        )}
    ];

    return (
        <Layout title="Marketing & Leads">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('leads')} 
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'leads' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Users size={16} className="mr-2"/> Database Leads
                    </button>
                    <button 
                        onClick={() => setActiveTab('campaigns')} 
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'campaigns' ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Megaphone size={16} className="mr-2"/> Iklan & Kampanye
                    </button>
                </div>
                
                <button onClick={handleCreate} className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
                    <Plus size={18} /> {activeTab === 'leads' ? 'Input Lead Baru' : 'Buat Kampanye Baru'}
                </button>
            </div>

            {/* Main Table */}
            {activeTab === 'leads' ? (
                <CrudTable 
                    columns={leadColumns} 
                    data={leads.data} 
                    loading={leads.loading} 
                    onEdit={handleEdit}   // FITUR EDIT DITAMBAHKAN
                    onDelete={leads.deleteItem} 
                />
            ) : (
                <CrudTable 
                    columns={campaignColumns} 
                    data={campaigns.data} 
                    loading={campaigns.loading} 
                    onEdit={handleEdit}   // FITUR EDIT DITAMBAHKAN
                    onDelete={campaigns.deleteItem} 
                />
            )}

            {/* Modal Form (Dinamis berdasarkan Tab) */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={
                    modalMode === 'edit' 
                        ? (activeTab === 'leads' ? 'Edit Data Lead' : 'Edit Kampanye') 
                        : (activeTab === 'leads' ? 'Input Lead Baru' : 'Buat Kampanye Baru')
                }
            >
                <form onSubmit={handleSave} className="space-y-4">
                    
                    {/* FORM LEADS */}
                    {activeTab === 'leads' && (
                        <>
                            <div>
                                <label className="label">Nama Lengkap</label>
                                <input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Bpk. Ahmad" />
                            </div>
                            <div>
                                <label className="label">No. WhatsApp</label>
                                <input className="input-field" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="08..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Sumber</label>
                                    <select className="input-field" value={formData.source || 'walk_in'} onChange={e => setFormData({...formData, source: e.target.value})}>
                                        <option value="walk_in">Datang Langsung</option>
                                        <option value="ig">Instagram Ads</option>
                                        <option value="fb">Facebook Ads</option>
                                        <option value="wa">WhatsApp Blast</option>
                                        <option value="referral">Referensi Teman</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Status Prospek</label>
                                    <select className="input-field" value={formData.status || 'new'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="new">Baru Masuk</option>
                                        <option value="contacted">Sudah Dihubungi</option>
                                        <option value="interested">Tertarik</option>
                                        <option value="closed">Closing (Daftar)</option>
                                        <option value="lost">Batal / Gagal</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label">Jadwal Follow Up</label>
                                <input type="date" className="input-field" value={formData.follow_up_date || ''} onChange={e => setFormData({...formData, follow_up_date: e.target.value})} />
                            </div>
                        </>
                    )}

                    {/* FORM CAMPAIGNS */}
                    {activeTab === 'campaigns' && (
                        <>
                            <div>
                                <label className="label">Judul Kampanye</label>
                                <input className="input-field" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Contoh: Promo Ramadhan 2024" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Platform</label>
                                    <select className="input-field" value={formData.platform || 'IG'} onChange={e => setFormData({...formData, platform: e.target.value})}>
                                        <option value="IG">Instagram</option>
                                        <option value="FB">Facebook</option>
                                        <option value="Google">Google Ads</option>
                                        <option value="Tiktok">TikTok</option>
                                        <option value="Offline">Brosur / Spanduk</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Budget (Rp)</label>
                                    <input type="number" className="input-field" value={formData.budget || ''} onChange={e => setFormData({...formData, budget: e.target.value})} placeholder="0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div>
                                    <label className="label text-xs uppercase text-gray-500">Tanggal Mulai</label>
                                    <input type="date" className="input-field" value={formData.start_date || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="label text-xs uppercase text-gray-500">Tanggal Selesai</label>
                                    <input type="date" className="input-field" value={formData.end_date || ''} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end pt-4 border-t gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">
                            {modalMode === 'create' ? 'Simpan Data' : 'Update Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Marketing;