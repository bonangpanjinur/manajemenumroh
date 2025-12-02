import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, User, Phone, Mail, Briefcase, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const HR = () => {
    // Menggunakan hook useCRUD untuk operasi ke endpoint umh/v1/hr
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/hr');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' atau 'edit'
    const [currentItem, setCurrentItem] = useState(null);
    
    // State form inisial
    const initialForm = { 
        name: '', 
        email: '', 
        phone: '', 
        position: '', 
        salary: 0, 
        joined_date: new Date().toISOString().split('T')[0], 
        status: 'active' 
    };
    const [formData, setFormData] = useState(initialForm);

    // Ambil data saat komponen dimuat
    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    // Handler buka modal
    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || initialForm);
        setIsModalOpen(true);
    };

    // Handler simpan data
    const handleSubmit = async (e) => {
        e.preventDefault();
        let success = false;
        if (modalMode === 'create') {
            success = await createItem(formData);
        } else {
            success = await updateItem(currentItem.id, formData);
        }
        
        if (success) {
            setIsModalOpen(false);
            setFormData(initialForm);
        }
    };

    // Definisi kolom tabel
    const columns = [
        { 
            header: 'Nama Karyawan', 
            accessor: 'name', 
            className: 'font-bold text-gray-800',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div>{row.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={10} /> {row.email || '-'}
                        </div>
                    </div>
                </div>
            )
        },
        { 
            header: 'Posisi / Jabatan', 
            accessor: 'position',
            render: (row) => (
                <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Briefcase size={14} className="text-gray-400" /> {row.position}
                </div>
            )
        },
        { 
            header: 'Kontak', 
            accessor: 'phone',
            render: (row) => (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone size={14} className="text-green-500" /> {row.phone}
                </div>
            )
        },
        { 
            header: 'Gaji Pokok', 
            accessor: 'salary', 
            render: (row) => (
                <div className="font-mono text-sm text-gray-700">
                    {formatCurrency(row.salary)}
                </div>
            ) 
        },
        { 
            header: 'Bergabung', 
            accessor: 'joined_date',
            render: (row) => <span className="text-xs text-gray-500">{formatDate(row.joined_date)}</span>
        },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    row.status === 'active' ? 'bg-green-100 text-green-800' : 
                    row.status === 'resigned' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                }`}>
                    {row.status === 'active' ? 'Aktif' : (row.status === 'resigned' ? 'Resign' : 'Cuti')}
                </span>
            ) 
        }
    ];

    return (
        <Layout title="Manajemen SDM & HR" subtitle="Kelola data karyawan dan penggajian">
            <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-500">
                    Total Karyawan: <span className="font-bold text-gray-800">{data.length}</span>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Plus size={18}/> Tambah Karyawan
                </button>
            </div>

            <CrudTable 
                columns={columns} 
                data={data} 
                loading={loading} 
                onEdit={(item) => handleOpenModal('edit', item)} 
                onDelete={deleteItem} 
            />

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={modalMode === 'create' ? "Tambah Karyawan Baru" : "Edit Data Karyawan"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Baris 1: Nama & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nama Lengkap</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    className="input-field pl-10" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    placeholder="Nama Karyawan"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Alamat Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="email" 
                                    className="input-field pl-10" 
                                    value={formData.email} 
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                    placeholder="email@perusahaan.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Baris 2: Posisi & Telepon */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Posisi / Jabatan</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    className="input-field pl-10" 
                                    value={formData.position} 
                                    onChange={e => setFormData({...formData, position: e.target.value})} 
                                    placeholder="Contoh: Staff Admin"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Nomor Telepon / WA</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    className="input-field pl-10" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    placeholder="0812..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Baris 3: Gaji & Tanggal Join */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Gaji Pokok (Rp)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="number" 
                                    className="input-field pl-10" 
                                    value={formData.salary} 
                                    onChange={e => setFormData({...formData, salary: e.target.value})} 
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Tanggal Bergabung</label>
                            <input 
                                type="date" 
                                className="input-field" 
                                value={formData.joined_date} 
                                onChange={e => setFormData({...formData, joined_date: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="label">Status Kepegawaian</label>
                        <select 
                            className="input-field" 
                            value={formData.status} 
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="active">Aktif Bekerja</option>
                            <option value="inactive">Cuti / Non-Aktif</option>
                            <option value="resigned">Resign / Berhenti</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-6 border-t mt-4 gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Data</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default HR;