import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Categories = () => {
    const columns = [
        { header: 'Nama Akun', accessor: 'name' },
        { 
            header: 'Tipe', 
            accessor: 'type',
            render: (row) => (
                <span className={`px-2 py-1 text-xs rounded ${row.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
            )
        },
        { header: 'Keterangan', accessor: 'description' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/categories');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'expense', description: '' });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ name: '', type: 'expense', description: '' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    // FIX: Kirim item.id ke deleteItem, bukan item object
    const handleDelete = (item) => {
        deleteItem(item.id);
    };

    return (
        <Layout title="Kategori Keuangan (COA)">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Daftar Akun Keuangan</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Akun Baru</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Akun" : "Tambah Akun Keuangan"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama Akun / Pos</label>
                        <input className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Biaya Sewa Kantor" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tipe Akun</label>
                        <select className="w-full border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option value="income">Pemasukan (Income)</option>
                            <option value="expense">Pengeluaran (Expense)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Keterangan</label>
                        <textarea className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="2"></textarea>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Akun</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Categories;