import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Clock, Plane, Hotel, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Packages = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
    
    const [categories, setCategories] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [airlines, setAirlines] = useState([]);

    useEffect(() => {
        fetchData();
        // Load data penunjang
        api.get('umh/v1/package-categories').then(setCategories).catch(() => {});
        api.get('umh/v1/hotels').then(setHotels).catch(() => {});
        api.get('umh/v1/flights').then(setAirlines).catch(() => {});
    }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);

    // Initial State sesuai dengan field API baru
    const initialForm = {
        name: '', 
        category_id: '',
        duration_days: 9,
        airline_id: '',
        hotel_makkah_id: '',
        hotel_madinah_id: '',
        base_price: 0, 
        description: '',
        included_features: '',
        excluded_features: ''
    };
    const [formData, setFormData] = useState(initialForm);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        // Reset form saat buka modal
        setFormData(item ? {
            ...item,
            // Pastikan nilai null dikonversi jadi string kosong agar input controlled
            category_id: item.category_id || '',
            airline_id: item.airline_id || '',
            hotel_makkah_id: item.hotel_makkah_id || '',
            hotel_madinah_id: item.hotel_madinah_id || '',
            base_price: item.base_price || 0,
            included_features: item.included_features || '',
            excluded_features: item.excluded_features || ''
        } : initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        
        if (success) { 
            setIsModalOpen(false); 
            toast.success(modalMode === 'create' ? 'Paket berhasil dibuat' : 'Paket berhasil diperbarui');
            fetchData(); 
        }
    };

    // Helper untuk menampilkan nama dari ID
    const getHotelName = (id) => hotels.find(h => String(h.id) === String(id))?.name || '-';
    const getAirlineName = (id) => airlines.find(a => String(a.id) === String(id))?.name || '-';

    const columns = [
        { header: 'Nama Paket', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-blue-900">{r.name}</div>
                <div className="text-xs text-gray-500">{r.category_name || 'Umrah Reguler'} • {r.duration_days} Hari</div>
            </div>
        )},
        { header: 'Maskapai', accessor: 'airline_id', render: r => (
            <div className="flex items-center gap-1 text-sm"><Plane size={14}/> {getAirlineName(r.airline_id)}</div>
        )},
        { header: 'Akomodasi', accessor: 'hotel_makkah_id', render: r => (
            <div className="text-xs">
                <div className="flex items-center gap-1"><Hotel size={12}/> Mek: {getHotelName(r.hotel_makkah_id)}</div>
                <div className="flex items-center gap-1 mt-1"><Hotel size={12}/> Mad: {getHotelName(r.hotel_madinah_id)}</div>
            </div>
        )},
        { header: 'Harga Mulai', accessor: 'base_price', render: r => <span className="font-semibold text-green-700">{formatCurrency(r.base_price)}</span> }
    ];

    return (
        <Layout title="Paket Umrah & Haji">
            <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">Kelola master paket, fasilitas, dan spesifikasi standar.</p>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2"><Plus size={18}/> Buat Paket Baru</button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Buat Paket Baru" : "Edit Paket"} size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* INFO UTAMA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="label">Nama Paket</label>
                            <input className="input-field font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Cth: Paket Umrah Hemat 9 Hari" required />
                        </div>
                        <div>
                            <label className="label">Kategori</label>
                            <select className="input-field" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                                <option value="">-- Pilih Kategori --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Durasi (Hari)</label>
                            <div className="relative">
                                <input type="number" className="input-field pl-10" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} />
                                <Clock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>
                        </div>
                        <div>
                            <label className="label">Harga Dasar (Mulai Dari)</label>
                            <input type="number" className="input-field" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Maskapai Penerbangan</label>
                            <select className="input-field" value={formData.airline_id} onChange={e => setFormData({...formData, airline_id: e.target.value})}>
                                <option value="">-- Pilih Maskapai --</option>
                                {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* AKOMODASI */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Hotel size={18}/> Standar Akomodasi</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Hotel Makkah</label>
                                <select className="input-field" value={formData.hotel_makkah_id} onChange={e => setFormData({...formData, hotel_makkah_id: e.target.value})}>
                                    <option value="">-- Pilih Hotel --</option>
                                    {hotels.filter(h => h.city === 'Makkah').map(h => <option key={h.id} value={h.id}>{h.name} ({h.rating}*)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Hotel Madinah</label>
                                <select className="input-field" value={formData.hotel_madinah_id} onChange={e => setFormData({...formData, hotel_madinah_id: e.target.value})}>
                                    <option value="">-- Pilih Hotel --</option>
                                    {hotels.filter(h => h.city === 'Madinah').map(h => <option key={h.id} value={h.id}>{h.name} ({h.rating}*)</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* FASILITAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label flex items-center gap-2 text-green-700"><CheckCircle size={16}/> Termasuk (Pisahkan dengan Enter)</label>
                            <textarea className="input-field" rows="5" value={formData.included_features} onChange={e => setFormData({...formData, included_features: e.target.value})} placeholder="- Tiket Pesawat PP&#10;- Visa Umrah&#10;- Makan 3x Sehari"></textarea>
                        </div>
                        <div>
                            <label className="label flex items-center gap-2 text-red-700"><XCircle size={16}/> Tidak Termasuk (Pisahkan dengan Enter)</label>
                            <textarea className="input-field" rows="5" value={formData.excluded_features} onChange={e => setFormData({...formData, excluded_features: e.target.value})} placeholder="- Pembuatan Paspor&#10;- Vaksin Meningitis&#10;- Kelebihan Bagasi"></textarea>
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