import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Package, Truck, ClipboardList, Plus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Logistics = () => {
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'distribution'
    
    // Switch endpoint based on tab
    const getEndpoint = () => activeTab === 'inventory' ? 'umh/v1/logistics/items' : 'umh/v1/logistics/distribution';
    const { data, loading, fetchData, deleteItem } = useCRUD(getEndpoint());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    // Refetch when tab changes
    useEffect(() => { 
        setForm({}); // Reset form
        fetchData(); 
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = getEndpoint();
            if (mode === 'create') await api.post(endpoint, form);
            else await api.put(`${endpoint}/${form.id}`, form);
            
            toast.success("Data berhasil disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan: " + e.message); }
    };

    // Columns Definition
    const getColumns = () => {
        if (activeTab === 'inventory') {
            return [
                { header: 'Kode Barang', accessor: 'item_code', render: r => <code className="bg-gray-100 px-2 py-1 rounded text-xs">{r.item_code}</code> },
                { header: 'Nama Barang', accessor: 'item_name', render: r => <span className="font-bold text-gray-800">{r.item_name}</span> },
                { header: 'Kategori', accessor: 'category' },
                { header: 'Stok', accessor: 'stock_qty', render: r => (
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.stock_qty < r.min_stock_alert ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {r.stock_qty} Pcs
                        </span>
                        {r.stock_qty < r.min_stock_alert && <AlertTriangle size={14} className="text-red-500" title="Stok Menipis!"/>}
                    </div>
                )},
                { header: 'Harga Satuan', accessor: 'unit_cost', render: r => <span className="text-xs text-gray-500">Rp {Number(r.unit_cost).toLocaleString()}</span> },
            ];
        } else {
            return [
                { header: 'Nama Jamaah', accessor: 'jamaah_name', render: r => <div className="font-bold">{r.jamaah_name}</div> },
                { header: 'Barang', accessor: 'item_name' },
                { header: 'Qty', accessor: 'qty', render: r => <span className="font-mono">{r.qty}</span> },
                { header: 'Tanggal Ambil', accessor: 'taken_date', render: r => <span className="text-xs text-gray-500">{r.taken_date || '-'}</span> },
                { header: 'Status', accessor: 'status', render: r => (
                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${r.status==='taken'?'bg-green-100 text-green-700':r.status==='shipped'?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-800'}`}>
                        {r.status}
                    </span>
                )},
            ];
        }
    };

    // Form Renderer
    const renderForm = () => {
        if (activeTab === 'inventory') {
            return (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kode Barang</label>
                            <input className="input-field" value={form.item_code || ''} onChange={e => setForm({...form, item_code: e.target.value})} placeholder="INV-001" required />
                        </div>
                        <div>
                            <label className="label">Kategori</label>
                            <select className="input-field" value={form.category || 'perlengkapan'} onChange={e => setForm({...form, category: e.target.value})}>
                                <option value="perlengkapan">Perlengkapan Umroh</option>
                                <option value="dokumen">Dokumen</option>
                                <option value="souvenir">Souvenir/Hadiah</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Nama Barang</label>
                        <input className="input-field" value={form.item_name || ''} onChange={e => setForm({...form, item_name: e.target.value})} required placeholder="Contoh: Koper Fiber 24 Inch" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label">Stok Awal</label>
                            <input type="number" className="input-field" value={form.stock_qty || 0} onChange={e => setForm({...form, stock_qty: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Min. Alert</label>
                            <input type="number" className="input-field" value={form.min_stock_alert || 10} onChange={e => setForm({...form, min_stock_alert: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Harga Beli</label>
                            <input type="number" className="input-field" value={form.unit_cost || 0} onChange={e => setForm({...form, unit_cost: e.target.value})} />
                        </div>
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <div>
                        <label className="label">Pilih Jamaah / Booking ID</label>
                        <input className="input-field" type="number" placeholder="Masukkan ID Jamaah" value={form.jamaah_id || ''} onChange={e => setForm({...form, jamaah_id: e.target.value})} required />
                    </div>
                    <div>
                        <label className="label">Barang yang Diambil</label>
                        <select className="input-field" value={form.item_id || ''} onChange={e => setForm({...form, item_id: e.target.value})} required>
                            <option value="">-- Pilih Barang --</option>
                            <option value="1">Koper Set</option>
                            <option value="2">Kain Ihram</option>
                            <option value="3">Batik Seragam</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jumlah (Qty)</label>
                            <input type="number" className="input-field" value={form.qty || 1} onChange={e => setForm({...form, qty: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Status Pengambilan</label>
                            <select className="input-field" value={form.status || 'pending'} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="pending">Disiapkan</option>
                                <option value="ready">Siap Ambil</option>
                                <option value="taken">Sudah Diambil</option>
                                <option value="shipped">Dikirim Ekspedisi</option>
                            </select>
                        </div>
                    </div>
                    {form.status === 'shipped' && (
                         <div>
                            <label className="label">Nomor Resi Pengiriman</label>
                            <input className="input-field" value={form.shipping_resi || ''} onChange={e => setForm({...form, shipping_resi: e.target.value})} />
                        </div>
                    )}
                </>
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Logistik & Perlengkapan</h1>
                        <p className="text-gray-500 text-sm">Manajemen stok koper, kain ihram, dan distribusi.</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-6 border-b border-gray-200">
                <button onClick={() => setActiveTab('inventory')} className={`pb-3 px-2 flex items-center gap-2 font-medium border-b-2 transition-colors ${activeTab==='inventory' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <ClipboardList size={18}/> Stok Barang
                </button>
                <button onClick={() => setActiveTab('distribution')} className={`pb-3 px-2 flex items-center gap-2 font-medium border-b-2 transition-colors ${activeTab==='distribution' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <Truck size={18}/> Distribusi Jamaah
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <div className="p-4 flex justify-between items-center bg-gray-50 rounded-t-xl border-b">
                    <h3 className="font-bold text-gray-700">
                        {activeTab === 'inventory' ? 'Daftar Inventaris Gudang' : 'Riwayat Pengambilan Barang'}
                    </h3>
                    <button 
                        onClick={() => { setForm({}); setMode('create'); setIsModalOpen(true); }}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <Plus size={16}/> {activeTab === 'inventory' ? 'Barang Baru' : 'Catat Pengambilan'}
                    </button>
                </div>
                <CrudTable 
                    columns={getColumns()} 
                    data={data} 
                    loading={loading}
                    onEdit={(item) => { setForm(item); setMode('edit'); setIsModalOpen(true); }}
                    onDelete={(item) => deleteItem(item.id)}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create' ? (activeTab==='inventory'?"Tambah Barang":"Catat Distribusi") : "Edit Data"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderForm()}
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Logistics;