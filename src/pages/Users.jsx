import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import { useData } from '../contexts/DataContext';
import { User, Shield, UserCheck, Mail, Phone, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
    const { user: currentUser } = useData();
    
    const { 
        data, 
        loading, 
        pagination,
        fetchData, 
        createItem, 
        updateItem, 
        deleteItem,
        changePage,
        changeLimit
    } = useCRUD('umh/v1/users');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({});
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = (q) => {
        setSearchQuery(q);
        fetchData(1, pagination.limit, q);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editId && formData.password !== confirmPassword) {
            return toast.error('Password dan Konfirmasi Password tidak sama!');
        }
        if (editId && formData.password && formData.password !== confirmPassword) {
            return toast.error('Password baru dan konfirmasi tidak sama!');
        }

        const payload = { ...formData };
        if (editId && !payload.password) delete payload.password;

        const success = editId ? await updateItem(editId, payload) : await createItem(payload);
        if (success) {
            setIsModalOpen(false);
            setConfirmPassword('');
            toast.success(editId ? 'User berhasil diperbarui' : 'User baru berhasil dibuat');
        }
    };

    const handleDelete = async (item) => {
        if (currentUser && item.id === currentUser.id) {
            return toast.error("Anda tidak dapat menghapus akun Anda sendiri!");
        }
        
        if (window.confirm(`Apakah Anda yakin ingin menghapus user "${item.username}"?`)) {
            await deleteItem(item.id);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setFormData({ ...item, password: '' });
            setEditId(item.id);
        } else {
            setFormData({ role: 'subscriber', status: 'active' });
            setEditId(null);
        }
        setConfirmPassword('');
        setIsModalOpen(true);
    };

    const columns = [
        { 
            header: 'User Info', 
            accessor: 'username', 
            render: r => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                        {r.full_name ? r.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{r.full_name}</div>
                        <div className="text-xs text-gray-500">@{r.username}</div>
                    </div>
                </div>
            )
        },
        { header: 'Kontak', accessor: 'email', render: r => (
            <div className="text-sm">
                <div className="flex items-center gap-1"><Mail size={12} className="text-gray-400"/> {r.email}</div>
                <div className="flex items-center gap-1"><Phone size={12} className="text-gray-400"/> {r.phone || '-'}</div>
            </div>
        )},
        { 
            header: 'Role', 
            accessor: 'role', 
            render: r => {
                const role = r.role;
                let colorClass = 'bg-gray-100 text-gray-800';
                if (role === 'administrator') colorClass = 'bg-purple-100 text-purple-800';
                if (role === 'agent') colorClass = 'bg-blue-100 text-blue-800';
                if (role === 'editor') colorClass = 'bg-yellow-100 text-yellow-800';

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize flex w-fit items-center gap-1 ${colorClass}`}>
                        {role === 'administrator' && <Shield size={10} />}
                        {role}
                    </span>
                );
            } 
        },
        { header: 'Status', accessor: 'status', render: r => (
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {r.status}
             </span>
        )}
    ];

    return (
        <Layout title="Manajemen Pengguna">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput 
                        placeholder="Cari nama, username atau email..." 
                        onSearch={handleSearch} 
                    />
                </div>
                <button 
                    onClick={() => openModal()} 
                    className="btn-primary flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                >
                    <UserCheck size={18}/> Tambah User
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={openModal} 
                    onDelete={handleDelete} 
                />
                <Pagination 
                    pagination={pagination}
                    onPageChange={changePage}
                    onLimitChange={changeLimit}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit User" : "Tambah User Baru"}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Section: Akun Login */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><Key size={14}/> Informasi Login</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="label">Username</label>
                                <input 
                                    className={`input-field ${editId ? 'bg-gray-100' : ''}`}
                                    value={formData.username || ''} 
                                    onChange={e => setFormData({...formData, username: e.target.value})} 
                                    required 
                                    disabled={!!editId} 
                                    placeholder="johndoe"
                                />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input 
                                    type="email" 
                                    className="input-field" 
                                    value={formData.email || ''} 
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                    required 
                                    placeholder="user@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Profil Pengguna */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><User size={14}/> Profil Pengguna</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="label">Nama Lengkap</label>
                                <input 
                                    className="input-field" 
                                    value={formData.full_name || ''} 
                                    onChange={e => setFormData({...formData, full_name: e.target.value})} 
                                    required 
                                    placeholder="Nama Lengkap User"
                                />
                            </div>
                            <div>
                                <label className="label">No. Telepon</label>
                                <input 
                                    className="input-field" 
                                    value={formData.phone || ''} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    placeholder="0812..."
                                />
                            </div>
                            <div>
                                <label className="label">Role / Peran</label>
                                <select 
                                    className="input-field capitalize" 
                                    value={formData.role || 'subscriber'} 
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="subscriber">Subscriber (Jemaah)</option>
                                    <option value="administrator">Administrator (Full)</option>
                                    <option value="admin_staff">Admin Staff</option>
                                    <option value="finance_staff">Finance Staff</option>
                                    <option value="marketing_staff">Marketing Staff</option>
                                    <option value="agent">Agent (Mitra)</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Status Akun</label>
                                <select 
                                    className="input-field" 
                                    value={formData.status || 'active'} 
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Non-Aktif / Blokir</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Password */}
                    <div className="border-t pt-4 mt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Shield size={14}/> {editId ? 'Ubah Password (Opsional)' : 'Buat Password'}
                            </h4>
                        </div>
                        
                        {editId && (
                            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded mb-2">
                                Kosongkan jika tidak ingin mengubah password.
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Password</label>
                                <input 
                                    type="password" 
                                    className="input-field" 
                                    value={formData.password || ''} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    placeholder="********" 
                                    required={!editId} 
                                    minLength={6}
                                />
                            </div>
                            
                            <div>
                                <label className="label">Konfirmasi</label>
                                <input 
                                    type="password" 
                                    className={`input-field ${confirmPassword && formData.password !== confirmPassword ? 'border-red-500' : ''}`}
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                    placeholder="********" 
                                    required={!editId || formData.password}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="btn-secondary"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary w-32"
                            disabled={!editId && (!formData.password || formData.password !== confirmPassword)}
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Users;