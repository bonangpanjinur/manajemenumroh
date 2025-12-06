import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Package, UserCheck, Search, Plus, Box, CheckSquare, Square, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const Logistics = () => {
    const [activeTab, setActiveTab] = useState('inventory');

    // --- TAB 1: INVENTORY ---
    const { data: items, loading, fetchData, deleteItem } = useCRUD('umh/v1/inventory');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ item_name: '', stock_qty: 0, category: 'perlengkapan' });

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/inventory', form);
            toast.success("Barang ditambahkan");
            setIsModalOpen(false); fetchData();
        } catch(e) { toast.error("Gagal"); }
    };

    // --- TAB 2: DISTRIBUSI ---
    const [searchCode, setSearchCode] = useState('');
    const [searchResult, setSearchResult] = useState(null); // { booking: {}, pax: [] }
    const [selectedPax, setSelectedPax] = useState(null); // Jemaah yang sedang diproses
    const [selectedItemsToGive, setSelectedItemsToGive] = useState([]); // Item ID yang dicentang
    const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const handleSearchBooking = async (e) => {
        e.preventDefault();
        if (!searchCode) return;
        setLoadingSearch(true);
        setSearchResult(null);
        try {
            const res = await api.get(`umh/v1/logistics/search-booking?code=${searchCode}`);
            if (res.data.success) {
                setSearchResult(res.data);
            }
        } catch (e) {
            toast.error("Booking tidak ditemukan / Error");
        } finally {
            setLoadingSearch(false);
        }
    };

    const openDistributeModal = (pax) => {
        setSelectedPax(pax);
        // Reset seleksi
        setSelectedItemsToGive([]);
        setIsDistributeModalOpen(true);
    };

    const toggleItemSelection = (itemId) => {
        setSelectedItemsToGive(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const submitDistribution = async () => {
        if (selectedItemsToGive.length === 0) return toast.error("Pilih minimal 1 barang");

        try {
            await api.post('umh/v1/logistics/distribute-items', {
                booking_id: searchResult.booking.id,
                jamaah_id: selectedPax.jamaah_id,
                items: selectedItemsToGive
            });
            toast.success("Barang berhasil diserahkan!");
            setIsDistributeModalOpen(false);
            // Refresh hasil pencarian untuk update status checklist
            handleSearchBooking({ preventDefault: ()=>{} });
            fetchData(); // Refresh stok gudang juga
        } catch (e) {
            toast.error("Gagal: " + (e.response?.data?.message || "Error server"));
        }
    };

    // --- RENDER ---

    const invColumns = [
        { header: 'Nama Barang', accessor: 'item_name', render: r => <div className="font-bold text-gray-800">{r.item_name}</div> },
        { header: 'Kategori', accessor: 'category', render: r => <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs border">{r.category}</span> },
        { header: 'Stok Tersedia', accessor: 'stock_qty', render: r => <span className={`font-mono font-bold text-lg ${r.stock_qty < 10 ? 'text-red-600' : 'text-green-600'}`}>{r.stock_qty}</span> },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Logistik & Inventaris</h1>
                {activeTab === 'inventory' && (
                    <button onClick={() => { setForm({}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                        <Plus size={18}/> Item Baru
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
                <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-md text-sm font-medium flex gap-2 transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>
                    <Box size={16}/> Stok Gudang
                </button>
                <button onClick={() => setActiveTab('distribution')} className={`px-4 py-2 rounded-md text-sm font-medium flex gap-2 transition-all ${activeTab === 'distribution' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>
                    <ShoppingBag size={16}/> Distribusi ke Jemaah
                </button>
            </div>

            {/* TAB 1: INVENTORY LIST */}
            {activeTab === 'inventory' && (
                <div className="bg-white rounded-xl shadow border border-gray-200">
                    <CrudTable columns={invColumns} data={items} loading={loading} onDelete={deleteItem} />
                </div>
            )}

            {/* TAB 2: DISTRIBUTION INTERFACE */}
            {activeTab === 'distribution' && (
                <div className="space-y-6">
                    {/* Search Box */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cari Booking untuk Pengambilan Barang</label>
                        <form onSubmit={handleSearchBooking} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                                <input 
                                    className="input-field pl-10" 
                                    placeholder="Masukkan Kode Booking (Contoh: BK-2310-1001)" 
                                    value={searchCode}
                                    onChange={e=>setSearchCode(e.target.value)}
                                />
                            </div>
                            <button type="submit" disabled={loadingSearch} className="btn-primary w-32">
                                {loadingSearch ? 'Mencari...' : 'Cari'}
                            </button>
                        </form>
                    </div>

                    {/* Search Result */}
                    {searchResult && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                            <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-blue-900 text-lg">{searchResult.booking.booking_code}</h3>
                                    <p className="text-sm text-blue-700">PIC: {searchResult.booking.contact_name}</p>
                                </div>
                                <span className="px-3 py-1 bg-white text-blue-600 rounded-full text-xs font-bold uppercase border border-blue-200">
                                    {searchResult.booking.status}
                                </span>
                            </div>
                            
                            <div className="divide-y divide-gray-100">
                                {searchResult.pax.map((pax, idx) => (
                                    <div key={pax.pax_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{pax.full_name}</h4>
                                                <p className="text-xs text-gray-500">{pax.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                            </div>
                                        </div>

                                        {/* Status Logistik Summary */}
                                        <div className="flex flex-wrap gap-2">
                                            {pax.logistics_status.map(item => (
                                                <span key={item.item_id} className={`px-2 py-1 rounded text-[10px] border ${item.is_taken ? 'bg-green-50 border-green-200 text-green-700 line-through' : 'bg-red-50 border-red-200 text-red-700 font-bold'}`}>
                                                    {item.item_name}
                                                </span>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => openDistributeModal(pax)}
                                            className="btn-secondary text-xs flex items-center gap-1 whitespace-nowrap"
                                        >
                                            <UserCheck size={14}/> Kelola Barang
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL 1: TAMBAH STOK MASTER */}
            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title="Tambah Item Master">
                <form onSubmit={handleCreateItem} className="space-y-4">
                    <div><label className="label">Nama Barang</label><input className="input-field" value={form.item_name} onChange={e=>setForm({...form, item_name:e.target.value})} required/></div>
                    <div><label className="label">Kategori</label><select className="input-field" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}><option value="perlengkapan">Perlengkapan (Koper, Kain)</option><option value="dokumen">Dokumen (ID Card)</option><option value="souvenir">Souvenir</option></select></div>
                    <div><label className="label">Stok Awal</label><input type="number" className="input-field" value={form.stock_qty} onChange={e=>setForm({...form, stock_qty:e.target.value})}/></div>
                    <button className="btn-primary w-full mt-4">Simpan</button>
                </form>
            </Modal>

            {/* MODAL 2: DISTRIBUSI BARANG (CHECKLIST) */}
            <Modal isOpen={isDistributeModalOpen} onClose={()=>setIsDistributeModalOpen(false)} title={`Logistik: ${selectedPax?.full_name}`}>
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800">
                        Centang barang yang akan diserahkan <b>SAAT INI</b>. Barang yang sudah diambil tidak dapat dipilih lagi.
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                        {selectedPax?.logistics_status.map(item => (
                            <div 
                                key={item.item_id} 
                                onClick={() => !item.is_taken && item.current_stock > 0 && toggleItemSelection(item.item_id)}
                                className={`p-3 border rounded flex justify-between items-center transition-all ${
                                    item.is_taken ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 
                                    item.current_stock <= 0 ? 'bg-red-50 border-red-200 cursor-not-allowed' :
                                    selectedItemsToGive.includes(item.item_id) ? 'bg-blue-50 border-blue-500 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                            >
                                <div>
                                    <div className="font-medium text-sm">{item.item_name}</div>
                                    <div className="text-[10px] text-gray-500">Stok Gudang: {item.current_stock}</div>
                                </div>
                                
                                <div>
                                    {item.is_taken ? (
                                        <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-1 rounded">SUDAH DIAMBIL</span>
                                    ) : item.current_stock <= 0 ? (
                                        <span className="text-[10px] text-red-600 font-bold">STOK HABIS</span>
                                    ) : (
                                        selectedItemsToGive.includes(item.item_id) ? <CheckSquare className="text-blue-600"/> : <Square className="text-gray-300"/>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-2">
                        <button onClick={()=>setIsDistributeModalOpen(false)} className="btn-secondary">Batal</button>
                        <button onClick={submitDistribution} className="btn-primary">
                            Serahkan {selectedItemsToGive.length} Barang
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Logistics;