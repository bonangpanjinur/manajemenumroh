import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, UserCheck, Phone, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Agents = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/agents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);

    const initialForm = { name: '', phone: '', email: '', commission_rate: 0, status: 'active' };
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
        { header: 'Nama Agen', accessor: 'name', render: r => <div className="font-bold text-gray-900">{r.name}</div> },
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1"><Phone size={12}/> {r.phone}</div>
                <div className="text-xs text-gray-400">{r.email}</div>
            </div>
        )},
        { header: 'Komisi', accessor: 'commission_rate', render: r => (
            <div className="flex items-center gap-1 font-semibold text-green-700">
                <DollarSign size={14}/> {formatCurrency(r.commission_rate)}
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {r.status}
            </span>
        )}
    ];

    return (
        <Layout title="Manajemen Agen & Mitra">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="font-bold text-gray-800">Data Agen</h2>
                    <p className="text-xs text-gray-500">Mitra marketing yang membawa jemaah.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah Agen
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Registrasi Agen" : "Edit Agen"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Lengkap</label>
                        <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">No. WhatsApp</label>
                            <input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input className="input-field" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Komisi per Jemaah (Rp)</label>
                        <input className="input-field" type="number" value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: e.target.value})} />
                    </div>
                    <div>
                        <label className="label">Status Kemitraan</label>
                        <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif</option>
                            <option value="suspended">Ditangguhkan</option>
                        </select>
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
export default Agents;