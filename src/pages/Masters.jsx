import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { Building, Plane, Tag, CheckSquare, CreditCard, Plus } from 'lucide-react';

const Masters = () => {
    // State Tab Aktif (Default: Hotel)
    const [activeTab, setActiveTab] = useState('hotel'); 
    
    // Fetch data sesuai tab
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/masters', { type: activeTab });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => { fetchData(); }, [activeTab, fetchData]);

    const handleOpen = () => {
        setEditId(null);
        setFormData({ type: activeTab, name: '', description: '', extra_data: '', status: 'active' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, type: activeTab };
        const success = editId ? await updateItem(editId, payload) : await createItem(payload);
        if (success) { setIsModalOpen(false); setFormData({}); }
    };

    // Konfigurasi Tampilan Kolom Berdasarkan Tab
    const getColumns = () => {
        const base = [{ header: 'Nama', accessor: 'name', className: 'font-bold' }];
        
        if (activeTab === 'hotel') {
            return [...base, { header: 'Kota Lokasi', accessor: 'description' }, { header: 'Bintang', accessor: 'extra_data' }];
        }
        if (activeTab === 'bank') {
            return [...base, { header: 'No. Rekening', accessor: 'description' }, { header: 'Atas Nama', accessor: 'extra_data' }];
        }
        if (activeTab === 'promo') {
            return [...base, { header: 'Nilai / Diskon', accessor: 'description' }];
        }
        // Default (Airline, Facility)
        return [...base, { header: 'Keterangan', accessor: 'description' }];
    };

    // Helper Tab Button
    const TabBtn = ({ id, icon: Icon, label }) => (
        <button onClick={() => setActiveTab(id)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${activeTab === id ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <Icon size={16} /> {label}
        </button>
    );

    return (
        <Layout title="Data Master & Referensi">
            <div className="mb-6 flex flex-wrap gap-2">
                <TabBtn id="hotel" icon={Building} label="Hotel" />
                <TabBtn id="airline" icon={Plane} label="Maskapai" />
                <TabBtn id="bank" icon={CreditCard} label="Rekening Bank" />
                <TabBtn id="promo" icon={Tag} label="Jenis Promo" />
                <TabBtn id="facility" icon={CheckSquare} label="Fasilitas & Logistik" />
            </div>

            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg capitalize">Data: {activeTab === 'bank' ? 'Rekening Perusahaan' : activeTab}</h3>
                    <p className="text-sm text-gray-500">Data ini akan muncul otomatis saat pembuatan paket atau transaksi.</p>
                </div>
                <button onClick={handleOpen} className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} /> Tambah Data
                </button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={getColumns()} data={data} onEdit={(item)=>{setFormData(item); setEditId(item.id); setIsModalOpen(true)}} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Tambah ${activeTab.toUpperCase()}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* FORM HOTEL */}
                    {activeTab === 'hotel' && (
                        <>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase">Nama Hotel</label><input className="w-full border p-2 rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required /></div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Kota</label>
                                <select className="w-full border p-2 rounded" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}>
                                    <option value="">Pilih Kota</option><option value="Makkah">Makkah</option><option value="Madinah">Madinah</option><option value="Jeddah">Jeddah</option><option value="Istanbul">Istanbul</option>
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase">Bintang</label><select className="w-full border p-2 rounded" value={formData.extra_data} onChange={e=>setFormData({...formData, extra_data: e.target.value})}><option value="5">5 Bintang</option><option value="4">4 Bintang</option><option value="3">3 Bintang</option></select></div>
                        </>
                    )}

                    {/* FORM BANK */}
                    {activeTab === 'bank' && (
                        <>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase">Nama Bank</label><input className="w-full border p-2 rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="BCA / Mandiri" required /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase">Nomor Rekening</label><input className="w-full border p-2 rounded" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} placeholder="1234xxxx" required /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase">Atas Nama</label><input className="w-full border p-2 rounded" value={formData.extra_data} onChange={e=>setFormData({...formData, extra_data: e.target.value})} placeholder="PT Jannah Firdaus..." /></div>
                        </>
                    )}

                    {/* FORM UMUM (Airline, Promo, Facility) */}
                    {(activeTab === 'airline' || activeTab === 'promo' || activeTab === 'facility') && (
                        <>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase">Nama {activeTab}</label><input className="w-full border p-2 rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase">Keterangan</label><input className="w-full border p-2 rounded" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} placeholder="Opsional" /></div>
                        </>
                    )}

                    <button className="w-full bg-blue-600 text-white py-2 rounded mt-4 shadow hover:bg-blue-700">Simpan Data</button>
                </form>
            </Modal>
        </Layout>
    );
};
export default Masters;