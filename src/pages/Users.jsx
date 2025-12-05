import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Users as UsersIcon, Shield, User, Smartphone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    
    // State untuk filter Tab
    const [userType, setUserType] = useState('internal'); // 'internal' | 'jamaah'

    // Initial Form State (Sesuai Database V7.0)
    const initialForm = { 
        username: '', 
        email: '', 
        full_name: '',
        phone: '',
        role_key: 'jamaah', 
        password: '',
        status: 'active'
    };
    const [form, setForm] = useState(initialForm);

    // Filter Data Berdasarkan Tab
    const filteredData = data.filter(user => {
        const isJamaah = user.role_key === 'jamaah';
        return userType === 'jamaah' ? isJamaah : !isJamaah;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validasi sederhana
            if (mode === 'create' && !form.password) {
                toast.error("Password wajib diisi untuk user baru");
                return;
            }

            if (mode === 'create') {
                await api.post('umh/v1/users', form);
                toast.success("User berhasil dibuat");
            } else {
                const payload = { ...form };
                // Jangan kirim password kosong saat edit (agar tidak kereset)
                if (!payload.password) delete payload.password;
                // Gunakan UUID jika ada, fallback ke ID
                const id = form.uuid || form.id;
                await api.put(`umh/v1/users/${id}`, payload);
                toast.success("User berhasil diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Gagal: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (item) => {
        setMode('edit');
        // Reset password field saat edit mode dibuka
        setForm({ ...item, password: '' }); 
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Hapus user ${item.username}? Data terkait mungkin akan hilang.`)) {
            await deleteItem(item); // useCRUD sekarang support item object (UUID)
        }
    };

    // Kolom Tabel
    const columns = [
        { header: 'Pengguna', accessor: 'username', render: r => (
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                    r.role_key === 'administrator' ? 'bg-purple-600' : 
                    r.role_key === 'jamaah' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                    {r.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="font-bold text-gray-900">{r.full_name || r.username}</div>
                    <div className="text-xs text-gray-500 font-mono">@{r.username}</div>
                </div>
            </div>
        )},
        { header: 'Kontak', accessor: 'email', render: r => (
            <div className="text-sm space-y-1">
                <div className="flex items-center gap-2 text-gray-700">
                    <Mail size={14} className="text-gray-400"/> {r.email}
                </div>
                {r.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Smartphone size={14} className="text-gray-400"/> {r.phone}
                    </div>
                )}
            </div>
        )},
        { header: 'Role & Akses', accessor: 'role_key', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                r.role_key === 'administrator' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                r.role_key === 'jamaah' ? 'bg-green-50 text-green-700 border-green-200' :
                'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
                {r.role_key}
            </span>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                r.status === 'active' ? 'bg-green-100 text-green-600' : 
                r.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
            }`}>
                {r.status}
            </span>
        )}
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
                    <p className="text-gray-500 text-sm">Kelola akun untuk Staff, Agen, dan Jemaah App.</p>
                </div>
                <button 
                    onClick={() => { setMode('create'); setForm(initialForm); setIsModalOpen(true); }} 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18}/> Tambah User Baru
                </button>
            </div>

            {/* Tabs Filter */}
            <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
                <button 
                    onClick={() => setUserType('internal')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        userType === 'internal' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Shield size={16}/> Staff & Admin
                </button>
                <button 
                    onClick={() => setUserType('jamaah')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        userType === 'jamaah' 
                        ? 'border-green-600 text-green-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <UsersIcon size={16}/> Jemaah (App User)
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-b-xl shadow border border-gray-200 border-t-0">
                <CrudTable 
                    columns={columns} 
                    data={filteredData} 
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Modal Form */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={mode === 'create' ? "Tambah User Baru" : `Edit: ${form.username}`}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Informasi Dasar */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Informasi Akun</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Username (Login)</label>
                                <input 
                                    className="input-field" 
                                    value={form.username} 
                                    onChange={e => setForm({...form, username: e.target.value})} 
                                    required 
                                    disabled={mode === 'edit'} // Username tidak boleh ganti
                                    placeholder="user123"
                                />
                            </div>
                            <div>
                                <label className="label">Role / Peran</label>
                                <select 
                                    className="input-field capitalize" 
                                    value={form.role_key} 
                                    onChange={e => setForm({...form, role_key: e.target.value})}
                                >
                                    <optgroup label="Internal">
                                        <option value="administrator">Administrator</option>
                                        <option value="staff">Staff Operasional</option>
                                        <option value="finance">Staff Keuangan</option>
                                    </optgroup>
                                    <optgroup label="Eksternal">
                                        <option value="jamaah">Jemaah (App User)</option>
                                        <option value="agent">Agen Travel</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label">Password {mode === 'edit' && <span className="text-xs text-gray-400 font-normal">(Biarkan kosong jika tidak ingin mengubah)</span>}</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                value={form.password} 
                                onChange={e => setForm({...form, password: e.target.value})} 
                                required={mode === 'create'} 
                                placeholder="******"
                            />
                        </div>
                    </div>

                    {/* Informasi Profil */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Profil Pengguna</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Nama Lengkap</label>
                                <input 
                                    className="input-field" 
                                    value={form.full_name} 
                                    onChange={e => setForm({...form, full_name: e.target.value})} 
                                    placeholder="Contoh: Ahmad Dahlan"
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Alamat Email</label>
                                    <input 
                                        type="email" 
                                        className="input-field" 
                                        value={form.email} 
                                        onChange={e => setForm({...form, email: e.target.value})} 
                                        required 
                                        placeholder="email@domain.com"
                                    />
                                </div>
                                <div>
                                    <label className="label">No. WhatsApp</label>
                                    <input 
                                        className="input-field" 
                                        value={form.phone} 
                                        onChange={e => setForm({...form, phone: e.target.value})} 
                                        placeholder="0812xxxx"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Status Akun</label>
                                <select 
                                    className="input-field" 
                                    value={form.status} 
                                    onChange={e => setForm({...form, status: e.target.value})}
                                >
                                    <option value="active">Active (Bisa Login)</option>
                                    <option value="suspended">Suspended (Ditangguhkan)</option>
                                    <option value="inactive">Inactive (Nonaktif)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32">Simpan User</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;