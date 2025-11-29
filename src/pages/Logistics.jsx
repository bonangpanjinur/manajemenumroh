import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import { useData } from '../contexts/DataContext';
import useCRUD from '../hooks/useCRUD';
import Modal from '../components/Modal';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

// --- KONFIGURASI BARANG LOGISTIK DI SINI ---
// Tambahkan atau hapus item di dalam array ini sesuai kebutuhan travel Anda
const LOGISTIC_ITEMS = [
    { key: 'koper', label: 'Koper Besar' },
    { key: 'koper_kabin', label: 'Koper Kabin' },
    { key: 'tas_paspor', label: 'Tas Paspor' },
    { key: 'kain_ihram', label: 'Kain Ihram (Pria)' },
    { key: 'mukena', label: 'Mukena (Wanita)' },
    { key: 'bahan_batik', label: 'Bahan Batik' },
    { key: 'buku_doa', label: 'Buku Doa' },
    { key: 'syal', label: 'Syal Identitas' }
];

const Logistics = () => {
    const { user } = useData();
    // Endpoint ini sudah dimodifikasi di backend agar me-return nama jamaah
    const { data, loading, updateItem } = useCRUD('umh/v1/logistics');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [handoverData, setHandoverData] = useState({});

    // Columns
    const columns = [
        { header: 'Nama Jamaah', accessor: 'jamaah_name', sortable: true, render: row => (
            <div>
                <span className="font-bold text-gray-800">{row.jamaah_name}</span>
                <div className="text-xs text-gray-500">ID: {row.registration_number || '-'}</div>
            </div>
        )},
        { header: 'Paket', accessor: 'package_name' },
        { header: 'Alamat Pengiriman', accessor: 'shipping_address', render: row => row.shipping_address || <span className="text-gray-400 italic">Sama dengan alamat KTP</span> }, 
        { header: 'Perlengkapan', accessor: 'items_status', render: (row) => {
            const items = row.items_status || {};
            const takenCount = Object.values(items).filter(Boolean).length;
            const total = LOGISTIC_ITEMS.length;
            const percentage = Math.round((takenCount / total) * 100);
            
            return (
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span>{takenCount}/{total} Item</span>
                        <span className="font-bold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            );
        }},
        { header: 'Status Pengambilan', accessor: 'handover_status', render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${row.handover_status === 'taken' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {row.handover_status === 'taken' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                {row.handover_status === 'taken' ? 'Sudah Diambil' : 'Belum Lengkap'}
            </span>
        )},
        { header: 'Diambil Oleh', accessor: 'taken_by', render: (row) => row.taken_by || '-' },
    ];

    const handleHandoverClick = (item) => {
        setCurrentItem(item);
        setHandoverData({
            handover_status: item.handover_status || 'pending',
            taken_by: item.taken_by || '',
            date_taken: item.date_taken || new Date().toISOString().split('T')[0],
            items_status: item.items_status || {}
        });
        setIsModalOpen(true);
    };

    const handleSaveHandover = async (e) => {
        e.preventDefault();
        // Cek apakah semua item sudah dicentang
        const allChecked = LOGISTIC_ITEMS.every(item => handoverData.items_status?.[item.key]);
        const finalStatus = allChecked ? 'taken' : handoverData.handover_status;

        await updateItem(currentItem.id, {
            ...handoverData,
            handover_status: finalStatus
        });
        setIsModalOpen(false);
    };

    const toggleItemCheck = (key) => {
        setHandoverData(prev => ({
            ...prev,
            items_status: { 
                ...prev.items_status, 
                [key]: !prev.items_status?.[key] 
            }
        }));
    };

    return (
        <Layout title="Logistik & Perlengkapan">
            <div className="mb-4 bg-white p-4 rounded shadow-sm border border-blue-100 flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-gray-800">Distribusi Perlengkapan</h2>
                    <p className="text-sm text-gray-500">Kelola serah terima koper, kain ihram, dan perlengkapan jamaah.</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                    <Truck size={24} />
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                renderRowActions={(row) => (
                    <button 
                        onClick={() => handleHandoverClick(row)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                    >
                        Update Serah Terima
                    </button>
                )}
                userCapabilities={user?.role}
                editCapability="manage_options"
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Serah Terima: ${currentItem?.jamaah_name || 'Jamaah'}`}>
                <form onSubmit={handleSaveHandover} className="space-y-4">
                    
                    {/* Checklist Item Dinamis dari Variabel LOGISTIC_ITEMS */}
                    <div className="bg-gray-50 p-4 rounded border">
                        <label className="block text-sm font-bold text-gray-700 mb-3 border-b pb-2">Checklist Kelengkapan</label>
                        <div className="grid grid-cols-2 gap-2">
                            {LOGISTIC_ITEMS.map((item) => (
                                <label key={item.key} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition">
                                    <input 
                                        type="checkbox" 
                                        checked={handoverData.items_status?.[item.key] || false}
                                        onChange={() => toggleItemCheck(item.key)}
                                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-700">{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status Pengambilan</label>
                            <select 
                                className="mt-1 w-full border rounded p-2"
                                value={handoverData.handover_status}
                                onChange={e => setHandoverData({...handoverData, handover_status: e.target.value})}
                            >
                                <option value="pending">Belum Lengkap</option>
                                <option value="taken">Sudah Diambil Lengkap</option>
                                <option value="shipped">Dikirim Ekspedisi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                            <input 
                                type="date" 
                                className="mt-1 w-full border rounded p-2"
                                value={handoverData.date_taken}
                                onChange={e => setHandoverData({...handoverData, date_taken: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Diambil Oleh / Penerima</label>
                        <input 
                            type="text" 
                            className="mt-1 w-full border rounded p-2"
                            placeholder="Nama penerima atau agen..."
                            value={handoverData.taken_by}
                            onChange={e => setHandoverData({...handoverData, taken_by: e.target.value})}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Simpan Status</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Logistics;