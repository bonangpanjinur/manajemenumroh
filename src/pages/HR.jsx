import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Users, Briefcase, DollarSign, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/formatters';

const HR = () => {
    const { user } = useData();
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
    } = useCRUD('umh/v1/hr');
    
    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Statistik Sederhana (Client-side calculation dari data yang di-load)
    // Catatan: Idealnya statistik ini diambil dari endpoint khusus API jika datanya ribuan
    const stats = useMemo(() => {
        if (!data) return { total: 0, active: 0, expense: 0 };
        return {
            total: pagination?.total_items || data.length,
            active: data.filter(d => d.status === 'active').length,
            expense: data.reduce((acc, curr) => acc + (parseFloat(curr.salary) || 0), 0)
        };
    }, [data, pagination]);

    const handleSearch = (q) => {
        setSearchQuery(q);
        fetchData(1, pagination.limit, q);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = isEdit 
            ? await updateItem(formData.id, formData) 
            : await createItem(formData);
            
        if (success) {
            setIsModalOpen(false);
            toast.success(isEdit ? 'Data karyawan diperbarui' : 'Karyawan baru ditambahkan');
            fetchData(); // Refresh data
        }
    };

    const handleDelete = async (id) => {
        if (user.role !== 'administrator' && user.role !== 'owner') {
            return toast.error('Hanya Admin/Owner yang bisa menghapus karyawan.');
        }
        if (window.confirm('Yakin hapus data karyawan ini? Tindakan ini tidak bisa dibatalkan.')) {
            await deleteItem(id);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setFormData(item);
            setIsEdit(true);
        } else {
            setFormData({ status: 'active', joined_date: new Date().toISOString().split('T')[0] });
            setIsEdit(false);
        }
        setIsModalOpen(true);
    };

    const columns = [
        { 
            header: 'Nama Karyawan', 
            accessor: 'name', 
            render: (r) => (
                <div>
                    <div className="font-bold text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.email}</div>
                </div>
            )
        },
        { 
            header: 'Posisi & Kontak', 
            accessor: 'position', 
            render: (r) => (
                <div>
                    <div className="text-sm font-medium">{r.position || '-'}</div>
                    <div className="text-xs text-gray-500">{r.phone || '-'}</div>
                </div>
            )
        },
        { 
            header: 'Gaji Pokok', 
            accessor: 'salary', 
            className: 'text-right',
            render: r => formatCurrency(r.salary) 
        },
        { 
            header: 'Bergabung', 
            accessor: 'joined_date', 
            render: r => formatDate(r.joined_date) 
        },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: r => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {r.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
            ) 
        }
    ];

    // Komponen Kartu Statistik
    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <h3 className="text-xl font-bold text-gray-800">{value}</h3>
            </div>
        </div>
    );

    return (
        <Layout title="Manajemen SDM (HR)">
            {/* Statistik Ringkas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard 
                    icon={Users} 
                    label="Total Karyawan" 
                    value={stats.total} 
                    color="bg-blue-500" 
                />
                <StatCard 
                    icon={UserCheck} 
                    label="Karyawan Aktif" 
                    value={stats.active} 
                    color="bg-green-500" 
                />
                <StatCard 
                    icon={DollarSign} 
                    label="Est. Gaji Bulanan" 
                    value={formatCurrency(stats.expense)} 
                    color="bg-purple-500" 
                />
            </div>

            {/* Toolbar: Search & Add */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput 
                        placeholder="Cari nama atau posisi..." 
                        onSearch={handleSearch} 
                    />
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Karyawan
                </button>
            </div>

            {/* Tabel Data */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={openModal}
                    onDelete={(item) => handleDelete(item.id)}
                />
                
                {/* Pagination */}
                <Pagination 
                    pagination={pagination}
                    onPageChange={changePage}
                    onLimitChange={changeLimit}
                />
            </div>

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="label">Nama Lengkap</label>
                            <input 
                                className="input-field" 
                                value={formData.name || ''} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder="Contoh: Ahmad Fauzi"
                                required 
                            />
                        </div>
                        
                        <div>
                            <label className="label">Email</label>
                            <input 
                                type="email"
                                className="input-field" 
                                value={formData.email || ''} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                placeholder="email@perusahaan.com"
                            />
                        </div>
                        
                        <div>
                            <label className="label">No. Telepon / WA</label>
                            <input 
                                className="input-field" 
                                value={formData.phone || ''} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                placeholder="0812..."
                            />
                        </div>

                        <div>
                            <label className="label">Posisi / Jabatan</label>
                            <input 
                                className="input-field" 
                                value={formData.position || ''} 
                                onChange={e => setFormData({...formData, position: e.target.value})} 
                                placeholder="Contoh: Staff Keuangan"
                            />
                        </div>

                        <div>
                            <label className="label">Tanggal Bergabung</label>
                            <input 
                                type="date"
                                className="input-field" 
                                value={formData.joined_date || ''} 
                                onChange={e => setFormData({...formData, joined_date: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className="label">Gaji Pokok (Rp)</label>
                            <input 
                                type="number"
                                className="input-field" 
                                value={formData.salary || ''} 
                                onChange={e => setFormData({...formData, salary: e.target.value})} 
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="label">Status Kepegawaian</label>
                            <select 
                                className="input-field" 
                                value={formData.status || 'active'} 
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif / Resign</option>
                                <option value="probation">Masa Percobaan</option>
                                <option value="leave">Cuti</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                            Batal
                        </button>
                        <button type="submit" className="btn-primary w-32">
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default HR;