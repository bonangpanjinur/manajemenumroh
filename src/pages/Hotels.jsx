import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, MapPin } from 'lucide-react';

const Hotels = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/hotels');
    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // Initial Form State sesuai DB Schema baru
    const initialForm = { 
        name: '', city: 'Makkah', rating: '5', 
        distance_to_haram: 0, map_url: '' 
    };
    const [formData, setFormData] = useState(initialForm);

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
        { header: 'Nama Hotel', accessor: 'name', className: 'font-bold' },
        { header: 'Kota', accessor: 'city' },
        { header: 'Bintang', accessor: 'rating', render: r => (
            <div className="flex text-yellow-500">
                {[...Array(Number(r.rating))].map((_, i) => <span key={i}>★</span>)}
            </div>
        )},
        { header: 'Jarak (m)', accessor: 'distance_to_haram', render: r => r.distance_to_haram ? `${r.distance_to_haram} m` : '-' },
        { header: 'Map', accessor: 'map_url', render: r => r.map_url ? <a href={r.map_url} target="_blank" className="text-blue-600 hover:underline"><MapPin size={16}/></a> : '-' }
    ];

    return (
        <Layout title="Master Hotel">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2">
                    <Plus size={18}/> Tambah Hotel
                </button>
            </div>
            
            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Hotel" : "Edit Hotel"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Nama Hotel</label>
                            <input className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
                        </div>
                        
                        <div>
                            <label className="label">Kota Lokasi</label>
                            <select className="input-field" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                                <option value="Makkah">Makkah</option>
                                <option value="Madinah">Madinah</option>
                                <option value="Jeddah">Jeddah</option>
                                <option value="Istanbul">Istanbul</option>
                                <option value="Cairo">Cairo</option>
                                <option value="Dubai">Dubai</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Rating Bintang</label>
                            <select className="input-field" value={formData.rating} onChange={e=>setFormData({...formData, rating: e.target.value})}>
                                <option value="5">5 Bintang</option>
                                <option value="4">4 Bintang</option>
                                <option value="3">3 Bintang</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="label">Jarak ke Masjid (Meter)</label>
                            <input type="number" className="input-field" value={formData.distance_to_haram} onChange={e=>setFormData({...formData, distance_to_haram: e.target.value})} placeholder="0" />
                        </div>

                        <div>
                            <label className="label">Google Maps URL</label>
                            <input type="url" className="input-field" value={formData.map_url} onChange={e=>setFormData({...formData, map_url: e.target.value})} placeholder="https://goo.gl/maps/..." />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Hotels;