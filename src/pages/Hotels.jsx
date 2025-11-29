import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, MapPin, Star, Hotel as HotelIcon } from 'lucide-react';

const Hotels = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/hotels');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);

    const initialForm = { name: '', city: 'Makkah', rating: '5', distance_to_haram: '', address: '' };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Hotel', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.name}</div>
                <div className="flex text-yellow-500 text-xs mt-1">
                    {[...Array(parseInt(r.rating || 0))].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                </div>
            </div>
        )},
        { header: 'Kota', accessor: 'city', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold ${r.city === 'Makkah' ? 'bg-gray-800 text-white' : 'bg-green-600 text-white'}`}>
                {r.city}
            </span>
        )},
        { header: 'Jarak', accessor: 'distance_to_haram', render: r => (
            <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin size={14} className="text-red-500" /> {r.distance_to_haram} m
            </div>
        )},
    ];

    return (
        <Layout title="Master Data Hotel">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="font-bold text-gray-800">Daftar Hotel Rekanan</h2>
                    <p className="text-xs text-gray-500">Database hotel untuk penyusunan paket.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah Hotel
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Hotel Baru" : "Edit Hotel"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Hotel</label>
                        <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Hilton Suites" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kota</label>
                            <select className="input-field" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                                <option value="Makkah">Makkah</option>
                                <option value="Madinah">Madinah</option>
                                <option value="Jeddah">Jeddah</option>
                                <option value="Other">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Bintang (Rating)</label>
                            <select className="input-field" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}>
                                <option value="3">⭐⭐⭐ (3)</option>
                                <option value="4">⭐⭐⭐⭐ (4)</option>
                                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Jarak ke Masjid (Meter)</label>
                        <input type="number" className="input-field" value={formData.distance_to_haram} onChange={e => setFormData({...formData, distance_to_haram: e.target.value})} placeholder="Cth: 50" />
                    </div>
                    <div>
                        <label className="label">Alamat / Catatan</label>
                        <textarea className="input-field" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Hotels;