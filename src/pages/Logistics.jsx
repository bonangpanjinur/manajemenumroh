import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Box, PackageCheck, AlertTriangle } from 'lucide-react';

const Logistics = () => {
    // Menggunakan endpoint 'inventory' atau sejenisnya
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/logistics'); // Pastikan endpoint ini ada/dibuat di backend
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);

    const initialForm = { item_name: '', stock: 0, unit: 'Pcs', status: 'available' };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Barang', accessor: 'item_name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.item_name}</div>
                <div className="text-xs text-gray-500">Satuan: {r.unit}</div>
            </div>
        )},
        { header: 'Stok Tersedia', accessor: 'stock', render: r => (
            <div className={`font-bold ${parseInt(r.stock) < 10 ? 'text-red-600' : 'text-green-600'}`}>
                {r.stock} {r.unit}
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            parseInt(r.stock) < 5 
            ? <span className="flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded"><AlertTriangle size={12}/> Stok Menipis</span>
            : <span className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded"><PackageCheck size={12}/> Aman</span>
        )}
    ];

    return (
        <Layout title="Logistik & Perlengkapan">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="font-bold text-gray-800">Inventaris Perlengkapan</h2>
                    <p className="text-xs text-gray-500">Kelola stok koper, kain ihram, dan seragam.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah Barang
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Barang" : "Edit Barang"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Barang</label>
                        <input className="input-field" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} required placeholder="Contoh: Koper 24 Inch" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jumlah Stok</label>
                            <input type="number" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Satuan</label>
                            <select className="input-field" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                                <option value="Pcs">Pcs</option>
                                <option value="Set">Set</option>
                                <option value="Box">Box</option>
                                <option value="Lusin">Lusin</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Logistics;