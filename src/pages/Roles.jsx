import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { ShieldCheck, Plus } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Roles = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/roles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ role_name: '', role_key: '' });
    const [mode, setMode] = useState('create');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/roles', form);
            else await api.put(`umh/v1/roles/${form.id}`, form);
            toast.success("Role berhasil disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan role"); }
    };

    const columns = [
        { header: 'Nama Role', accessor: 'role_name', render: r => <span className="font-bold">{r.role_name}</span> },
        { header: 'Key / Slug', accessor: 'role_key', render: r => <code className="bg-gray-100 px-2 py-1 rounded text-xs">{r.role_key}</code> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manajemen Role & Akses</h1>
                        <p className="text-gray-500 text-sm">Atur hak akses pengguna aplikasi.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setMode('create'); setForm({ role_name: '', role_key: '' }); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Tambah Role
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading}
                    onEdit={(item) => { setMode('edit'); setForm(item); setIsModalOpen(true); }}
                    onDelete={(item) => deleteItem(item.id)}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Role" : "Edit Role"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Role</label>
                        <input className="input-field" value={form.role_name} onChange={e => setForm({...form, role_name: e.target.value})} required placeholder="Contoh: Staff Keuangan" />
                    </div>
                    <div>
                        <label className="label">Key (Slug)</label>
                        <input className="input-field" value={form.role_key} onChange={e => setForm({...form, role_key: e.target.value})} required placeholder="staff_finance" />
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Roles;