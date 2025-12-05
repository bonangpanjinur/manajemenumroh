import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Users, DollarSign, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Agents = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/agents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({ name: '', email: '', phone: '', code: '', type: 'agent' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post('umh/v1/agents', form);
                toast.success("Agen terdaftar");
            } else {
                const id = form.uuid || form.id;
                await api.put(`umh/v1/agents/${id}`, form);
                toast.success("Data agen diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };

    const columns = [
        { header: 'Nama Agen', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.name}</div>
                <div className="text-xs text-blue-600 bg-blue-50 px-1 rounded inline-block">Ref Code: {r.code}</div>
            </div>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => <div className="text-sm">{r.phone}<br/><span className="text-xs text-gray-400">{r.email}</span></div> },
        { header: 'Tipe', accessor: 'type', render: r => <span className="capitalize">{r.type}</span> },
        { header: 'Komisi', accessor: 'id', render: r => (
            <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                <DollarSign size={12}/> Cek Komisi
            </button>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Kemitraan & Agen</h1>
                <button onClick={() => { setMode('create'); setForm({}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Daftar Agen Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Agen" : "Edit Agen"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Lengkap</label><input className="input-field" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Email</label><input type="email" className="input-field" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} /></div>
                        <div><label className="label">No HP</label><input className="input-field" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                    </div>
                    <div><label className="label">Kode Referral (Unik)</label><input className="input-field" value={form.code || ''} onChange={e => setForm({...form, code: e.target.value})} placeholder="AGEN-001" required /></div>
                    <button type="submit" className="btn-primary w-full mt-4">Simpan</button>
                </form>
            </Modal>
        </div>
    );
};

export default Agents;