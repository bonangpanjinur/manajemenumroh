import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Megaphone, Users, Phone } from 'lucide-react';
import { formatDate } from '../utils/formatters'; // Import formatter tanggal jika ada
import toast from 'react-hot-toast';

const Marketing = () => {
    const [activeTab, setActiveTab] = useState('leads'); 

    // Endpoint API (Sudah sesuai dengan backend baru yang pakai tanda hubung)
    const leads = useCRUD('umh/v1/marketing-leads');
    const campaigns = useCRUD('umh/v1/marketing-campaigns');

    useEffect(() => {
        if (activeTab === 'leads') leads.fetchData();
        else campaigns.fetchData();
    }, [activeTab]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [modalMode, setModalMode] = useState('create');
    const [currentId, setCurrentId] = useState(null);

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        if (item) {
            setFormData(item);
            setCurrentId(item.id);
        } else {
            // Reset form default
            setFormData({
                status: 'new',
                source: 'walk_in',
                budget: 0,
                platform: 'Instagram'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const apiHook = activeTab === 'leads' ? leads : campaigns;
        const success = modalMode === 'create' 
            ? await apiHook.createItem(formData)
            : await apiHook.updateItem(currentId, formData);
        
        if (success) setIsModalOpen(false);
    };

    const handleDelete = async (apiHook, item) => {
        if (item && item.id) {
            await apiHook.deleteItem(item.id);
        }
    };

    // -- Columns Definition --
    const leadColumns = [
        { header: 'Nama', accessor: 'name', className: 'font-bold' },
        { header: 'WhatsApp', accessor: 'phone', render: r => <span className="text-green-600 font-mono">{r.phone}</span> },
        { header: 'Sumber', accessor: 'source', render: r => <span className="badge bg-gray-100 uppercase text-xs">{r.source}</span> },
        { header: 'Status', accessor: 'status', render: r => {
             const colors = { new: 'bg-blue-100 text-blue-800', contacted: 'bg-yellow-100 text-yellow-800', interested: 'bg-purple-100 text-purple-800', closed: 'bg-green-100 text-green-800', lost: 'bg-red-100 text-red-800'};
             return <span className={`badge px-2 py-1 rounded text-xs font-bold uppercase ${colors[r.status] || 'bg-gray-100'}`}>{r.status}</span> 
        }},
        { header: 'Follow Up', accessor: 'follow_up_date', render: r => r.follow_up_date ? formatDate(r.follow_up_date) : '-' }
    ];

    const campaignColumns = [
        { header: 'Judul', accessor: 'title', className: 'font-bold' },
        { header: 'Platform', accessor: 'platform' },
        { header: 'Budget', accessor: 'budget' },
        { header: 'Status', accessor: 'status', render: r => <span className="badge bg-green-100 text-green-800 uppercase text-xs">{r.status}</span> }
    ];

    return (
        <Layout title="Marketing & Leads">
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                <button className={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'leads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('leads')}>
                    <Users size={18} className="inline mr-2"/> Leads (Calon Jemaah)
                </button>
                <button className={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'campaigns' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('campaigns')}>
                    <Megaphone size={18} className="inline mr-2"/> Kampanye Iklan
                </button>
            </div>

            <div className="flex justify-end mb-4">
                <button onClick={() => openModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah Data
                </button>
            </div>

            {activeTab === 'leads' ? (
                <CrudTable 
                    columns={leadColumns} 
                    data={leads.data} 
                    loading={leads.loading} 
                    onDelete={(item) => handleDelete(leads, item)} 
                    onEdit={i => openModal('edit', i)} 
                />
            ) : (
                <CrudTable 
                    columns={campaignColumns} 
                    data={campaigns.data} 
                    loading={campaigns.loading} 
                    onDelete={(item) => handleDelete(campaigns, item)} 
                    onEdit={i => openModal('edit', i)} 
                />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'leads' ? "Data Lead (Prospek)" : "Data Kampanye"}>
                <form onSubmit={handleSave} className="space-y-4">
                    {activeTab === 'leads' ? (
                        <>
                            {/* Input Leads Lengkap */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Nama Lengkap</label>
                                    <input className="input-field" value={formData.name||''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="label">No. WhatsApp</label>
                                    <input className="input-field" value={formData.phone||''} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Sumber</label>
                                    <select className="input-field" value={formData.source||'walk_in'} onChange={e => setFormData({...formData, source: e.target.value})}>
                                        <option value="walk_in">Walk In (Datang)</option>
                                        <option value="ig">Instagram</option>
                                        <option value="fb">Facebook</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="referral">Rekomendasi</option>
                                        <option value="website">Website</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Status Prospek</label>
                                    <select className="input-field" value={formData.status||'new'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="new">Baru (New)</option>
                                        <option value="contacted">Dihubungi</option>
                                        <option value="interested">Tertarik (Hot)</option>
                                        <option value="closed">Closing (Deal)</option>
                                        <option value="lost">Batal / Lost</option>
                                    </select>
                                </div>
                            </div>

                            {/* FIX: Field Tanggal Follow Up Ditambahkan */}
                            <div>
                                <label className="label">Tanggal Follow Up Berikutnya</label>
                                <input type="date" className="input-field" value={formData.follow_up_date||''} onChange={e => setFormData({...formData, follow_up_date: e.target.value})} />
                                <p className="text-xs text-gray-400 mt-1">Kapan Anda harus menghubungi orang ini lagi?</p>
                            </div>

                            {/* FIX: Field Catatan Ditambahkan */}
                            <div>
                                <label className="label">Catatan / Hasil Diskusi</label>
                                <textarea className="input-field" rows="3" value={formData.notes||''} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Misal: Jemaah minta dihubungi sore hari, tertarik paket Ramadhan..."></textarea>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Input Campaign */}
                            <div><label className="label">Judul Kampanye</label><input className="input-field" value={formData.title||''} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Platform</label><input className="input-field" value={formData.platform||''} onChange={e => setFormData({...formData, platform: e.target.value})} placeholder="FB/IG" /></div>
                                <div><label className="label">Budget (Rp)</label><input type="number" className="input-field" value={formData.budget||''} onChange={e => setFormData({...formData, budget: e.target.value})} /></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Tanggal Mulai</label><input type="date" className="input-field" value={formData.start_date||''} onChange={e => setFormData({...formData, start_date: e.target.value})} /></div>
                                <div><label className="label">Tanggal Selesai</label><input type="date" className="input-field" value={formData.end_date||''} onChange={e => setFormData({...formData, end_date: e.target.value})} /></div>
                            </div>

                            <div>
                                <label className="label">Status</label>
                                <select className="input-field" value={formData.status||'active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="active">Aktif</option>
                                    <option value="paused">Jeda (Paused)</option>
                                    <option value="completed">Selesai</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div className="flex justify-end pt-4 gap-2 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Data</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Marketing;