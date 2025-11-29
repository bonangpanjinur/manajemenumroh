import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Calendar, DollarSign, Users, Hotel } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const Departures = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/departures');
    const { data: packages } = useCRUD('umh/v1/packages');
    
    // Load Master Hotels untuk dropdown
    const [hotels, setHotels] = useState([]);
    useEffect(() => {
        api.get('umh/v1/hotels').then(setHotels).catch(console.error);
        fetchData();
    }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // State Form disesuaikan dengan DB Schema
    const [formData, setFormData] = useState({ 
        package_id: '', departure_date: '', return_date: '', quota: 45, 
        price_quad: 0, price_triple: 0, price_double: 0,
        hotel_makkah_id: '', hotel_madinah_id: '',
        tour_leader_name: '', mutawwif_name: '', currency: 'IDR'
    });

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        if (item) {
            setFormData({
                ...item,
                departure_date: item.departure_date?.split('T')[0],
                return_date: item.return_date?.split('T')[0]
            });
        } else {
            // Reset form
            setFormData({ 
                package_id: '', departure_date: '', return_date: '', quota: 45, 
                price_quad: 0, price_triple: 0, price_double: 0,
                hotel_makkah_id: '', hotel_madinah_id: '',
                tour_leader_name: '', mutawwif_name: '', currency: 'IDR'
            });
        }
        setIsModalOpen(true);
    };

    // Auto-fill harga dasar dari Paket saat dipilih
    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        const selectedPkg = packages?.find(p => String(p.id) === String(pkgId));
        setFormData(prev => ({
            ...prev,
            package_id: pkgId,
            // Asumsi di paket ada base price, kita set ke Quad sebagai default
            price_quad: selectedPkg ? selectedPkg.price : 0,
            price_triple: selectedPkg ? (Number(selectedPkg.price) + 1000000) : 0, // Dummy logic
            price_double: selectedPkg ? (Number(selectedPkg.price) + 2000000) : 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) { setIsModalOpen(false); fetchData(); }
    };

    const columns = [
        { header: 'Keberangkatan', accessor: 'departure_date', render: r => (
            <div>
                <div className="font-medium flex items-center gap-2"><Calendar size={16} className="text-blue-500"/> {formatDate(r.departure_date)}</div>
                <div className="text-xs text-gray-500">Pulang: {formatDate(r.return_date)}</div>
            </div>
        )},
        { header: 'Paket', accessor: 'package_name', className: 'font-bold' },
        { header: 'Harga (Quad)', accessor: 'price_quad', render: r => (
            <div className="font-semibold text-green-700">
                {r.currency} {formatCurrency(r.price_quad).replace('Rp', '')}
            </div>
        )},
        { header: 'Seat', accessor: 'quota', render: r => (
            <div className="flex flex-col items-center">
                <span className="badge bg-blue-50 text-blue-700">{r.quota} Total</span>
                <span className="text-[10px] text-gray-500 mt-1">{r.filled_seats || 0} Terisi</span>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => <span className={`badge uppercase text-xs ${r.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span> }
    ];

    return (
        <Layout title="Jadwal Keberangkatan">
            <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-500 text-sm">Atur jadwal, harga per tipe kamar, dan hotel spesifik.</p>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah Jadwal
                </button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onEdit={(item) => handleOpenModal('edit', item)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Jadwal Baru" : "Edit Jadwal"} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Section 1: Paket & Tanggal */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Paket Perjalanan</label>
                            <select className="input-field" value={formData.package_id} onChange={handlePackageChange} required disabled={modalMode === 'edit'}>
                                <option value="">-- Pilih Paket --</option>
                                {packages?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Tanggal Berangkat</label><input type="date" className="input-field" value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} required /></div>
                        <div><label className="label">Tanggal Pulang</label><input type="date" className="input-field" value={formData.return_date} onChange={e => setFormData({...formData, return_date: e.target.value})} required /></div>
                    </div>

                    {/* Section 2: Harga & Kuota */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2"><DollarSign size={16}/> Harga Jual Per Pax</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600">Quad (Sekamar Ber-4)</label>
                                <input type="number" className="input-field" value={formData.price_quad} onChange={e => setFormData({...formData, price_quad: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600">Triple (Sekamar Ber-3)</label>
                                <input type="number" className="input-field" value={formData.price_triple} onChange={e => setFormData({...formData, price_triple: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600">Double (Sekamar Ber-2)</label>
                                <input type="number" className="input-field" value={formData.price_double} onChange={e => setFormData({...formData, price_double: e.target.value})} />
                            </div>
                        </div>
                        <div className="mt-3 flex gap-4">
                            <div className="w-1/3">
                                <label className="label">Mata Uang</label>
                                <select className="input-field" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                                    <option value="IDR">IDR (Rupiah)</option>
                                    <option value="USD">USD (Dolar)</option>
                                </select>
                            </div>
                            <div className="w-1/3">
                                <label className="label">Kuota Seat</label>
                                <input type="number" className="input-field" value={formData.quota} onChange={e => setFormData({...formData, quota: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Hotel & Pembimbing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label flex items-center gap-1"><Hotel size={14}/> Hotel Makkah</label>
                            <select className="input-field" value={formData.hotel_makkah_id} onChange={e => setFormData({...formData, hotel_makkah_id: e.target.value})}>
                                <option value="">Default Paket</option>
                                {hotels.filter(h => h.city === 'Makkah').map(h => <option key={h.id} value={h.id}>{h.name} ({h.rating}*)</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label flex items-center gap-1"><Hotel size={14}/> Hotel Madinah</label>
                            <select className="input-field" value={formData.hotel_madinah_id} onChange={e => setFormData({...formData, hotel_madinah_id: e.target.value})}>
                                <option value="">Default Paket</option>
                                {hotels.filter(h => h.city === 'Madinah').map(h => <option key={h.id} value={h.id}>{h.name} ({h.rating}*)</option>)}
                            </select>
                        </div>
                        <div><label className="label">Tour Leader</label><input className="input-field" value={formData.tour_leader_name} onChange={e => setFormData({...formData, tour_leader_name: e.target.value})} placeholder="Nama TL" /></div>
                        <div><label className="label">Mutawwif</label><input className="input-field" value={formData.mutawwif_name} onChange={e => setFormData({...formData, mutawwif_name: e.target.value})} placeholder="Nama Mutawwif" /></div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Jadwal</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Departures;