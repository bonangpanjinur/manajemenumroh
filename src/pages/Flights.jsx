import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Plane } from 'lucide-react';

const Flights = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/flights');
    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', iata_code: '', logo_url: '' });

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode); 
        setCurrentItem(item);
        setFormData(item || { name: '', iata_code: '', logo_url: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Logo', accessor: 'logo_url', render: r => (
            r.logo_url ? <img src={r.logo_url} alt={r.name} className="h-8 w-8 object-contain rounded-full bg-gray-50 border" /> : <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"><Plane size={16} className="text-gray-500"/></div>
        )},
        { header: 'Nama Maskapai', accessor: 'name', className: 'font-bold' },
        { header: 'Kode IATA', accessor: 'iata_code', render: r => <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">{r.iata_code || '-'}</span> },
    ];

    return (
        <Layout title="Master Maskapai Penerbangan">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2">
                    <Plus size={18}/> Tambah Maskapai
                </button>
            </div>
            
            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Maskapai" : "Edit Maskapai"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Maskapai</label>
                        <input className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Contoh: Garuda Indonesia" required />
                    </div>
                    <div>
                        <label className="label">Kode IATA</label>
                        <input className="input-field uppercase" maxLength="3" value={formData.iata_code} onChange={e=>setFormData({...formData, iata_code: e.target.value})} placeholder="Contoh: GA" />
                    </div>
                    <div>
                        <label className="label">URL Logo (Opsional)</label>
                        <input className="input-field" value={formData.logo_url} onChange={e=>setFormData({...formData, logo_url: e.target.value})} placeholder="https://..." />
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
export default Flights;