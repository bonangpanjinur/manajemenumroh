import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Truck, Box, Plus, Settings, AlertTriangle, List, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Logistics = () => {
    // CRUD untuk umh_inventory_items
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/inventory_items');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({ item_name: '', item_code: '', category: 'perlengkapan', unit_cost: 0, sale_price: 0, stock_qty: 0 });
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [adjustmentForm, setAdjustmentForm] = useState({ adjustment: 0, notes: '', warehouse_id: 1 });
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        // Fetch Master Warehouse
        api.get('umh/v1/warehouses').then(res => {
            setWarehouses(res.data.data || res.data);
        }).catch(console.error);
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {...form, unit_cost: parseFloat(form.unit_cost), sale_price: parseFloat(form.sale_price), stock_qty: parseInt(form.stock_qty)};
        try {
            if (mode === 'create') await createItem(payload);
            else await updateItem(form.id, payload);
            toast.success("Item tersimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan"); }
    };
    
    // Buka Modal Adjustment
    const openAdjustmentModal = (item) => {
        setSelectedItem(item);
        setAdjustmentForm({ adjustment: 0, notes: '', warehouse_id: warehouses[0]?.id || 1 });
        setIsAdjustModalOpen(true);
    };

    // Submit Stok Adjustment (Memanggil endpoint UPDATE yang di-override)
    const handleStockAdjustment = async (e) => {
        e.preventDefault();
        const adj = parseInt(adjustmentForm.adjustment);
        if (adj === 0) return toast.error("Jumlah penyesuaian harus > 0");
        
        try {
            // Disimpan sebagai 'stock_adjustment' agar API tahu ini penyesuaian stok
            await api.put(`umh/v1/inventory_items/${selectedItem.id}`, { 
                stock_adjustment: adj,
                notes: adjustmentForm.notes,
                warehouse_id: adjustmentForm.warehouse_id 
            });
            toast.success("Stok berhasil disesuaikan!");
            setIsAdjustModalOpen(false);
            fetchData();
        } catch (e) {
            toast.error("Gagal penyesuaian: " + (e.response?.data?.message || e.message));
        }
    };

    const columns = [
        { header: 'Nama Item', accessor: 'item_name', render: r => (
            <div>
                <div className="font-bold">{r.item_name}</div>
                <div className="text-xs text-gray-500">{r.item_code} ({r.category})</div>
            </div>
        )},
        { header: 'Stok Saat Ini', accessor: 'stock_qty', render: r => (
            <div className={`font-bold text-lg ${r.stock_qty < 10 ? 'text-red-500' : 'text-green-600'}`}>
                {r.stock_qty} Pcs
            </div>
        )},
        { header: 'Biaya Unit', accessor: 'unit_cost', render: r => new Intl.NumberFormat('id-ID').format(r.unit_cost) },
        { header: 'Harga Jual', accessor: 'sale_price', render: r => new Intl.NumberFormat('id-ID').format(r.sale_price) },
        { header: 'Aksi', accessor: 'id', render: r => (
            <div className="flex gap-2 justify-end">
                <button onClick={() => openAdjustmentModal(r)} className="btn-secondary px-2 py-1 text-xs flex items-center gap-1"><Box size={12}/> Stok Opname</button>
            </div>
        )}
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3"><Truck size={24}/> Logistik & Inventaris</h1>
            <p className="text-sm text-gray-500">Kelola master perlengkapan (koper, seragam) dan stok gudang.</p>

            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <button onClick={() => { setMode('create'); setForm({ item_name: '', item_code: '', category: 'perlengkapan', unit_cost: 0, sale_price: 0, stock_qty: 0 }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
                        <Plus size={16}/> Item Baru
                    </button>
                    <button onClick={() => { /* Buka Modal CRUD Warehouse */ }} className="btn-secondary flex items-center gap-2 text-sm">
                        <Settings size={16}/> Kelola Gudang ({warehouses.length})
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={(item) => { setMode('edit'); setForm(item); setIsModalOpen(true); }}
                    onDelete={deleteItem}
                />
            </div>

            {/* Modal CRUD Item */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create'?"Tambah Item":"Edit Item"} size="max-w-xl">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Nama Item</label><input className="input-field" value={form.item_name} onChange={e=>setForm({...form, item_name:e.target.value})} required/></div>
                        <div><label className="label">Kode Item</label><input className="input-field" value={form.item_code} onChange={e=>setForm({...form, item_code:e.target.value})}/></div>
                        <div><label className="label">Kategori</label><select className="input-field" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}><option value="perlengkapan">Perlengkapan</option><option value="dokumen">Dokumen</option><option value="souvenir">Souvenir</option></select></div>
                        <div><label className="label">Biaya Unit (HPP)</label><input type="number" className="input-field" value={form.unit_cost} onChange={e=>setForm({...form, unit_cost:e.target.value})}/></div>
                    </div>
                    {mode === 'create' && 
                        <div className="bg-orange-50 p-3 rounded text-sm text-orange-700">
                            Stok awal (0) akan diatur melalui menu "Stok Opname" setelah item dibuat.
                        </div>
                    }
                    <div className="flex justify-end pt-4 border-t"><button type="submit" className="btn-primary">Simpan Item</button></div>
                </form>
            </Modal>

            {/* Modal Stok Adjustment */}
            <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Penyesuaian Stok (Stok Opname)" size="max-w-md">
                <form onSubmit={handleStockAdjustment} className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded text-sm border border-blue-100">
                        <p className="font-bold text-gray-800">{selectedItem?.item_name}</p>
                        <p className="text-xs text-gray-600">Stok saat ini: <span className="font-bold text-lg text-blue-700">{selectedItem?.stock_qty} Pcs</span></p>
                    </div>
                    
                    <div>
                        <label className="label">Gudang</label>
                        <select className="input-field" value={adjustmentForm.warehouse_id} onChange={e=>setAdjustmentForm({...adjustmentForm, warehouse_id:e.target.value})} required>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="label">Jumlah Penyesuaian</label>
                        <div className="flex">
                            <select 
                                className="input-field rounded-r-none w-1/3"
                                onChange={e => setAdjustmentForm({...adjustmentForm, adjustment: Math.abs(adjustmentForm.adjustment) * (e.target.value === 'in' ? 1 : -1)})}
                                value={adjustmentForm.adjustment >= 0 ? 'in' : 'out'}
                            >
                                <option value="in">MASUK (+)</option>
                                <option value="out">KELUAR (-)</option>
                            </select>
                            <input 
                                type="number" 
                                className="input-field rounded-l-none w-2/3 text-lg font-bold" 
                                value={Math.abs(adjustmentForm.adjustment)} 
                                onChange={e=>setAdjustmentForm({...adjustmentForm, adjustment: parseInt(e.target.value) * (adjustmentForm.adjustment >= 0 ? 1 : -1)})} 
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Stok akan menjadi: {selectedItem?.stock_qty + parseInt(adjustmentForm.adjustment)}</p>
                    </div>
                    
                    <div><label className="label">Catatan</label><textarea className="input-field" rows="2" value={adjustmentForm.notes} onChange={e=>setAdjustmentForm({...adjustmentForm, notes:e.target.value})}></textarea></div>
                    
                    <div className="flex justify-end pt-4 border-t">
                        <button type="submit" className="btn-primary px-6">Proses Penyesuaian</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Logistics;