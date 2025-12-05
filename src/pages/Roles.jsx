import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Shield, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Roles = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/roles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({ role_name: '', role_key: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                // Auto generate key dari name jika kosong
                if(!form.role_key) form.role_key = form.role_name.toLowerCase().replace(/\s+/g, '_');
                
                await api.post('umh/v1/roles', form);
                toast.success("Role berhasil dibuat");
            } else {
                const id = form.uuid || form.id;
                await api.put(`umh/v1/roles/${id}`, form);
                toast.success("Role diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };

    const columns = [
        { header: 'Nama Role', accessor: 'role_name', render: r => <span className="font-bold text-gray-800">{r.role_name}</span> },
        { header: 'Kunci (Key)', accessor: 'role_key', render: r => <code className="bg-gray-100 px-2 py-1 rounded text-xs text-red-500">{r.role_key}</code> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Hak Akses</h1>
                <button onClick={() => { setMode('create'); setForm({}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Role
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Role" : "Edit Role"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Role</label>
                        <input className="input-field" value={form.role_name || ''} onChange={e => setForm({...form, role_name: e.target.value})} required placeholder="Contoh: Staff Gudang" />
                    </div>
                    <div>
                        <label className="label">Key (Unik)</label>
                        <input className="input-field" value={form.role_key || ''} onChange={e => setForm({...form, role_key: e.target.value})} placeholder="staff_gudang" />
                        <p className="text-xs text-gray-400 mt-1">Biarkan kosong untuk auto-generate dari nama.</p>
                    </div>
                    <button type="submit" className="btn-primary w-full mt-4">Simpan</button>
                </form>
            </Modal>
        </div>
    );
};

export default Roles;