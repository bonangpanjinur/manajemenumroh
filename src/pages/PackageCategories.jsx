import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Layers } from 'lucide-react'; // Hapus Tag karena tidak dipakai
import toast from 'react-hot-toast';

const PackageCategories = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/package-categories');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [form, setForm] = useState({ name: '', type: 'umroh', description: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await api.post('umh/v1/package-categories', form);
                toast.success("Kategori ditambahkan");
            } else {
                await api.put(`umh/v1/package-categories/${form.id}`, form);
                toast.success("Kategori diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch(e) { 
            toast.error("Gagal simpan: " + e.message); 
        }
    };

    const handleEdit = (item) => {
        setForm(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Yakin hapus kategori ini? Paket terkait mungkin kehilangan kategori.")) {
            const success = await deleteItem(id);
            if (success) toast.success("Kategori dihapus");
            else toast.error("Gagal hapus. Mungkin masih ada paket di kategori ini.");
        }
    };

    const columns = [
        { header: 'Nama Kategori', accessor: 'name', render: r => <div className="font-bold text-gray-800">{r.name}</div> },
        { header: 'Slug', accessor: 'slug', render: r => <span className="font-mono text-xs text-gray-500">{r.slug}</span> },
        { header: 'Tipe', accessor: 'type', render: r => (
            <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                r.type === 'umroh' ? 'bg-green-100 text-green-700' : 
                r.type === 'haji' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>{r.type}</span> 
        )},
        { header: 'Jumlah Paket', accessor: 'package_count', render: r => <span className="bg-gray-100 px-2 py-1 rounded text-xs">{r.package_count || 0} Paket</span> },
    ];

    return (
        <Layout title="Kategori Paket">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2"><Layers size={20}/> Daftar Kategori</h2>
                <button onClick={() => { setModalMode('create'); setForm({ name: '', type: 'umroh', description: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Kategori
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={handleEdit}
                    onDelete={(item) => handleDelete(item.id)}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode==='create'?"Tambah Kategori":"Edit Kategori"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Kategori</label>
                        <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Umroh Hemat, Haji Plus" required />
                    </div>
                    <div>
                        <label className="label">Tipe Layanan</label>
                        <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                            <option value="umroh">Umroh</option>
                            <option value="haji">Haji</option>
                            <option value="tour">Wisata Halal</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Deskripsi Singkat</label>
                        <textarea className="input-field h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                    </div>
                    <div className="flex justify-end pt-4 border-t mt-4 gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default PackageCategories;