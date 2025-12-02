import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Package, Plus, Calendar, DollarSign, Hotel, Plane, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
    // API Utama: umh/v1/packages
    const { data: packages, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
    
    // API Pendukung (Dropdown)
    const { data: categories } = useCRUD('umh/v1/package-categories'); 
    const { data: airlines } = useCRUD('umh/v1/flights');             
    const { data: hotels } = useCRUD('umh/v1/hotels');                

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentId, setCurrentId] = useState(null);

    const initialForm = {
        name: '',
        category_id: '',
        airline_id: '',
        hotel_makkah_id: '',
        hotel_madinah_id: '',
        duration_days: '9',
        base_price: '',
        description: '',
        included_features: '',
        excluded_features: '' 
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        if (item) {
            setCurrentId(item.id);
            setFormData(item);
        } else {
            setFormData(initialForm);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentId, formData);
        
        if (success) setIsModalOpen(false);
    };

    // Helper untuk menampilkan nama dari ID
    const getAirlineName = (id) => airlines?.find(a => String(a.id) === String(id))?.name || '-';
    const getCategoryName = (id) => categories?.find(c => String(c.id) === String(id))?.name || '-';
    const getHotelName = (id) => hotels?.find(h => String(h.id) === String(id))?.name || '-';

    // Kolom Tabel Paket
    const columns = [
        { header: 'Nama Paket', accessor: 'name', className: 'font-bold text-gray-900' },
        { header: 'Kategori', accessor: 'category_id', render: (row) => <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{getCategoryName(row.category_id)}</span> },
        { header: 'Maskapai', accessor: 'airline_id', render: (row) => <div className="flex items-center gap-1 text-sm"><Plane size={14}/> {getAirlineName(row.airline_id)}</div> },
        { header: 'Durasi', accessor: 'duration_days', render: (row) => `${row.duration_days} Hari` },
        { header: 'Harga Mulai', accessor: 'base_price', render: (row) => <span className="font-bold text-green-700">{formatCurrency(row.base_price)}</span> },
    ];

    // Filter Hotel untuk Dropdown
    const makkahHotels = hotels ? hotels.filter(h => h.city === 'Makkah') : [];
    const madinahHotels = hotels ? hotels.filter(h => h.city === 'Madinah') : [];

    return (
        <Layout title="Katalog Paket Umrah">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <Package size={20} className="text-blue-600"/> Daftar Paket
                    </h2>
                    <p className="text-xs text-gray-500">Master data produk paket perjalanan.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Buat Paket Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={packages} 
                    loading={loading} 
                    onEdit={(item) => handleOpenModal('edit', item)} 
                    onDelete={(item) => deleteItem(item.id)} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Buat Paket Baru" : "Edit Paket"} size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* INFO DASAR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Nama Paket</label>
                            <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Umrah Akbar Ramadhan 2025" />
                        </div>
                        
                        <div>
                            <label className="label">Kategori Paket</label>
                            <select className="input-field" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                                <option value="">-- Pilih Kategori --</option>
                                {categories && categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Durasi (Hari)</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                                <input type="number" className="input-field pl-10" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} required />
                            </div>
                        </div>
                    </div>

                    {/* AKOMODASI */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-3 text-sm border-b pb-2">Akomodasi & Transportasi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="label flex items-center gap-1"><Plane size={14}/> Maskapai</label>
                                <select className="input-field" value={formData.airline_id} onChange={e => setFormData({...formData, airline_id: e.target.value})}>
                                    <option value="">-- Pilih Maskapai --</option>
                                    {airlines && airlines.map(air => (
                                        <option key={air.id} value={air.id}>{air.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label flex items-center gap-1"><Hotel size={14}/> Hotel Makkah</label>
                                <select className="input-field" value={formData.hotel_makkah_id} onChange={e => setFormData({...formData, hotel_makkah_id: e.target.value})}>
                                    <option value="">-- Pilih Hotel --</option>
                                    {makkahHotels.map(h => (
                                        <option key={h.id} value={h.id}>{h.name} ({h.rating}*)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label flex items-center gap-1"><Hotel size={14}/> Hotel Madinah</label>
                                <select className="input-field" value={formData.hotel_madinah_id} onChange={e => setFormData({...formData, hotel_madinah_id: e.target.value})}>
                                    <option value="">-- Pilih Hotel --</option>
                                    {madinahHotels.map(h => (
                                        <option key={h.id} value={h.id}>{h.name} ({h.rating}*)</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* FASILITAS & HARGA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label flex items-center gap-1 text-green-700"><CheckCircle size={14}/> Fasilitas Termasuk</label>
                            <textarea className="input-field" rows="4" value={formData.included_features} onChange={e => setFormData({...formData, included_features: e.target.value})} placeholder="- Tiket PP&#10;- Visa&#10;- Makan 3x"></textarea>
                        </div>
                        <div>
                            <label className="label flex items-center gap-1 text-red-700"><XCircle size={14}/> Tidak Termasuk</label>
                            <textarea className="input-field" rows="4" value={formData.excluded_features} onChange={e => setFormData({...formData, excluded_features: e.target.value})} placeholder="- Paspor&#10;- Suntik Meningitis"></textarea>
                        </div>
                    </div>

                    <div className="pt-2 border-t mt-2">
                        <label className="label">Harga Dasar (IDR)</label>
                        <div className="relative">
                            <DollarSign size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input type="number" className="input-field pl-10 text-lg font-bold" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} required placeholder="0" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Packages;