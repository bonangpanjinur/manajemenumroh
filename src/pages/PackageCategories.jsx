import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import { Tags, Plus } from 'lucide-react';

const PackageCategories = () => {
    // PENTING: Endpoint mengarah ke package-categories
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/package-categories'); 
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => { fetchData(); }, [fetchData]);

    const columns = [
        { header: 'Nama Kategori', accessor: 'name', className: 'font-bold text-gray-800' },
        { header: 'Keterangan', accessor: 'description', className: 'text-gray-600' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ name: '', description: '' });
            setEditId(null);
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Kategori Paket">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <Tags size={20} className="text-purple-600"/> Master Kategori Paket
                    </h2>
                    <p className="text-xs text-gray-500">Kelompokkan paket umrah (Contoh: Ramadhan, VIP, Hemat).</p>
                </div>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Kategori
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={handleEdit} 
                    onDelete={(item) => deleteItem(item.id)} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Kategori" : "Tambah Kategori Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Kategori</label>
                        <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Paket Ramadhan" />
                    </div>
                    <div>
                        <label className="label">Keterangan</label>
                        <textarea className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default PackageCategories;