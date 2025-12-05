import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Agents = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/agents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', type: 'master' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await api.post('umh/v1/agents', form);
                toast.success("Agen berhasil ditambahkan");
            } else {
                await api.put(`umh/v1/agents/${form.id}`, form);
                toast.success("Agen berhasil diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal menyimpan data");
        }
    };

    const handleEdit = (item) => {
        setForm(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Yakin hapus agen ini?")) {
            await deleteItem(id);
        }
    };

    const columns = [
        { header: 'Nama Agen', accessor: 'name', render: (row) => (
            <div>
                <div className="font-bold text-gray-900">{row.name}</div>
                <div className="text-xs text-gray-500">{row.agency_name}</div>
            </div>
        )},
        { header: 'Kontak', accessor: 'contact', render: (row) => (
            <div className="text-sm">
                <div>{row.phone}</div>
                <div className="text-gray-500">{row.email}</div>
            </div>
        )},
        { header: 'Kota', accessor: 'city' },
        { header: 'Tipe', accessor: 'type', render: (row) => (
            <span className={`px-2 py-1 rounded text-xs font-bold ${
                row.type === 'master' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
                {row.type ? row.type.toUpperCase() : '-'}
            </span>
        )},
        { header: 'Status', accessor: 'status', render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs ${
                row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
                {row.status}
            </span>
        )},
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Agen</h1>
                    <p className="text-gray-500 text-sm">Kelola data agen, kemitraan, dan komisi.</p>
                </div>
                <button 
                    onClick={() => {
                        setForm({ name: '', email: '', phone: '', city: '', type: 'master' });
                        setModalMode('create');
                        setIsModalOpen(true);
                    }} 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Tambah Agen Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={handleEdit}
                    onDelete={(item) => handleDelete(item.id)}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Agen" : "Edit Agen"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Lengkap</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Email</label>
                            <input 
                                type="email" 
                                className="input-field" 
                                value={form.email} 
                                onChange={e => setForm({...form, email: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="label">No. Telepon (WA)</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                value={form.phone} 
                                onChange={e => setForm({...form, phone: e.target.value})} 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kota Domisili</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                value={form.city} 
                                onChange={e => setForm({...form, city: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="label">Tipe Kemitraan</label>
                            <select 
                                className="input-field" 
                                value={form.type} 
                                onChange={e => setForm({...form, type: e.target.value})}
                            >
                                <option value="master">Master Agen</option>
                                <option value="agent">Agen Biasa</option>
                                <option value="freelance">Freelance</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Agents;