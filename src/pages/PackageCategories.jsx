import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Tag, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const PackageCategories = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/package-categories');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({ name: '', type: 'umrah', description: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post('umh/v1/package-categories', form);
                toast.success("Kategori dibuat");
            } else {
                const id = form.uuid || form.id;
                await api.put(`umh/v1/package-categories/${id}`, form);
                toast.success("Kategori diupdate");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };

    const columns = [
        { header: 'Nama Kategori', accessor: 'name', render: r => <span className="font-bold">{r.name}</span> },
        { header: 'Tipe', accessor: 'type', render: r => <span className="uppercase text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{r.type}</span> },
        { header: 'Deskripsi', accessor: 'description', render: r => <span className="text-sm text-gray-500">{r.description}</span> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Kategori Paket</h1>
                <button onClick={() => { setMode('create'); setForm({ type: 'umrah' }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Kategori
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Buat Kategori" : "Edit Kategori"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Kategori</label><input className="input-field" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Promo Ramadhan" /></div>
                    <div><label className="label">Tipe Layanan</label>
                        <select className="input-field" value={form.type || 'umrah'} onChange={e => setForm({...form, type: e.target.value})}>
                            <option value="umrah">Umroh</option>
                            <option value="haji">Haji</option>
                            <option value="tour">Wisata Halal</option>
                        </select>
                    </div>
                    <div><label className="label">Keterangan</label><textarea className="input-field" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})}></textarea></div>
                    <button type="submit" className="btn-primary w-full mt-4">Simpan</button>
                </form>
            </Modal>
        </div>
    );
};

export default PackageCategories;