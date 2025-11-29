import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Megaphone, Users, Phone, Calendar } from 'lucide-react';

const Marketing = () => {
    const [activeTab, setActiveTab] = useState('leads'); // leads | campaigns

    // Hooks untuk kedua endpoint
    const leads = useCRUD('umh/v1/marketing/leads');
    const campaigns = useCRUD('umh/v1/marketing/campaigns');

    // Fetch data saat tab berubah
    useEffect(() => {
        if (activeTab === 'leads') leads.fetchData();
        else campaigns.fetchData();
    }, [activeTab]);

    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    // Kolom Tabel Leads
    const leadColumns = [
        { header: 'Nama Calon Jemaah', accessor: 'name', className: 'font-bold' },
        { header: 'WhatsApp', accessor: 'phone', render: r => <div className="flex items-center gap-1 text-green-600"><Phone size={14}/> {r.phone}</div> },
        { header: 'Sumber', accessor: 'source', render: r => <span className="badge bg-gray-100">{r.source}</span> },
        { header: 'Status', accessor: 'status', render: r => {
            const colors = { new: 'bg-blue-100 text-blue-700', contacted: 'bg-yellow-100 text-yellow-700', closed: 'bg-green-100 text-green-700' };
            return <span className={`badge text-xs uppercase ${colors[r.status] || 'bg-gray-100'}`}>{r.status}</span>
        }},
        { header: 'Follow Up', accessor: 'follow_up_date', render: r => r.follow_up_date || '-' }
    ];

    // Kolom Tabel Campaigns
    const campaignColumns = [
        { header: 'Judul Kampanye', accessor: 'title', className: 'font-bold' },
        { header: 'Platform', accessor: 'platform', render: r => <span className="uppercase badge bg-purple-50 text-purple-700">{r.platform}</span> },
        { header: 'Budget', accessor: 'budget' },
        { header: 'Status', accessor: 'status' }
    ];

    const handleSave = async (e) => {
        e.preventDefault();
        const apiHook = activeTab === 'leads' ? leads : campaigns;
        if (await apiHook.createItem(formData)) {
            setIsModalOpen(false);
        }
    };

    return (
        <Layout title="Marketing & Leads">
            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                <button 
                    className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'leads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('leads')}
                >
                    <Users size={18}/> Data Calon Jemaah (Leads)
                </button>
                <button 
                    className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'campaigns' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('campaigns')}
                >
                    <Megaphone size={18}/> Kampanye Iklan
                </button>
            </div>

            <div className="flex justify-end mb-4">
                <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah {activeTab === 'leads' ? 'Prospek' : 'Kampanye'}
                </button>
            </div>

            {activeTab === 'leads' ? (
                <CrudTable columns={leadColumns} data={leads.data} loading={leads.loading} onDelete={leads.deleteItem} />
            ) : (
                <CrudTable columns={campaignColumns} data={campaigns.data} loading={campaigns.loading} onDelete={campaigns.deleteItem} />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'leads' ? "Input Calon Jemaah" : "Buat Kampanye Baru"}>
                <form onSubmit={handleSave} className="space-y-4">
                    {activeTab === 'leads' ? (
                        <>
                            <div><label className="label">Nama Lengkap</label><input className="input-field" onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                            <div><label className="label">No. WhatsApp</label><input className="input-field" onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
                            <div>
                                <label className="label">Sumber Datang</label>
                                <select className="input-field" onChange={e => setFormData({...formData, source: e.target.value})}>
                                    <option value="walk_in">Datang Langsung</option>
                                    <option value="ig">Instagram</option>
                                    <option value="fb">Facebook</option>
                                    <option value="referral">Referensi Teman</option>
                                </select>
                            </div>
                            <div><label className="label">Rencana Follow Up</label><input type="date" className="input-field" onChange={e => setFormData({...formData, follow_up_date: e.target.value})} /></div>
                            <div><label className="label">Catatan</label><textarea className="input-field" rows="2" onChange={e => setFormData({...formData, notes: e.target.value})}></textarea></div>
                        </>
                    ) : (
                        <>
                            <div><label className="label">Judul Kampanye</label><input className="input-field" onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                            <div><label className="label">Platform</label><input className="input-field" onChange={e => setFormData({...formData, platform: e.target.value})} placeholder="FB Ads / IG Ads / Spanduk" /></div>
                            <div><label className="label">Budget</label><input type="number" className="input-field" onChange={e => setFormData({...formData, budget: e.target.value})} /></div>
                        </>
                    )}
                    <div className="flex justify-end pt-4">
                        <button className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Marketing;