import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import CrudTable from '../components/CrudTable.jsx';
import Modal from '../components/Modal.jsx';
import useCRUD from '../hooks/useCRUD.js';
import { Plus, Plane, ArrowRight } from 'lucide-react';

const Flights = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/flights');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // Menambahkan state 'transit' pada initial form
    const [formData, setFormData] = useState({ 
        name: '', 
        code: '', 
        origin: 'Jakarta (CGK)', 
        destination: 'Jeddah (JED)', 
        transit: '', 
        contact_info: '' 
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { 
            name: '', 
            code: '', 
            origin: 'Jakarta (CGK)', 
            destination: 'Jeddah (JED)', 
            transit: '', 
            contact_info: '' 
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) { setIsModalOpen(false); fetchData(); }
    };

    const columns = [
        { header: 'Maskapai', accessor: 'name', render: r => <div className="font-bold flex gap-2"><Plane size={16}/> {r.name}</div> },
        { header: 'Kode', accessor: 'code' },
        { 
            header: 'Rute Default', 
            accessor: 'origin', 
            render: r => (
                <span className="text-xs flex items-center gap-1">
                    {r.origin} 
                    <ArrowRight size={10} /> 
                    {r.transit && <><span className="text-orange-600 font-semibold">{r.transit}</span> <ArrowRight size={10} /> </>}
                    {r.destination}
                </span> 
            )
        },
        { header: 'Kontak', accessor: 'contact_info' }
    ];

    return (
        <Layout title="Master Maskapai">
            <div className="flex justify-end mb-4"><button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2"><Plus size={18}/> Tambah Maskapai</button></div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={item => handleOpenModal('edit', item)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Data Maskapai">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Nama Maskapai</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Garuda Indonesia" /></div>
                        <div><label className="label">Kode Penerbangan</label><input className="input-field" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="GA" /></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Asal (Origin)</label><input className="input-field" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} /></div>
                        <div><label className="label">Tujuan (Dest)</label><input className="input-field" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} /></div>
                    </div>
                    
                    {/* Input Transit Baru */}
                    <div>
                        <label className="label">Transit (Opsional)</label>
                        <input className="input-field" value={formData.transit} onChange={e => setFormData({...formData, transit: e.target.value})} placeholder="Contoh: Dubai (DXB) atau Kuala Lumpur (KUL)" />
                    </div>

                    <div><label className="label">Info Kontak</label><input className="input-field" value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})} /></div>
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Flights;