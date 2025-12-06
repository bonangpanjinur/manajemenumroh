import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import api from '../utils/api';
import { Building, Plane, Users, Plus, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Masters = () => {
    const [activeTab, setActiveTab] = useState('hotels'); // hotels | airlines | vendors
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    // Konfigurasi per Tab
    const tabConfig = {
        hotels: {
            endpoint: 'umh/v1/hotels',
            title: 'Master Hotel',
            initialForm: { name: '', city: 'Makkah', rating: '5', distance_to_haram: 0 },
            columns: [
                { header: 'Nama Hotel', accessor: 'name', render: r => <span className="font-bold">{r.name}</span> },
                { header: 'Kota', accessor: 'city', render: r => <span className="bg-gray-100 px-2 py-1 rounded text-xs uppercase">{r.city}</span> },
                { header: 'Rating', accessor: 'rating', render: r => <div className="flex text-yellow-500">{[...Array(parseInt(r.rating)||0)].map((_,i)=><Star key={i} size={12} fill="currentColor"/>)}</div> },
                { header: 'Jarak (m)', accessor: 'distance_to_haram' }
            ]
        },
        airlines: {
            endpoint: 'umh/v1/airlines',
            title: 'Master Maskapai',
            initialForm: { name: '', code: '', type: 'International' },
            columns: [
                { header: 'Maskapai', accessor: 'name', render: r => <div className="font-bold">{r.name}</div> },
                { header: 'Kode', accessor: 'code', render: r => <span className="font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded">{r.code}</span> },
                { header: 'Tipe', accessor: 'type' }
            ]
        },
        vendors: {
            endpoint: 'umh/v1/vendors',
            title: 'Master Vendor/Rekanan',
            initialForm: { name: '', type: 'general', contact_person: '', phone: '' },
            columns: [
                { header: 'Nama Vendor', accessor: 'name', render: r => <div className="font-bold">{r.name}</div> },
                { header: 'Tipe', accessor: 'type', render: r => <span className="capitalize">{r.type}</span> },
                { header: 'Kontak', accessor: 'contact_person', render: r => <div className="text-xs">{r.contact_person}<br/>{r.phone}</div> }
            ]
        }
    };

    const currentConfig = tabConfig[activeTab];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(currentConfig.endpoint);
            setData(res.data.data || res.data); // Handle structure variations
        } catch (e) { toast.error("Gagal memuat data"); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post(currentConfig.endpoint, form);
            else await api.put(`${currentConfig.endpoint}/${form.id}`, form);
            
            toast.success("Berhasil disimpan!");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal menyimpan data"); }
    };

    const handleDelete = async (id) => {
        if(!confirm("Hapus data ini?")) return;
        try {
            await api.delete(`${currentConfig.endpoint}/${id}`);
            toast.success("Terhapus");
            fetchData();
        } catch (e) { toast.error("Gagal menghapus"); }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Data Master</h1>
            
            {/* Tabs */}
            <div className="flex bg-white rounded-lg shadow-sm border p-1 w-fit">
                {[
                    { id: 'hotels', label: 'Hotel', icon: Building },
                    { id: 'airlines', label: 'Maskapai', icon: Plane },
                    { id: 'vendors', label: 'Vendor Lain', icon: Users }
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab===t.id ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <t.icon size={16}/> {t.label}
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-700">{currentConfig.title}</h3>
                <button onClick={() => { setMode('create'); setForm(currentConfig.initialForm); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={16}/> Tambah {currentConfig.title}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable 
                    columns={currentConfig.columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={(item) => { setMode('edit'); setForm(item); setIsModalOpen(true); }}
                    onDelete={(id) => handleDelete(id)}
                />
            </div>

            {/* Dynamic Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${mode === 'create' ? 'Tambah' : 'Edit'} ${currentConfig.title}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Form Fields for Hotels */}
                    {activeTab === 'hotels' && (
                        <>
                            <div><label className="label">Nama Hotel</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Kota</label>
                                    <select className="input-field" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}>
                                        <option value="Makkah">Makkah</option><option value="Madinah">Madinah</option><option value="Jeddah">Jeddah</option>
                                    </select>
                                </div>
                                <div><label className="label">Bintang</label><input type="number" max="5" min="1" className="input-field" value={form.rating} onChange={e=>setForm({...form, rating:e.target.value})}/></div>
                            </div>
                            <div><label className="label">Jarak ke Masjid (Meter)</label><input type="number" className="input-field" value={form.distance_to_haram} onChange={e=>setForm({...form, distance_to_haram:e.target.value})}/></div>
                        </>
                    )}

                    {/* Form Fields for Airlines */}
                    {activeTab === 'airlines' && (
                        <>
                            <div><label className="label">Nama Maskapai</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Kode (IATA)</label><input className="input-field" placeholder="Eg. GA, SV" value={form.code} onChange={e=>setForm({...form, code:e.target.value})}/></div>
                                <div><label className="label">Tipe</label>
                                    <select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                                        <option value="International">International</option><option value="Domestic">Domestic</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Form Fields for Vendors */}
                    {activeTab === 'vendors' && (
                        <>
                            <div><label className="label">Nama Vendor</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                            <div><label className="label">Kategori</label>
                                <select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                                    <option value="catering">Katering</option><option value="visa_provider">Provider Visa</option><option value="transport">Transportasi</option><option value="general">Umum</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Contact Person</label><input className="input-field" value={form.contact_person} onChange={e=>setForm({...form, contact_person:e.target.value})}/></div>
                                <div><label className="label">Telepon</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/></div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Masters;