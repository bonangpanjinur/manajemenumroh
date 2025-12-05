import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', role: 'subscriber', password: '' });
    const [mode, setMode] = useState('create');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post('umh/v1/users', form);
                toast.success("User dibuat");
            } else {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await api.put(`umh/v1/users/${form.id}`, payload);
                toast.success("User diupdate");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Gagal: " + err.message);
        }
    };

    const columns = [
        { header: 'Username', accessor: 'username', render: r => <span className="font-bold">{r.username}</span> },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role', render: r => <span className="bg-gray-200 px-2 py-1 rounded text-xs">{r.role}</span> },
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-xs ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {r.status}
            </span>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
                <button 
                    onClick={() => { setMode('create'); setForm({ username: '', email: '', role: 'subscriber', password: '' }); setIsModalOpen(true); }} 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18}/> Tambah User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading}
                    onEdit={(item) => { setMode('edit'); setForm({ ...item, password: '' }); setIsModalOpen(true); }}
                    onDelete={(item) => { if(window.confirm('Hapus user?')) deleteItem(item.id); }}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah User" : "Edit User"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Username</label>
                        <input className="input-field" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required disabled={mode === 'edit'} />
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                    </div>
                    <div>
                        <label className="label">Role</label>
                        <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                            <option value="administrator">Administrator</option>
                            <option value="editor">Editor</option>
                            <option value="author">Author</option>
                            <option value="subscriber">Subscriber</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Password {mode === 'edit' && '(Kosongkan jika tidak diganti)'}</label>
                        <input type="password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={mode === 'create'} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;