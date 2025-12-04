import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, User, Shield, Edit, Trash, Key, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    
    // Form State
    const initialForm = { 
        username: '', 
        email: '', 
        password: '', // Password hanya required saat create
        full_name: '', 
        role_key: 'subscriber', 
        status: 'active' 
    };
    const [form, setForm] = useState(initialForm);

    // Filter State (Client-side filtering for simplicity)
    const [roleFilter, setRoleFilter] = useState('all');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await api.post('umh/v1/users', form);
                toast.success("User berhasil dibuat");
            } else {
                // Update User (Password opsional di backend)
                await api.put(`umh/v1/users/${form.id}`, form);
                toast.success("Data user diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch(e) { 
            toast.error("Gagal simpan: " + (e.message || "Server Error")); 
        }
    };

    const handleEdit = (user) => {
        setForm({
            ...user,
            password: '' // Kosongkan password saat edit (hanya diisi jika ingin ubah)
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Yakin hapus user ini? Akses login akan hilang.")) {
            const success = await deleteItem(id);
            if(success) toast.success("User dihapus");
        }
    };

    const handleResetPassword = async (id) => {
        const newPass = prompt("Masukkan password baru untuk user ini:");
        if (newPass) {
            try {
                await api.put(`umh/v1/users/${id}`, { password: newPass });
                toast.success("Password berhasil direset");
            } catch (e) {
                toast.error("Gagal reset password");
            }
        }
    };

    // Columns Configuration
    const columns = [
        { header: 'User Info', accessor: 'username', render: r => (
            <div>
                <div className="font-bold text-gray-900 flex items-center gap-2">
                    <User size={16} className="text-gray-400"/> {r.username}
                </div>
                <div className="text-xs text-gray-500">{r.email}</div>
            </div>
        )},
        { header: 'Nama Lengkap', accessor: 'full_name', render: r => <span className="font-medium">{r.full_name}</span> },
        { header: 'Role', accessor: 'role_key', render: r => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${
                r.role_key === 'administrator' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                r.role_key === 'agent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
                {r.role_key}
            </span>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`flex items-center gap-1 text-xs font-bold ${r.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {r.status === 'active' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                {r.status.toUpperCase()}
            </span>
        )},
        { header: 'Aksi', accessor: 'id', render: r => (
            <div className="flex gap-2">
                <button onClick={() => handleEdit(r)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit User">
                    <Edit size={16}/>
                </button>
                <button onClick={() => handleResetPassword(r.id)} className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="Reset Password">
                    <Key size={16}/>
                </button>
                {r.role_key !== 'administrator' && (
                    <button onClick={() => handleDelete(r.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus User">
                        <Trash size={16}/>
                    </button>
                )}
            </div>
        )}
    ];

    // Filter Data
    const filteredData = roleFilter === 'all' 
        ? data 
        : data.filter(u => u.role_key === roleFilter);

    return (
        <Layout title="Manajemen Pengguna (User)">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                        <Shield size={20}/> Daftar Akun
                    </h2>
                    
                    {/* Role Filter */}
                    <select 
                        className="input-field py-1 text-sm w-40" 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">Semua Role</option>
                        <option value="administrator">Administrator</option>
                        <option value="editor">Staff Admin</option>
                        <option value="finance">Finance</option>
                        <option value="agent">Agen Travel</option>
                        <option value="subscriber">User Biasa</option>
                    </select>
                </div>

                <button 
                    onClick={() => { 
                        setModalMode('create'); 
                        setForm(initialForm); 
                        setIsModalOpen(true); 
                    }} 
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <Plus size={18}/> Buat User Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={filteredData} 
                    loading={loading} 
                    emptyMessage="Tidak ada user ditemukan."
                />
            </div>

            {/* MODAL USER FORM */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Buat Akun Baru" : "Edit Akun User"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Lengkap</label>
                        <input 
                            className="input-field" 
                            value={form.full_name} 
                            onChange={e => setForm({...form, full_name: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Username</label>
                            <input 
                                className="input-field" 
                                value={form.username} 
                                onChange={e => setForm({...form, username: e.target.value})} 
                                required 
                                disabled={modalMode === 'edit'} // Username tidak boleh diganti
                            />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input 
                                type="email" 
                                className="input-field" 
                                value={form.email} 
                                onChange={e => setForm({...form, email: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">
                            {modalMode === 'create' ? 'Password' : 'Password Baru (Opsional)'}
                        </label>
                        <input 
                            type="password" 
                            className="input-field" 
                            value={form.password} 
                            onChange={e => setForm({...form, password: e.target.value})} 
                            required={modalMode === 'create'} // Required only on create
                            placeholder={modalMode === 'edit' ? 'Biarkan kosong jika tidak ingin mengubah' : ''}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Role / Peran</label>
                            <select 
                                className="input-field" 
                                value={form.role_key} 
                                onChange={e => setForm({...form, role_key: e.target.value})}
                            >
                                <option value="administrator">Administrator</option>
                                <option value="editor">Staff Admin</option>
                                <option value="finance">Finance</option>
                                <option value="agent">Agen Travel</option>
                                <option value="subscriber">User Biasa</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Status Akun</label>
                            <select 
                                className="input-field" 
                                value={form.status} 
                                onChange={e => setForm({...form, status: e.target.value})}
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended (Blokir)</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t mt-4 gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">
                            {modalMode === 'create' ? 'Buat Akun' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Users;