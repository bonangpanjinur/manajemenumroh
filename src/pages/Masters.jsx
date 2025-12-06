import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Building, MapPin, Plane, Plus, UserCheck, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import AsyncCitySelect from '../components/AsyncCitySelect'; // Import ini

const Masters = () => {
    const [activeTab, setActiveTab] = useState('cities');
    
    const config = {
        cities: { 
            endpoint: 'umh/v1/cities', title: 'Master Kota', icon: MapPin,
            cols: [{header:'Nama Kota', accessor:'name', render:r=><span className="font-bold">{r.name}</span>},{header:'Provinsi', accessor:'province'}] 
        },
        hotels: { 
            endpoint: 'umh/v1/hotels', title: 'Data Hotel', icon: Building,
            cols: [
                {header:'Nama Hotel', accessor:'name', render:r=><span className="font-bold">{r.name}</span>},
                // Tampilkan nama kota jika ada (perlu join di backend idealnya, tapi ini fallback)
                {header:'Kota', accessor:'city_id', render:r=>r.city || 'ID: '+r.city_id}, 
                {header:'Rating', accessor:'rating', render:r=>'⭐'.repeat(r.rating)}
            ] 
        },
        airlines: { endpoint: 'umh/v1/airlines', title: 'Maskapai', icon: Plane, cols: [{header:'Maskapai', accessor:'name'},{header:'Kode', accessor:'code'}] },
        mutawifs: { endpoint: 'umh/v1/mutawifs', title: 'Muthawif', icon: UserCheck, cols: [{header:'Nama', accessor:'name'},{header:'Kontak', accessor:'phone'}] }
    };

    const { data, loading, fetchData, deleteItem } = useCRUD(config[activeTab].endpoint);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({});
    const [mode, setMode] = useState('create');

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = mode === 'edit' ? `${config[activeTab].endpoint}/${form.id}` : config[activeTab].endpoint;
            const method = mode === 'edit' ? 'put' : 'post';
            await api[method](endpoint, form);
            toast.success("Tersimpan"); setIsModalOpen(false); fetchData();
        } catch(e) { toast.error("Gagal"); }
    };

    const handleSeedCities = async () => {
        try {
            const res = await api.post('umh/v1/masters/seed-cities');
            toast.success(res.data.message);
            fetchData();
        } catch(e) { toast.error("Gagal import"); }
    };

    const renderForm = () => {
        if (activeTab === 'cities') return (
            <>
                <div><label className="label">Nama Kota</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                <div className="mt-4"><label className="label">Provinsi</label><input className="input-field" value={form.province||''} onChange={e=>setForm({...form,province:e.target.value})}/></div>
            </>
        );
        if (activeTab === 'hotels') return (
            <>
                <div><label className="label">Nama Hotel</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                <div className="mt-4">
                    <label className="label">Kota Lokasi</label>
                    {/* GUNAKAN ASYNC SELECT UNTUK KOTA */}
                    <AsyncCitySelect value={form.city_id} onChange={(id)=>setForm({...form, city_id: id})} />
                </div>
                <div className="mt-4"><label className="label">Bintang</label><select className="input-field" value={form.rating||'5'} onChange={e=>setForm({...form,rating:e.target.value})}><option value="5">5 Bintang</option><option value="4">4 Bintang</option><option value="3">3 Bintang</option></select></div>
            </>
        );
        // Form standard untuk yang lain
        return <div><label className="label">Nama</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required/></div>;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Master Data</h1>
            
            <div className="flex bg-white rounded-lg p-1 shadow-sm w-fit border border-gray-200 gap-1 overflow-x-auto">
                {Object.entries(config).map(([k,v]) => (
                    <button key={k} onClick={()=>setActiveTab(k)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab===k?'bg-blue-600 text-white shadow':'text-gray-500 hover:text-gray-800'}`}>
                        <v.icon size={16}/> {v.title}
                    </button>
                ))}
            </div>
            
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-700">{config[activeTab].title}</h3>
                    <div className="flex gap-2">
                        {activeTab === 'cities' && (
                            <button onClick={handleSeedCities} className="btn-secondary text-xs flex gap-2"><Download size={14}/> Import Kota Indonesia</button>
                        )}
                        <button onClick={()=>{setForm({}); setMode('create'); setIsModalOpen(true)}} className="btn-primary flex gap-2"><Plus size={16}/> Tambah</button>
                    </div>
                </div>
                <CrudTable columns={config[activeTab].cols} data={data} loading={loading} onEdit={(r)=>{setForm(r); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title="Input Data">
                <form onSubmit={handleSave}>
                    {renderForm()}
                    <button className="btn-primary w-full mt-6">Simpan</button>
                </form>
            </Modal>
        </div>
    );
};
export default Masters;