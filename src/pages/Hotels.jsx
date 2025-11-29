import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus } from 'lucide-react';

const Hotels = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/hotels');
    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [isCustomCity, setIsCustomCity] = useState(false);
    const [formData, setFormData] = useState({ name: '', city: 'Makkah', rating: '5' });

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode); setCurrentItem(item);
        const defaultCity = item?.city || 'Makkah';
        const isStandard = ['Makkah', 'Madinah', 'Jeddah', 'Transit'].includes(defaultCity);
        setIsCustomCity(!isStandard);
        setFormData(item || { name: '', city: 'Makkah', rating: '5' });
        setIsModalOpen(true);
    };

    // Point 6: Logic Tambah Kota Baru
    const handleCitySelectChange = (e) => {
        if (e.target.value === 'custom') {
            setIsCustomCity(true);
            setFormData(prev => ({ ...prev, city: '' }));
        } else {
            setIsCustomCity(false);
            setFormData(prev => ({ ...prev, city: e.target.value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Hotel', accessor: 'name' },
        { header: 'Kota', accessor: 'city' },
        { header: 'Bintang', accessor: 'rating' }
    ];

    return (
        <Layout title="Master Hotel">
            <div className="mb-4 flex justify-end"><button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2"><Plus size={18}/> Tambah Hotel</button></div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Data Hotel">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Hotel</label><input className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required /></div>
                    
                    {/* Point 6: Select dengan Opsi Custom */}
                    <div>
                        <label className="label">Kota Lokasi</label>
                        {!isCustomCity ? (
                            <select className="input-field" value={formData.city} onChange={handleCitySelectChange}>
                                <option value="Makkah">Makkah</option>
                                <option value="Madinah">Madinah</option>
                                <option value="Jeddah">Jeddah</option>
                                <option value="Transit">Transit</option>
                                <option value="custom" className="font-bold text-blue-600">+ Tambah Kota Baru (Dubai, Turkey, dll)</option>
                            </select>
                        ) : (
                            <div className="flex gap-2">
                                <input className="input-field" placeholder="Ketik Nama Kota Baru..." value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} autoFocus required />
                                <button type="button" onClick={()=>{setIsCustomCity(false); setFormData(prev=>({...prev, city: 'Makkah'}))}} className="btn-secondary text-xs">Batal</button>
                            </div>
                        )}
                    </div>

                    <div><label className="label">Rating</label><select className="input-field" value={formData.rating} onChange={e=>setFormData({...formData, rating: e.target.value})}><option value="5">5 Bintang</option><option value="4">4 Bintang</option></select></div>
                    <div className="flex justify-end gap-2"><button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Hotels;