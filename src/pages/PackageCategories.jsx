import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Tag, Database } from 'lucide-react';

const PackageCategories = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/package-categories');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || {});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.slug && formData.name) {
            formData.slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Kategori', accessor: 'name', className: 'font-bold text-gray-800', sortable: true },
        { header: 'Slug', accessor: 'slug', render: r => <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border">{r.slug}</span> },
        { header: 'Deskripsi', accessor: 'description', className: 'text-gray-600' },
    ];

    return (
        <Layout title="Kategori Paket">
            <div className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl text-white flex justify-between items-center shadow-lg">
                <div>
                    <h3 className="font-bold text-xl mb-1 flex items-center gap-2"><Database /> Master Data Kategori</h3>
                    <p className="text-blue-100 text-sm opacity-90">Atur varian paket seperti: Ramadhan, Awal Tahun, Furoda, atau Umroh Plus.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 shadow-md transition-transform hover:scale-105">
                    <Plus size={18} /> Tambah Kategori
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    onEdit={(item) => handleOpenModal('edit', item)}
                    onDelete={deleteItem}
                    userCapabilities={user?.role}
                    editCapability="manage_options"
                    deleteCapability="manage_options"
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tambah Kategori Baru' : 'Edit Kategori'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Kategori</label><input type="text" className="input-field" placeholder="Contoh: Umroh Ramadhan" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                    <div><label className="label">Slug (Opsional)</label><input type="text" className="input-field bg-gray-50" placeholder="umroh-ramadhan (Auto generate jika kosong)" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} /></div>
                    <div><label className="label">Deskripsi</label><textarea className="input-field" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea></div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default PackageCategories;