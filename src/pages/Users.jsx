import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, User, Shield, Key } from 'lucide-react';

const Users = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/users');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);

    const initialForm = { 
        username: '', 
        email: '', 
        full_name: '', 
        role: 'subscriber', // FIX: Gunakan 'role' tunggal
        password: '' 
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        // Reset password saat edit
        setFormData(item ? { ...item, password: '' } : initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Username', accessor: 'username', render: r => (
            <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-full text-blue-600"><User size={16}/></div>
                <span className="font-bold text-gray-700">{r.username}</span>
            </div>
        )},
        { header: 'Nama Lengkap', accessor: 'full_name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                r.role === 'administrator' ? 'bg-purple-100 text-purple-700' : 
                r.role === 'editor' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
            }`}>
                {r.role}
            </span>
        )}
    ];

    return (
        <Layout title="Manajemen Pengguna">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="font-bold text-gray-800">Daftar Staf & Admin</h2>
                    <p className="text-xs text-gray-500">Kelola akses pengguna ke dalam sistem.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={i => handleOpenModal('edit', i)} 
                    onDelete={item => deleteItem(item.id)} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Pengguna" : "Edit Pengguna"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Username</label>
                            <input className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required disabled={modalMode === 'edit'} />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="label">Nama Lengkap</label>
                        <input className="input-field" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                    </div>

                    <div>
                        <label className="label flex items-center gap-2"><Shield size={14}/> Role Akses</label>
                        <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="subscriber">Staff (Subscriber)</option>
                            <option value="editor">Manager (Editor)</option>
                            <option value="administrator">Administrator</option>
                            <option value="owner">Owner</option>
                        </select>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                        <label className="label flex items-center gap-2 text-yellow-800"><Key size={14}/> Password</label>
                        <input type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={modalMode === 'edit' ? "Kosongkan jika tidak diubah" : "Password kuat..."} required={modalMode === 'create'} />
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
export default Users;