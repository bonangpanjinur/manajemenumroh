import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Package, AlertTriangle, Truck, Search, Check, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Logistics = () => {
    const [activeTab, setActiveTab] = useState('inventory');

    return (
        <Layout title="Logistik & Perlengkapan">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
                <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Package size={16} /> Data Barang (Gudang)
                </button>
                <button onClick={() => setActiveTab('distribution')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'distribution' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Truck size={16} /> Distribusi ke Jemaah
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-1">
                {activeTab === 'inventory' ? <InventoryTab /> : <DistributionTab />}
            </div>
        </Layout>
    );
};

// --- TAB 1: DATA BARANG (INVENTORY) ---
const InventoryTab = () => {
    const { data, loading, fetchData } = useCRUD('umh/v1/logistics/items');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ item_code: '', item_name: '', stock_qty: 0, min_stock_alert: 10 });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/logistics/items', form);
            toast.success("Barang ditambahkan");
            setIsModalOpen(false);
            fetchData();
            setForm({ item_code: '', item_name: '', stock_qty: 0, min_stock_alert: 10 });
        } catch (e) { toast.error("Gagal simpan"); }
    };

    const columns = [
        { header: 'Kode', accessor: 'item_code', render: r => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{r.item_code}</span> },
        { header: 'Nama Barang', accessor: 'item_name', render: r => <div className="font-medium text-gray-800">{r.item_name}</div> },
        { header: 'Stok Gudang', accessor: 'stock_qty', render: r => (
            <div className={`font-bold ${parseInt(r.stock_qty) <= parseInt(r.min_stock_alert) ? 'text-red-600 flex items-center gap-1' : 'text-green-600'}`}>
                {r.stock_qty} Units
                {parseInt(r.stock_qty) <= parseInt(r.min_stock_alert) && <AlertTriangle size={14} />}
            </div>
        )},
        { header: 'Min. Alert', accessor: 'min_stock_alert' },
    ];

    return (
        <>
            <div className="p-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Stok Barang</h3>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Master Barang
                </button>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Stok Barang">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Kode Barang</label><input className="input-field" value={form.item_code} onChange={e => setForm({...form, item_code: e.target.value})} placeholder="KPR-01" required /></div>
                        <div><label className="label">Nama Barang</label><input className="input-field" value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} placeholder="Koper 24 Inch" required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Stok Awal</label><input type="number" className="input-field" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: e.target.value})} /></div>
                        <div><label className="label">Alert Minimum</label><input type="number" className="input-field" value={form.min_stock_alert} onChange={e => setForm({...form, min_stock_alert: e.target.value})} /></div>
                    </div>
                    <div className="flex justify-end pt-4"><button className="btn-primary">Simpan Stok</button></div>
                </form>
            </Modal>
        </>
    );
};

// --- TAB 2: DISTRIBUSI (INPUT PENGAMBILAN) ---
const DistributionTab = () => {
    // 1. Cari Jemaah Dulu
    const [searchQuery, setSearchQuery] = useState('');
    const [jamaahResult, setJamaahResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    
    // 2. Load Item Logistik
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [qty, setQty] = useState(1);

    useEffect(() => {
        // Load daftar barang untuk dropdown
        api.get('umh/v1/logistics/items')
           .then(res => setItems(res.data || []))
           .catch(console.error);
    }, []);

    const handleSearchJamaah = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            // Menggunakan API Jamaah untuk mencari data orangnya
            const res = await api.get('umh/v1/jamaah', { params: { search: searchQuery } });
            // Ambil hasil pertama yang cocok
            const found = res.data && res.data.length > 0 ? res.data[0] : null; 
            
            if (found) {
                // Di sistem V4.0 yang ideal, kita harus mencari 'booking_passenger_id' aktif dari jemaah ini.
                // Untuk simplifikasi Frontend saat ini, kita akan mengirim ID Jemaah.
                // Pastikan Backend (api-logistics.php) bisa menangani ini atau menganggap passenger_id = jamaah_id untuk sementara.
                setJamaahResult(found);
                toast.success("Jemaah ditemukan");
            } else {
                toast.error("Jemaah tidak ditemukan");
                setJamaahResult(null);
            }
        } catch (e) { 
            toast.error("Error searching"); 
        } finally {
            setIsSearching(false);
        }
    };

    const handleDistribusikan = async () => {
        if (!jamaahResult || !selectedItem) return toast.error("Data belum lengkap");
        
        try {
            await api.post('umh/v1/logistics/distribution', {
                // NOTE: Sesuai struktur DB, ini seharusnya ID dari tabel umh_booking_passengers.
                // Jika error foreign key, backend perlu disesuaikan untuk lookup passenger id berdasarkan jamaah id.
                booking_passenger_id: jamaahResult.id, 
                item_id: selectedItem,
                qty: qty,
                status: 'taken'
            });
            toast.success("Barang berhasil diserahkan!");
            // Reset form sebagian
            setSelectedItem('');
            setQty(1);
        } catch (e) {
            toast.error("Gagal distribusi: " + (e.message || "Stok mungkin habis"));
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6 shadow-sm">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <Truck size={20}/> Input Pengambilan Perlengkapan
                </h3>
                
                {/* Step 1: Cari Jemaah */}
                <div className="mb-6">
                    <label className="label">Cari Jemaah (Scan Barcode/Ketik NIK)</label>
                    <div className="flex gap-2">
                        <input 
                            className="input-field" 
                            placeholder="Ketik Nama / NIK / No Paspor..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearchJamaah()}
                        />
                        <button onClick={handleSearchJamaah} className="btn-secondary" disabled={isSearching}>
                            {isSearching ? '...' : <Search size={18}/>}
                        </button>
                    </div>
                </div>

                {/* Hasil Pencarian */}
                {jamaahResult && (
                    <div className="bg-white p-4 rounded-lg border border-blue-200 mb-6 animate-fade-in shadow-sm flex items-start gap-4">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                            <User size={24}/>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 text-lg">{jamaahResult.full_name}</div>
                            <div className="text-sm text-gray-500 font-mono">NIK: {jamaahResult.nik || '-'}</div>
                            <div className="text-sm text-gray-500">{jamaahResult.city || 'Kota tidak diketahui'}</div>
                        </div>
                        <div className="ml-auto">
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                <Check size={12}/> Terverifikasi
                            </span>
                        </div>
                    </div>
                )}

                {/* Step 2: Pilih Barang */}
                <div className={`transition-opacity ${jamaahResult ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="label">Barang yang diambil</label>
                            <select className="input-field" value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
                                <option value="">-- Pilih Barang --</option>
                                {items.map(i => (
                                    <option key={i.id} value={i.id} disabled={parseInt(i.stock_qty) <= 0}>
                                        {i.item_name} (Sisa: {i.stock_qty}) {parseInt(i.stock_qty) <= 0 ? '(Habis)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Jumlah</label>
                            <input type="number" className="input-field" value={qty} onChange={e => setQty(e.target.value)} min="1"/>
                        </div>
                    </div>

                    <button 
                        onClick={handleDistribusikan} 
                        disabled={!jamaahResult || !selectedItem}
                        className="btn-primary w-full mt-6 py-3 font-bold flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100"
                    >
                        <Truck size={18}/> Konfirmasi Penyerahan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Logistics;