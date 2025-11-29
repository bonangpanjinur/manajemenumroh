import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Box, Archive } from 'lucide-react';

const Logistics = () => {
    // Endpoint logistics untuk barang inventaris
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/logistics');
    
    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ item_name: '', stock_qty: 0, min_stock_alert: 10, unit: 'Pcs' });

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { item_name: '', stock_qty: 0, min_stock_alert: 10, unit: 'Pcs' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Barang', accessor: 'item_name', render: r => (
            <div className="flex items-center gap-2 font-medium">
                <Box size={16} className="text-gray-400"/> {r.item_name}
            </div>
        )},
        { header: 'Stok Saat Ini', accessor: 'stock_qty', render: r => (
            <span className={`font-bold ${Number(r.stock_qty) <= Number(r.min_stock_alert) ? 'text-red-600' : 'text-green-600'}`}>
                {r.stock_qty} {r.unit}
            </span>
        )},
        { header: 'Status Stok', accessor: 'status', render: r => (
            Number(r.stock_qty) <= Number(r.min_stock_alert) 
            ? <span className="badge bg-red-100 text-red-700 text-xs">Stok Menipis</span>
            : <span className="badge bg-green-100 text-green-700 text-xs">Aman</span>
        )}
    ];

    return (
        <Layout title="Manajemen Logistik & Perlengkapan">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Kelola stok koper, kain ihram, bahan batik, dan perlengkapan lainnya.</p>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Barang
                </button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Inventaris" : "Update Stok"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Barang</label>
                        <input className="input-field" value={formData.item_name} onChange={e=>setFormData({...formData, item_name: e.target.value})} placeholder="Koper 24 Inch, Kain Batik, dll" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jumlah Stok</label>
                            <input type="number" className="input-field" value={formData.stock_qty} onChange={e=>setFormData({...formData, stock_qty: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Satuan</label>
                            <select className="input-field" value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})}>
                                <option value="Pcs">Pcs</option>
                                <option value="Box">Box</option>
                                <option value="Lusin">Lusin</option>
                                <option value="Meter">Meter</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Peringatan Stok Minimum</label>
                        <input type="number" className="input-field" value={formData.min_stock_alert} onChange={e=>setFormData({...formData, min_stock_alert: e.target.value})} />
                        <p className="text-xs text-gray-400 mt-1">Sistem akan memberi peringatan di dashboard jika stok di bawah angka ini.</p>
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