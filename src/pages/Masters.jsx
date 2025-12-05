import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Building, Plane, Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Masters = () => {
    const [activeTab, setActiveTab] = useState('hotels'); // hotels | airlines
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    // Hooks dinamis berdasarkan tab
    const endpoint = activeTab === 'hotels' ? 'umh/v1/hotels' : 'umh/v1/airlines';
    const { data, loading, fetchData, deleteItem } = useCRUD(endpoint);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post(endpoint, form);
                toast.success("Data berhasil ditambahkan");
            } else {
                const id = form.uuid || form.id;
                await api.put(`${endpoint}/${id}`, form);
                toast.success("Data berhasil diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };

    const handleEdit = (item) => {
        setForm(item);
        setMode('edit');
        setIsModalOpen(true);
    };

    // Kolom Dinamis
    const hotelColumns = [
        { header: 'Nama Hotel', accessor: 'name', render: r => <span className="font-bold">{r.name}</span> },
        { header: 'Kota', accessor: 'city', render: r => <span className="bg-gray-100 px-2 py-1 rounded text-xs">{r.city}</span> },
        { header: 'Bintang', accessor: 'rating', render: r => <span className="text-yellow-500">{'★'.repeat(r.rating)}</span> },
        { header: 'Jarak Haram', accessor: 'distance_to_haram', render: r => <span className="text-xs text-gray-500">{r.distance_to_haram} m</span> },
    ];

    const airlineColumns = [
        { header: 'Maskapai', accessor: 'name', render: r => <span className="font-bold">{r.name}</span> },
        { header: 'Kode', accessor: 'code', render: r => <span className="font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded">{r.code}</span> },
        { header: 'Tipe', accessor: 'type', render: r => <span className="text-xs">{r.type}</span> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Master Data</h1>
                    <p className="text-gray-500 text-sm">Database referensi Hotel dan Maskapai.</p>
                </div>
                <button onClick={() => { setMode('create'); setForm({}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah {activeTab === 'hotels' ? 'Hotel' : 'Maskapai'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-white rounded-t-xl px-4 pt-2 shadow-sm">
                <button 
                    onClick={() => setActiveTab('hotels')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'hotels' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    <Building size={16}/> Hotel
                </button>
                <button 
                    onClick={() => setActiveTab('airlines')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'airlines' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    <Plane size={16}/> Maskapai
                </button>
            </div>

            <div className="bg-white rounded-b-xl shadow border border-gray-200 border-t-0">
                <CrudTable 
                    columns={activeTab === 'hotels' ? hotelColumns : airlineColumns} 
                    data={data} 
                    loading={loading} 
                    onEdit={handleEdit} 
                    onDelete={deleteItem} 
                />
            </div>

            {/* Modal Dinamis */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Data" : "Edit Data"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'hotels' ? (
                        <>
                            <div><label className="label">Nama Hotel</label><input className="input-field" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Kota</label>
                                    <select className="input-field" value={form.city || 'Makkah'} onChange={e => setForm({...form, city: e.target.value})}>
                                        <option value="Makkah">Makkah</option>
                                        <option value="Madinah">Madinah</option>
                                        <option value="Jeddah">Jeddah</option>
                                    </select>
                                </div>
                                <div><label className="label">Rating Bintang</label><input type="number" max="7" className="input-field" value={form.rating || 5} onChange={e => setForm({...form, rating: e.target.value})} /></div>
                            </div>
                            <div><label className="label">Jarak ke Haram (m)</label><input type="number" className="input-field" value={form.distance_to_haram || 0} onChange={e => setForm({...form, distance_to_haram: e.target.value})} /></div>
                        </>
                    ) : (
                        <>
                            <div><label className="label">Nama Maskapai</label><input className="input-field" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                            <div><label className="label">Kode IATA</label><input className="input-field uppercase" maxLength="3" value={form.code || ''} onChange={e => setForm({...form, code: e.target.value})} placeholder="Ex: GA" /></div>
                            <div><label className="label">Tipe</label>
                                <select className="input-field" value={form.type || 'International'} onChange={e => setForm({...form, type: e.target.value})}>
                                    <option value="International">International</option>
                                    <option value="Domestic">Domestic</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Masters;