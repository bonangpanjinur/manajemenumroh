import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Building, Plane, Tag, Plus, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';

// Sub-komponen untuk Form Hotel
const HotelForm = ({ form, setForm, onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div><label className="label">Nama Hotel</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="label">Kota</label>
                <select className="input-field" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}>
                    <option value="Makkah">Makkah</option><option value="Madinah">Madinah</option><option value="Jeddah">Jeddah</option><option value="Istanbul">Istanbul</option><option value="Lainnya">Lainnya</option>
                </select>
            </div>
            <div>
                <label className="label">Bintang</label>
                <select className="input-field" value={form.rating} onChange={e=>setForm({...form, rating:e.target.value})}>
                    <option value="3">3 Bintang</option><option value="4">4 Bintang</option><option value="5">5 Bintang</option>
                </select>
            </div>
        </div>
        <div><label className="label">Jarak ke Haram (Meter)</label><input type="number" className="input-field" value={form.distance_to_haram} onChange={e=>setForm({...form, distance_to_haram:e.target.value})}/></div>
        <button className="btn-primary w-full mt-4">Simpan Hotel</button>
    </form>
);

// Sub-komponen untuk Form Maskapai
const AirlineForm = ({ form, setForm, onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div><label className="label">Nama Maskapai</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
        <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Kode (IATA)</label><input className="input-field uppercase" placeholder="GA" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} maxLength={3}/></div>
            <div>
                <label className="label">Tipe</label>
                <select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                    <option value="International">International</option><option value="Domestic">Domestic</option>
                </select>
            </div>
        </div>
        <button className="btn-primary w-full mt-4">Simpan Maskapai</button>
    </form>
);

const Masters = () => {
    const [activeTab, setActiveTab] = useState('hotels');
    
    // Config untuk tiap tab
    const config = {
        hotels: { endpoint: 'umh/v1/hotels', title: 'Data Hotel', initialForm: { name: '', city: 'Makkah', rating: '5', distance_to_haram: 0 } },
        airlines: { endpoint: 'umh/v1/airlines', title: 'Data Maskapai', initialForm: { name: '', code: '', type: 'International' } },
        categories: { endpoint: 'umh/v1/package-categories', title: 'Kategori Paket', initialForm: { name: '', slug: '', type: 'umrah' } }
    };

    const { data, loading, fetchData, deleteItem } = useCRUD(config[activeTab].endpoint);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(config[activeTab].initialForm);
    const [mode, setMode] = useState('create');

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post(config[activeTab].endpoint, form);
            else await api.put(`${config[activeTab].endpoint}/${form.id}`, form);
            setIsModalOpen(false);
            fetchData();
            toast.success("Data Tersimpan");
        } catch (e) { toast.error("Gagal simpan"); }
    };

    // Render kolom tabel dinamis berdasarkan tab
    const getColumns = () => {
        if (activeTab === 'hotels') return [
            { header: 'Hotel', accessor: 'name', render: r => <div className="font-bold">{r.name}</div> },
            { header: 'Lokasi', accessor: 'city', render: r => <div className="flex items-center gap-1 text-xs"><MapPin size={10}/> {r.city}</div> },
            { header: 'Rating', accessor: 'rating', render: r => <div className="flex text-yellow-500 text-xs">{[...Array(parseInt(r.rating))].map((_,i)=><Star key={i} size={10} fill="currentColor"/>)}</div> }
        ];
        if (activeTab === 'airlines') return [
            { header: 'Maskapai', accessor: 'name', render: r => <div className="font-bold">{r.name}</div> },
            { header: 'Kode', accessor: 'code', render: r => <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{r.code}</span> },
            { header: 'Tipe', accessor: 'type' }
        ];
        // Default category columns...
        return [{header: 'Nama', accessor: 'name'}];
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Master Data Center</h1>
            
            <div className="flex border-b space-x-2 overflow-x-auto">
                {[
                    {id: 'hotels', icon: Building, label: 'Hotel & Akomodasi'},
                    {id: 'airlines', icon: Plane, label: 'Maskapai Penerbangan'},
                    // {id: 'categories', icon: Tag, label: 'Kategori Paket'} // Bisa diaktifkan jika perlu
                ].map(tab => (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setForm(config[tab.id].initialForm); }} 
                        className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab===tab.id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Menampilkan data <b>{config[activeTab].title}</b></div>
                <button onClick={()=>{setForm(config[activeTab].initialForm); setMode('create'); setIsModalOpen(true)}} className="btn-primary flex gap-2 text-sm">
                    <Plus size={16}/> Tambah {config[activeTab].title}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={getColumns()} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title={(mode==='create'?'Tambah ':'Edit ') + config[activeTab].title}>
                {activeTab === 'hotels' && <HotelForm form={form} setForm={setForm} onSubmit={handleSave} />}
                {activeTab === 'airlines' && <AirlineForm form={form} setForm={setForm} onSubmit={handleSave} />}
            </Modal>
        </div>
    );
};

export default Masters;