import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Plane } from 'lucide-react';

const Flights = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/flights');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);

    const initialForm = { name: '', code: '', origin: 'JKT', destination: 'JED' };
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
        { header: 'Nama Maskapai', accessor: 'name', render: r => <div className="font-bold text-blue-900">{r.name}</div> },
        { header: 'Kode', accessor: 'code', render: r => <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{r.code || '-'}</span> },
        { header: 'Rute Default', render: r => <span className="text-sm text-gray-600">{r.origin} ➝ {r.destination}</span> }
    ];

    return (
        <Layout title="Master Maskapai">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="font-bold text-gray-800">Daftar Maskapai</h2>
                    <p className="text-xs text-gray-500">Data maskapai untuk paket perjalanan.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah Maskapai
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={i => handleOpenModal('edit', i)} 
                    // PERBAIKAN: Kirim item.id
                    onDelete={(item) => deleteItem(item.id)} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Maskapai" : "Edit Maskapai"} size="max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Maskapai</label>
                        <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Garuda Indonesia" />
                    </div>
                    <div>
                        <label className="label">Kode (Opsional)</label>
                        <input className="input-field" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Contoh: GA" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Asal Default</label>
                            <input className="input-field" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} placeholder="JKT" />
                        </div>
                        <div>
                            <label className="label">Tujuan Default</label>
                            <input className="input-field" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="JED" />
                        </div>
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
export default Flights;