import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Hotel, Plane, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Masters = () => {
    const [activeTab, setActiveTab] = useState('hotels'); // hotels | airlines | locations

    // Kita gunakan custom hook terpisah untuk masing-masing endpoint
    // Agar saat pindah tab, data ter-refresh
    return (
        <Layout title="Master Data Pendukung">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
                <TabButton id="hotels" label="Hotel" icon={Hotel} active={activeTab} set={setActiveTab} />
                <TabButton id="airlines" label="Maskapai" icon={Plane} active={activeTab} set={setActiveTab} />
                <TabButton id="locations" label="Lokasi/Kota" icon={MapPin} active={activeTab} set={setActiveTab} />
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-1">
                {activeTab === 'hotels' && <MasterHotels />}
                {activeTab === 'airlines' && <MasterAirlines />}
                {activeTab === 'locations' && <MasterLocations />}
            </div>
        </Layout>
    );
};

const TabButton = ({ id, label, icon: Icon, active, set }) => (
    <button onClick={() => set(id)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${active === id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
        <Icon size={16} /> {label}
    </button>
);

// --- SUB COMPONENTS FOR EACH TAB ---

const MasterHotels = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/masters/hotels');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', city_id: '', star_rating: 4, distance_to_haram: 0, description: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('umh/v1/masters/hotels', form);
        toast.success("Hotel disimpan"); setIsModalOpen(false); fetchData();
    };

    const cols = [
        { header: 'Nama Hotel', accessor: 'name' },
        { header: 'Kota', accessor: 'city_name' }, // Join dari backend
        { header: 'Bintang', accessor: 'star_rating', render: r => '⭐'.repeat(r.star_rating) },
        { header: 'Jarak', accessor: 'distance_to_haram', render: r => `${r.distance_to_haram}m` },
    ];

    return (
        <>
            <div className="p-4 flex justify-between"><h3 className="font-bold">Daftar Hotel</h3><button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-1"><Plus size={16}/> Hotel Baru</button></div>
            <CrudTable columns={cols} data={data} loading={loading} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Hotel">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Hotel</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    <div><label className="label">Bintang</label><select className="input-field" value={form.star_rating} onChange={e=>setForm({...form, star_rating:e.target.value})}><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div>
                    <div><label className="label">Jarak ke Haram (meter)</label><input type="number" className="input-field" value={form.distance_to_haram} onChange={e=>setForm({...form, distance_to_haram:e.target.value})}/></div>
                    {/* City ID idealnya dropdown dari API Locations, disederhanakan dulu */}
                    <div><label className="label">ID Kota (Sementara)</label><input type="number" className="input-field" value={form.city_id} onChange={e=>setForm({...form, city_id:e.target.value})} placeholder="ID dari Master Lokasi"/></div>
                    <div className="flex justify-end pt-4"><button className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </>
    );
};

const MasterAirlines = () => {
    const { data, loading, fetchData } = useCRUD('umh/v1/masters/airlines');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', code: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('umh/v1/masters/airlines', form);
        toast.success("Maskapai disimpan"); setIsModalOpen(false); fetchData();
    };

    return (
        <>
            <div className="p-4 flex justify-between"><h3 className="font-bold">Daftar Maskapai</h3><button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-1"><Plus size={16}/> Maskapai Baru</button></div>
            <CrudTable columns={[{ header: 'Nama', accessor: 'name' }, { header: 'Kode IATA', accessor: 'code' }]} data={data} loading={loading} />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Maskapai">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Maskapai</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    <div><label className="label">Kode (Misal: GA)</label><input className="input-field" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} required/></div>
                    <div className="flex justify-end pt-4"><button className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </>
    );
};

const MasterLocations = () => {
    const { data, loading, fetchData } = useCRUD('umh/v1/masters/locations');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', type: 'city', country: 'Saudi Arabia' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('umh/v1/masters/locations', form);
        toast.success("Lokasi disimpan"); setIsModalOpen(false); fetchData();
    };

    return (
        <>
            <div className="p-4 flex justify-between"><h3 className="font-bold">Daftar Kota & Bandara</h3><button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-1"><Plus size={16}/> Lokasi Baru</button></div>
            <CrudTable columns={[{ header: 'Nama', accessor: 'name' }, { header: 'Kode', accessor: 'code' }, { header: 'Tipe', accessor: 'type' }]} data={data} loading={loading} />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Lokasi">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Kota/Bandara</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    <div><label className="label">Kode (Optional)</label><input className="input-field" value={form.code} onChange={e=>setForm({...form, code:e.target.value})}/></div>
                    <div><label className="label">Tipe</label><select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}><option value="city">Kota</option><option value="airport">Bandara</option></select></div>
                    <div className="flex justify-end pt-4"><button className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </>
    );
};

export default Masters;