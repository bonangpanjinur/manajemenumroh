import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Building, MapPin, Plane, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Masters = () => {
    const [activeTab, setActiveTab] = useState('cities');
    
    // Konfigurasi Dinamis per Tab
    const config = {
        cities: { 
            endpoint: 'umh/v1/cities', 
            title: 'Master Kota', 
            cols: [{header:'Nama Kota',accessor:'name'},{header:'Provinsi',accessor:'province'}] 
        },
        hotels: { 
            endpoint: 'umh/v1/hotels', 
            title: 'Data Hotel', 
            cols: [
                {header:'Nama Hotel',accessor:'name', render:r=><span className="font-bold">{r.name}</span>},
                {header:'Kota',accessor:'city'},
                {header:'Rating',accessor:'rating', render:r=>'⭐'.repeat(r.rating)}
            ] 
        },
        airlines: { 
            endpoint: 'umh/v1/airlines', 
            title: 'Data Maskapai', 
            cols: [{header:'Nama Maskapai',accessor:'name'},{header:'Kode IATA',accessor:'code', render:r=><span className="font-mono bg-gray-100 px-2 rounded">{r.code}</span>}] 
        },
    };

    // Hook CRUD menyesuaikan endpoint aktif
    const { data, loading, fetchData, deleteItem } = useCRUD(config[activeTab].endpoint);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({});

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = form.id ? `${config[activeTab].endpoint}/${form.id}` : config[activeTab].endpoint;
            const method = form.id ? 'put' : 'post';
            await api[method](endpoint, form);
            
            toast.success("Data tersimpan");
            setIsModalOpen(false);
            fetchData(); // Reload table
        } catch(e) { toast.error("Gagal simpan data"); }
    };

    // Render Form sesuai Tab aktif
    const renderForm = () => {
        if (activeTab === 'cities') return (
            <>
                <div><label className="label">Nama Kota / Kabupaten</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Contoh: Surabaya"/></div>
                <div className="mt-4"><label className="label">Provinsi</label><input className="input-field" value={form.province||''} onChange={e=>setForm({...form,province:e.target.value})} placeholder="Contoh: Jawa Timur"/></div>
            </>
        );
        if (activeTab === 'hotels') return (
            <>
                <div><label className="label">Nama Hotel</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div><label className="label">Kota</label><select className="input-field" value={form.city||'Makkah'} onChange={e=>setForm({...form,city:e.target.value})}><option>Makkah</option><option>Madinah</option><option>Jeddah</option><option>Lainnya</option></select></div>
                    <div><label className="label">Bintang</label><select className="input-field" value={form.rating||'5'} onChange={e=>setForm({...form,rating:e.target.value})}><option value="5">5 Bintang</option><option value="4">4 Bintang</option><option value="3">3 Bintang</option></select></div>
                </div>
            </>
        );
        if (activeTab === 'airlines') return (
            <>
                <div><label className="label">Nama Maskapai</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Garuda Indonesia"/></div>
                <div className="mt-4"><label className="label">Kode IATA</label><input className="input-field" value={form.code||''} onChange={e=>setForm({...form,code:e.target.value})} placeholder="GA"/></div>
            </>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Master Data Center</h1>
            
            {/* Tab Navigation */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm w-fit border border-gray-200">
                <button onClick={()=>setActiveTab('cities')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab==='cities'?'bg-blue-600 text-white shadow':'text-gray-500 hover:text-gray-800'}`}><MapPin size={16}/> Kota</button>
                <button onClick={()=>setActiveTab('hotels')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab==='hotels'?'bg-blue-600 text-white shadow':'text-gray-500 hover:text-gray-800'}`}><Building size={16}/> Hotel</button>
                <button onClick={()=>setActiveTab('airlines')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab==='airlines'?'bg-blue-600 text-white shadow':'text-gray-500 hover:text-gray-800'}`}><Plane size={16}/> Maskapai</button>
            </div>
            
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-700">{config[activeTab].title}</h3>
                    <button onClick={()=>{setForm({}); setIsModalOpen(true)}} className="btn-primary flex gap-2"><Plus size={16}/> Tambah Data</button>
                </div>
                <CrudTable columns={config[activeTab].cols} data={data} loading={loading} onEdit={(r)=>{setForm(r); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title={`Input ${config[activeTab].title}`}>
                <form onSubmit={handleSave}>
                    {renderForm()}
                    <button className="btn-primary w-full mt-6">Simpan Data</button>
                </form>
            </Modal>
        </div>
    );
};
export default Masters;