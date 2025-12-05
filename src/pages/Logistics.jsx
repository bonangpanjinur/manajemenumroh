import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Package, UserCheck, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Logistics = () => {
    // Tab 1: Inventory Barang
    const { data: items, loading, fetchData, deleteItem } = useCRUD('umh/v1/inventory');
    
    // Tab 2: Riwayat Distribusi
    const [history, setHistory] = useState([]);
    
    const [activeTab, setActiveTab] = useState('inventory');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
    const [form, setForm] = useState({ item_name: '', stock_qty: 0, category: 'perlengkapan' });
    const [distForm, setDistForm] = useState({ booking_id: '', jamaah_id: '', item_id: '', qty: 1 });

    // Load History saat tab pindah
    useEffect(() => {
        if(activeTab === 'distribution') {
            api.get('umh/v1/logistics/distribution-history').then(res => {
                if(res.data.success) setHistory(res.data.data);
            });
        }
    }, [activeTab]);

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/inventory', form);
            toast.success("Barang ditambahkan");
            setIsModalOpen(false);
            fetchData();
        } catch(e) { toast.error("Gagal"); }
    };

    const handleDistribute = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/logistics/distribute', distForm);
            toast.success("Barang berhasil didistribusikan");
            setIsDistributeModalOpen(false);
            // Refresh stok dan history
            fetchData(); 
            if(activeTab === 'distribution') {
                const res = await api.get('umh/v1/logistics/distribution-history');
                setHistory(res.data.data);
            }
        } catch(e) { toast.error("Gagal: " + e.response?.data?.message); }
    };

    const invColumns = [
        { header: 'Nama Barang', accessor: 'item_name', render: r => <span className="font-bold">{r.item_name}</span> },
        { header: 'Kategori', accessor: 'category', render: r => <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs">{r.category}</span> },
        { header: 'Stok', accessor: 'stock_qty', render: r => <span className={`font-mono font-bold ${r.stock_qty < 10 ? 'text-red-600' : 'text-green-600'}`}>{r.stock_qty}</span> },
    ];

    const histColumns = [
        { header: 'Tanggal', accessor: 'taken_date', render: r => <span className="text-xs">{new Date(r.taken_date).toLocaleDateString()}</span> },
        { header: 'Barang', accessor: 'item_name', render: r => <span className="font-bold text-gray-800">{r.item_name} (x{r.qty})</span> },
        { header: 'Penerima', accessor: 'jamaah_name', render: r => <span className="text-sm text-blue-600">{r.jamaah_name}</span> },
        { header: 'Status', accessor: 'status', render: r => <span className="text-[10px] uppercase bg-green-100 text-green-700 px-2 py-1 rounded">{r.status}</span> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Logistik & Perlengkapan</h1>
                <div className="flex gap-2">
                    <button onClick={() => setIsDistributeModalOpen(true)} className="btn-secondary flex items-center gap-2"><UserCheck size={18}/> Bagikan Barang</button>
                    <button onClick={() => { setForm({}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus size={18}/> Tambah Stok</button>
                </div>
            </div>

            <div className="flex border-b bg-white rounded-t-xl px-4 pt-2 shadow-sm">
                <button onClick={() => setActiveTab('inventory')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Stok Gudang</button>
                <button onClick={() => setActiveTab('distribution')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'distribution' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Riwayat Distribusi</button>
            </div>

            <div className="bg-white rounded-b-xl shadow border border-gray-200 border-t-0">
                <CrudTable 
                    columns={activeTab === 'inventory' ? invColumns : histColumns} 
                    data={activeTab === 'inventory' ? items : history} 
                    loading={loading} 
                    onDelete={activeTab === 'inventory' ? deleteItem : null} 
                />
            </div>

            {/* Modal Tambah Barang */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Item Baru">
                <form onSubmit={handleCreateItem} className="space-y-4">
                    <div><label className="label">Nama Barang</label><input className="input-field" value={form.item_name || ''} onChange={e => setForm({...form, item_name: e.target.value})} required /></div>
                    <div><label className="label">Stok Awal</label><input type="number" className="input-field" value={form.stock_qty || 0} onChange={e => setForm({...form, stock_qty: e.target.value})} /></div>
                    <button type="submit" className="btn-primary w-full mt-4">Simpan</button>
                </form>
            </Modal>

            {/* Modal Distribusi (Sederhana - Nanti bisa pakai Search Select) */}
            <Modal isOpen={isDistributeModalOpen} onClose={() => setIsDistributeModalOpen(false)} title="Distribusikan Barang">
                <form onSubmit={handleDistribute} className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mb-2">Pastikan ID Booking & ID Jemaah valid (Lihat di menu Booking).</div>
                    <div><label className="label">ID Item (Barang)</label><input type="number" className="input-field" value={distForm.item_id} onChange={e => setDistForm({...distForm, item_id: e.target.value})} required placeholder="ID dari tabel Stok" /></div>
                    <div><label className="label">ID Jemaah</label><input type="number" className="input-field" value={distForm.jamaah_id} onChange={e => setDistForm({...distForm, jamaah_id: e.target.value})} required /></div>
                    <div><label className="label">ID Booking</label><input type="number" className="input-field" value={distForm.booking_id} onChange={e => setDistForm({...distForm, booking_id: e.target.value})} required /></div>
                    <div><label className="label">Jumlah</label><input type="number" className="input-field" value={distForm.qty} onChange={e => setDistForm({...distForm, qty: e.target.value})} /></div>
                    <button type="submit" className="btn-primary w-full mt-4">Serahkan Barang</button>
                </form>
            </Modal>
        </div>
    );
};

export default Logistics;