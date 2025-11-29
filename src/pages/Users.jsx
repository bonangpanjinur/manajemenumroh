import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Shield, User } from 'lucide-react';

const Users = () => {
    // Endpoint users untuk manajemen staff internal
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/users');
    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // Role disesuaikan dengan menuConfig.js
    const initialForm = { username: '', email: '', role: 'admin_staff', password: '' };
    const [formData, setFormData] = useState(initialForm);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        // Kosongkan password saat edit agar tidak tertimpa jika tidak diisi
        setFormData(item ? { ...item, password: '' } : initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Username', accessor: 'username', render: r => (
            <div className="flex items-center gap-2 font-bold text-gray-800">
                <div className="p-1 bg-gray-100 rounded-full"><User size={14}/></div> {r.username}
            </div>
        )},
        { header: 'Email', accessor: 'email' },
        { header: 'Role Akses', accessor: 'role', render: r => (
            <span className={`badge uppercase text-xs flex items-center gap-1 w-fit
                ${r.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 
                  r.role === 'finance_staff' ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
                <Shield size={10}/> {r.role.replace('_', ' ')}
            </span>
        )}
    ];

    return (
        <Layout title="Manajemen Pengguna Sistem">
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2">
                    <Plus size={18}/> Tambah User Staff
                </button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah User Baru" : "Edit User"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Username</label>
                        <input className="input-field" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} required />
                    </div>
                    <div>
                        <label className="label">Email Login</label>
                        <input type="email" className="input-field" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div>
                        <label className="label">Role (Hak Akses)</label>
                        <select className="input-field" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})}>
                            <option value="admin_staff">Admin Staff (Umum)</option>
                            <option value="finance_staff">Finance (Keuangan)</option>
                            <option value="marketing_staff">Marketing (Penjualan)</option>
                            <option value="hr_staff">HR (Karyawan)</option>
                            <option value="administrator">Administrator (Manajer)</option>
                            <option value="super_admin">Super Admin (IT/Owner)</option>
                        </select>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100 mt-2">
                        <label className="label">{modalMode === 'edit' ? 'Password Baru (Kosongkan jika tidak ubah)' : 'Password'}</label>
                        <input type="password" className="input-field" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} placeholder="******" required={modalMode === 'create'} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan User</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Users;