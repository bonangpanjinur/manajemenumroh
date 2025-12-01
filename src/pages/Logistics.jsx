import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import api from '../utils/api';
import { Plus, Box, PackageCheck, AlertTriangle, Users, ClipboardCheck, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatters';

const Logistics = () => {
    const [activeTab, setActiveTab] = useState('inventory'); // inventory | distribution
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Master Items (untuk checklist)
    const [masterItems, setMasterItems] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ item_name: '', stock_qty: 0, unit: 'Pcs', min_stock_alert: 10 });

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('umh/v1/logistics', { params: { type: activeTab } });
            const items = Array.isArray(res) ? res : [];
            setData(items);

            // Jika sedang di tab inventory, simpan juga sebagai masterItems untuk referensi di tab distribusi
            if (activeTab === 'inventory') {
                setMasterItems(items);
            } else if (masterItems.length === 0) {
                // Jika buka tab distribusi duluan, fetch master inventory di background
                api.get('umh/v1/logistics', { params: { type: 'inventory' } }).then(res => {
                    if (Array.isArray(res)) setMasterItems(res);
                });
            }
        } catch (error) {
            console.error("Error fetching logistics:", error);
            toast.error("Gagal memuat data logistik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    // Handle Save Inventory
    const handleSaveInventory = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/logistics', formData);
            toast.success('Data stok berhasil disimpan');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan');
        }
    };

    const handleDeleteInventory = async (item) => {
        if(window.confirm('Hapus item ini dari stok?')) {
            try {
                await api.delete(`umh/v1/logistics?id=${item.id}`);
                toast.success('Item dihapus');
                fetchData();
            } catch(e) { toast.error('Gagal hapus'); }
        }
    }

    // Handle Checklist Change (Distribution)
    const handleChecklistToggle = async (rowId, itemName, currentStatus, currentJson) => {
        const newStatus = !currentStatus;
        const newJson = { ...currentJson, [itemName]: newStatus };
        
        // Optimistic Update UI
        const updatedData = data.map(d => d.id === rowId ? { ...d, items_status: newJson } : d);
        setData(updatedData);

        try {
            await api.post(`umh/v1/logistics/checklist/${rowId}`, { 
                items_status: newJson,
                date_taken: new Date().toISOString().split('T')[0] // Update tanggal ambil
            });
            // toast.success(`Status ${itemName} diupdate`); // Optional: terlalu berisik kalau toast tiap klik
        } catch (error) {
            toast.error("Gagal update status");
            fetchData(); // Revert if fail
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { item_name: '', stock_qty: 0, unit: 'Pcs', min_stock_alert: 10 });
        setIsModalOpen(true);
    };

    // COLUMNS: INVENTORY
    const inventoryColumns = [
        { header: 'Nama Barang', accessor: 'item_name', className: 'font-bold text-gray-800' },
        { header: 'Stok', accessor: 'stock_qty', render: r => (
            <div className={`font-bold ${parseInt(r.stock_qty) < parseInt(r.min_stock_alert) ? 'text-red-600' : 'text-green-600'}`}>
                {r.stock_qty} {r.unit}
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            parseInt(r.stock_qty) < parseInt(r.min_stock_alert)
            ? <span className="flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded"><AlertTriangle size={12}/> Stok Menipis</span>
            : <span className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded"><PackageCheck size={12}/> Aman</span>
        )}
    ];

    // COLUMNS: DISTRIBUTION
    const distributionColumns = [
        { header: 'Nama Jemaah', accessor: 'full_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.full_name}</div>
                <div className="text-xs text-gray-500">{r.passport_number || '-'}</div>
            </div>
        )},
        { header: 'Paket', accessor: 'package_name', render: r => <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{r.package_name || '-'}</span> },
        { header: 'Checklist Perlengkapan', accessor: 'items_status', render: r => (
            <div className="flex flex-wrap gap-2">
                {masterItems.map(item => {
                    const isChecked = r.items_status && r.items_status[item.item_name];
                    return (
                        <button 
                            key={item.id}
                            onClick={() => handleChecklistToggle(r.id, item.item_name, isChecked, r.items_status)}
                            className={`text-[10px] px-2 py-1 rounded border transition-all flex items-center gap-1 ${
                                isChecked 
                                ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                            }`}
                            title={`Klik untuk ubah status ${item.item_name}`}
                        >
                            {isChecked ? <PackageCheck size={10}/> : <Box size={10}/>}
                            {item.item_name}
                        </button>
                    );
                })}
                {masterItems.length === 0 && <span className="text-xs text-gray-400 italic">Belum ada master barang</span>}
            </div>
        )},
        { header: 'Tgl Ambil', accessor: 'date_taken', render: r => r.date_taken ? formatDate(r.date_taken) : '-' }
    ];

    return (
        <Layout title="Logistik & Perlengkapan">
            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                <button 
                    className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    <Box size={18}/> Stok Barang (Gudang)
                </button>
                <button 
                    className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'distribution' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('distribution')}
                >
                    <ClipboardCheck size={18}/> Distribusi Jemaah
                </button>
            </div>

            {/* Header Action */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                    {activeTab === 'inventory' ? 'Kelola master data barang dan stok gudang.' : 'Checklist pengambilan perlengkapan oleh jemaah.'}
                </p>
                {activeTab === 'inventory' && (
                    <button onClick={() => openModal('create')} className="btn-primary flex items-center gap-2">
                        <Plus size={18} /> Tambah Item
                    </button>
                )}
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {activeTab === 'inventory' ? (
                    <CrudTable 
                        columns={inventoryColumns} 
                        data={data} 
                        loading={loading} 
                        onEdit={item => openModal('edit', item)} 
                        onDelete={handleDeleteInventory} 
                    />
                ) : (
                    <CrudTable 
                        columns={distributionColumns} 
                        data={data} 
                        loading={loading} 
                        // Mode distribusi tidak ada edit/delete baris, cuma toggle checklist
                    />
                )}
            </div>

            {/* Modal Inventory */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Barang Baru" : "Edit Barang"}>
                <form onSubmit={handleSaveInventory} className="space-y-4">
                    <div>
                        <label className="label">Nama Barang</label>
                        <input className="input-field" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} required placeholder="Contoh: Koper 24 Inch" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jumlah Stok</label>
                            <input type="number" className="input-field" value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: e.target.value})} />
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
                    <div>
                        <label className="label">Alert Stok Minim</label>
                        <input type="number" className="input-field bg-yellow-50" value={formData.min_stock_alert} onChange={e => setFormData({...formData, min_stock_alert: e.target.value})} />
                        <p className="text-[10px] text-gray-500 mt-1">Sistem akan memberi peringatan jika stok di bawah angka ini.</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary"><Save size={16} className="mr-2"/> Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Logistics;