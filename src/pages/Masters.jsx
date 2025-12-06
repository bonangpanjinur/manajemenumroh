import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Building, MapPin, Plane, Plus, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Masters = () => {
    const [activeTab, setActiveTab] = useState('cities');
    
    // Konfigurasi Tab dan Kolom
    const config = {
        cities: { 
            endpoint: 'umh/v1/cities', 
            title: 'Master Kota', 
            icon: MapPin,
            cols: [
                {header:'Nama Kota', accessor:'name', render:r=><span className="font-bold">{r.name}</span>},
                {header:'Provinsi', accessor:'province'},
                {header:'Negara', accessor:'country', render:r=>r.country||'Indonesia'}
            ] 
        },
        hotels: { 
            endpoint: 'umh/v1/hotels', 
            title: 'Data Hotel', 
            icon: Building,
            cols: [
                {header:'Nama Hotel', accessor:'name', render:r=><span className="font-bold text-gray-800">{r.name}</span>},
                {header:'Kota', accessor:'city'},
                {header:'Rating', accessor:'rating', render:r=><span className="text-yellow-500">{'★'.repeat(r.rating)}</span>}
            ] 
        },
        airlines: { 
            endpoint: 'umh/v1/airlines', 
            title: 'Data Maskapai', 
            icon: Plane,
            cols: [
                {header:'Nama Maskapai', accessor:'name'},
                {header:'Kode IATA', accessor:'code', render:r=><span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{r.code}</span>},
                {header:'Tipe', accessor:'type'}
            ] 
        },
        mutawifs: { 
            endpoint: 'umh/v1/mutawifs', 
            title: 'Data Muthawif', 
            icon: UserCheck,
            cols: [
                {header:'Nama Lengkap', accessor:'name', render:r=><span className="font-bold">{r.name}</span>},
                {header:'Kontak', accessor:'phone'},
                {header:'No. Lisensi', accessor:'license_number', render:r=><span className="font-mono text-xs">{r.license_number||'-'}</span>},
                {header:'Status', accessor:'status', render:r=><span className="uppercase text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded">{r.status}</span>}
            ] 
        }
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
            toast.success("Data berhasil disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch(e) { toast.error("Gagal menyimpan data"); }
    };

    const renderForm = () => {
        switch(activeTab) {
            case 'cities': return (
                <>
                    <div><label className="label">Nama Kota / Kabupaten</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Contoh: Surabaya"/></div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div><label className="label">Provinsi</label><input className="input-field" value={form.province||''} onChange={e=>setForm({...form,province:e.target.value})} placeholder="Jawa Timur"/></div>
                        <div><label className="label">Negara</label><input className="input-field" value={form.country||'Indonesia'} onChange={e=>setForm({...form,country:e.target.value})}/></div>
                    </div>
                </>
            );
            case 'hotels': return (
                <>
                    <div><label className="label">Nama Hotel</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div><label className="label">Kota Lokasi</label><select className="input-field" value={form.city||'Makkah'} onChange={e=>setForm({...form,city:e.target.value})}><option>Makkah</option><option>Madinah</option><option>Jeddah</option><option>Lainnya</option></select></div>
                        <div><label className="label">Bintang</label><select className="input-field" value={form.rating||'5'} onChange={e=>setForm({...form,rating:e.target.value})}><option value="5">5 Bintang</option><option value="4">4 Bintang</option><option value="3">3 Bintang</option><option value="2">2 Bintang</option></select></div>
                    </div>
                </>
            );
            case 'airlines': return (
                <>
                    <div><label className="label">Nama Maskapai</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Garuda Indonesia"/></div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div><label className="label">Kode IATA</label><input className="input-field" value={form.code||''} onChange={e=>setForm({...form,code:e.target.value})} placeholder="GA"/></div>
                        <div><label className="label">Tipe</label><select className="input-field" value={form.type||'International'} onChange={e=>setForm({...form,type:e.target.value})}><option>International</option><option>Domestic</option></select></div>
                    </div>
                </>
            );
            case 'mutawifs': return (
                <>
                    <div><label className="label">Nama Lengkap Muthawif</label><input className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div><label className="label">No. HP / WhatsApp</label><input className="input-field" value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
                        <div><label className="label">Nomor Lisensi / ID</label><input className="input-field" value={form.license_number||''} onChange={e=>setForm({...form,license_number:e.target.value})}/></div>
                    </div>
                    <div className="mt-4"><label className="label">Status</label><select className="input-field" value={form.status||'active'} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Aktif</option><option value="inactive">Tidak Aktif</option></select></div>
                </>
            );
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Master Data Center</h1>
                    <p className="text-sm text-gray-500">Kelola data referensi sistem terpusat.</p>
                </div>
            </div>
            
            {/* Tab Navigation Scrollable */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm w-full md:w-fit border border-gray-200 overflow-x-auto">
                {Object.entries(config).map(([key, cfg]) => (
                     <button 
                        key={key} 
                        onClick={()=>setActiveTab(key)} 
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab===key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                        <cfg.icon size={16}/> {cfg.title}
                    </button>
                ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
                        {React.createElement(config[activeTab].icon, {size: 20, className: "text-blue-600"})}
                        Daftar {config[activeTab].title}
                    </h3>
                    <button onClick={()=>{setForm({}); setMode('create'); setIsModalOpen(true)}} className="btn-primary flex gap-2">
                        <Plus size={16}/> Tambah Baru
                    </button>
                </div>
                <CrudTable columns={config[activeTab].cols} data={data} loading={loading} onEdit={(r)=>{setForm(r); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title={`${mode === 'create' ? 'Tambah' : 'Edit'} ${config[activeTab].title}`}>
                <form onSubmit={handleSave}>
                    {renderForm()}
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary px-6">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default Masters;