import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Phone, DollarSign, Users, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Agents = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/agents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    const masterAgents = data ? data.filter(a => a.type === 'master') : [];
    
    // Gunakan 'fixed_commission' agar sesuai dengan database
    const initialForm = { name: '', phone: '', email: '', fixed_commission: 0, parent_id: '', status: 'active' };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item ? { 
            ...item, 
            fixed_commission: item.fixed_commission || 0, // Pastikan nilai terisi
            parent_id: item.parent_id || '' 
        } : initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        
        if (success) {
            setIsModalOpen(false);
            fetchData(); // Refresh data untuk memastikan perubahan tampil
        }
    };

    const columns = [
        { header: 'Kode', accessor: 'code', render: r => <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{r.code}</span> },
        { header: 'Nama Agen', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900 flex items-center gap-2">
                    {r.type === 'master' ? <Users size={16} className="text-blue-600"/> : <ArrowRight size={14} className="text-gray-400 ml-2"/>}
                    {r.name}
                </div>
                <div className="text-[10px] uppercase text-gray-500 font-bold ml-6">{r.type === 'master' ? 'Master' : `Sub: ${r.parent_name || '-'}`}</div>
            </div>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => <div className="text-sm"><Phone size={12} className="inline"/> {r.phone}</div> },
        { header: 'Komisi', accessor: 'fixed_commission', render: r => <div className="text-green-600 font-bold">{formatCurrency(r.fixed_commission)}</div> },
        { header: 'Status', accessor: 'status', render: r => <span className={`badge ${r.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>{r.status}</span> }
    ];

    return (
        <Layout title="Manajemen Agen & Mitra">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div><h2 className="font-bold text-gray-800">Data Agen</h2><p className="text-xs text-gray-500">Kelola Master dan Sub Agen.</p></div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2"><Plus size={18} /> Tambah Agen</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={item => deleteItem(item.id)} />
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Registrasi Agen" : "Edit Agen"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Lengkap</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">No. WhatsApp</label><input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
                        <div><label className="label">Email</label><input className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                        <label className="label text-blue-800">Upline / Induk (Opsional)</label>
                        <select className="input-field" value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})}>
                            <option value="">-- Jadikan Master Agent --</option>
                            {masterAgents.map(m => (!currentItem || m.id !== currentItem.id) && <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                        </select>
                        <p className="text-[10px] text-blue-600 mt-1">* Kosongkan untuk Master Agent. Pilih untuk Sub Agent.</p>
                    </div>
                    {/* Input Komisi menggunakan field 'fixed_commission' */}
                    <div><label className="label">Komisi (Rp)</label><input className="input-field" type="number" value={formData.fixed_commission} onChange={e => setFormData({...formData, fixed_commission: e.target.value})} /></div>
                    <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Agents;