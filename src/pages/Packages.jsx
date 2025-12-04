import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Packages = () => {
    const { 
        data: packages, 
        loading, 
        createItem, 
        updateItem, 
        deleteItem, 
        refreshData 
    } = useCRUD('packages');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isManifestOpen, setIsManifestOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [manifestData, setManifestData] = useState([]);
    const [selectedPackageForManifest, setSelectedPackageForManifest] = useState(null);

    // Form State sesuai Schema Database Enterprise
    const [formData, setFormData] = useState({
        name: '',
        category: 'Umrah Reguler', // Akan diproses API jadi category_id
        departure_date: '',
        duration_days: 9,
        hotel_makkah: '', // Akan diproses API jadi hotel_makkah_id
        hotel_madinah: '', // Akan diproses API jadi hotel_madinah_id
        airline: '', // Akan diproses API jadi airline_id
        base_price_quad: 0,
        base_price_triple: 0,
        base_price_double: 0,
        status: 'active'
    });

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Umrah Reguler',
            departure_date: '',
            duration_days: 9,
            hotel_makkah: '',
            hotel_madinah: '',
            airline: '',
            base_price_quad: 0,
            base_price_triple: 0,
            base_price_double: 0,
            status: 'active'
        });
        setEditingItem(null);
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                ...item,
                // Pastikan nilai default agar tidak null
                base_price_quad: item.base_price_quad || 0,
                base_price_triple: item.base_price_triple || 0,
                base_price_double: item.base_price_double || 0,
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let success;
        if (editingItem) {
            success = await updateItem(editingItem.id, formData);
        } else {
            success = await createItem(formData);
        }
        
        if (success) {
            setIsModalOpen(false);
            refreshData(); // Auto reload
        }
    };

    const viewManifest = async (pkg) => {
        setSelectedPackageForManifest(pkg);
        setIsManifestOpen(true);
        setManifestData([]); 
        try {
            const response = await api.get(`/packages/${pkg.id}/manifest`);
            setManifestData(response);
        } catch (error) {
            console.error("Gagal memuat manifest", error);
        }
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name' },
        { header: 'Kategori', accessor: 'category', render: (row) => (
            <span className={`px-2 py-1 rounded text-xs ${row.type === 'haji' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                {row.category || '-'}
            </span>
        )},
        { header: 'Durasi', accessor: 'duration_days', render: (row) => `${row.duration_days} Hari` },
        { header: 'Harga (Quad)', accessor: 'base_price_quad', render: (row) => formatCurrency(row.base_price_quad) },
        { header: 'Status', accessor: 'status' },
    ];

    const actions = (row) => (
        <div className="flex space-x-2">
            <button 
                onClick={() => viewManifest(row)}
                className="text-green-600 hover:text-green-900 text-sm font-medium"
                title="Lihat Jemaah (Manifest)"
            >
                Manifest
            </button>
            <button onClick={() => handleOpenModal(row)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
            <button onClick={async () => {
                if(window.confirm('Hapus paket ini?')) {
                    await deleteItem(row.id);
                    refreshData();
                }
            }} className="text-red-600 hover:text-red-900">Hapus</button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Paket (Enterprise)</h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Buat Paket Baru
                </button>
            </div>

            <CrudTable 
                columns={columns} 
                data={packages} 
                loading={loading}
                actions={actions}
            />

            {/* Modal Form Paket */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Paket" : "Buat Paket Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                            <input type="text" required className="mt-1 block w-full border rounded-md p-2" 
                                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kategori</label>
                            <input type="text" list="categories" placeholder="Ketik atau pilih..." className="mt-1 block w-full border rounded-md p-2"
                                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                            <datalist id="categories">
                                <option value="Umrah Reguler"/>
                                <option value="Umrah Plus"/>
                                <option value="Haji Khusus"/>
                                <option value="Wisata Halal"/>
                            </datalist>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         {/* Di Skema Enterprise, Tanggal ada di tabel departures, tapi kita simpan sebagai default di paket dulu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Durasi (Hari)</label>
                            <input type="number" required className="mt-1 block w-full border rounded-md p-2" 
                                value={formData.duration_days} onChange={(e) => setFormData({...formData, duration_days: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Maskapai</label>
                             <input type="text" className="mt-1 block w-full border rounded-md p-2" 
                                value={formData.airline} onChange={(e) => setFormData({...formData, airline: e.target.value})} />
                        </div>
                    </div>

                    {/* Hotel */}
                    <div className="border-t pt-4">
                        <h3 className="font-medium text-gray-900 mb-2">Akomodasi (Master Data)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hotel Makkah</label>
                                <input type="text" className="mt-1 block w-full border rounded-md p-2" 
                                    value={formData.hotel_makkah} onChange={(e) => setFormData({...formData, hotel_makkah: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hotel Madinah</label>
                                <input type="text" className="mt-1 block w-full border rounded-md p-2" 
                                    value={formData.hotel_madinah} onChange={(e) => setFormData({...formData, hotel_madinah: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* Pricing Fixed Columns (Quad/Triple/Double) */}
                    <div className="border-t pt-4 bg-gray-50 p-4 rounded">
                        <h3 className="font-medium text-gray-900 mb-2">Harga Paket (Base Price)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Harga Quad (Sekamar 4)</label>
                                <input type="number" className="mt-1 block w-full border rounded-md p-2" 
                                    value={formData.base_price_quad} onChange={(e) => setFormData({...formData, base_price_quad: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Harga Triple (Sekamar 3)</label>
                                <input type="number" className="mt-1 block w-full border rounded-md p-2" 
                                    value={formData.base_price_triple} onChange={(e) => setFormData({...formData, base_price_triple: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Harga Double (Sekamar 2)</label>
                                <input type="number" className="mt-1 block w-full border rounded-md p-2" 
                                    value={formData.base_price_double} onChange={(e) => setFormData({...formData, base_price_double: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan Paket</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Manifest */}
            <Modal isOpen={isManifestOpen} onClose={() => setIsManifestOpen(false)} title={`Manifest: ${selectedPackageForManifest?.name || ''}`}>
                <div className="overflow-y-auto max-h-96">
                    {manifestData.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Belum ada jemaah terdaftar di paket ini.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kode Booking</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Jemaah</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipe Kamar</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {manifestData.map((m, idx) => (
                                    <tr key={idx}>
                                        <td className="px-3 py-2 text-sm">{m.booking_code}</td>
                                        <td className="px-3 py-2 text-sm">
                                            <div className="font-medium text-gray-900">{m.jamaah_name}</div>
                                            <div className="text-gray-500 text-xs">{m.nik}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm">{m.room_type}</td>
                                        <td className="px-3 py-2 text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${m.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {m.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={() => setIsManifestOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Tutup</button>
                </div>
            </Modal>
        </div>
    );
};

export default Packages;