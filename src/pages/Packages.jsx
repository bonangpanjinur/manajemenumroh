import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Package, Plus, MapPin, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Packages = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/packages');
    
    // State untuk Data Referensi (Array kosong default)
    const [hotels, setHotels] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    // Fetch Master Data Hotel dengan Safety Check
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const res = await api.get('umh/v1/masters/hotels');
                // PERBAIKAN: Cek apakah data ada di res.data.data (wp_send_json_success) atau res.data (REST API standard)
                const hotelList = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setHotels(hotelList);
            } catch (e) {
                console.error("Gagal load data hotel", e);
                setHotels([]); // Fallback ke array kosong
            }
        };
        fetchMasters();
    }, []);

    // Filter Hotel: Aman karena hotels dijamin Array
    const makkahHotels = hotels.filter(h => h.city === 'Makkah');
    const madinahHotels = hotels.filter(h => h.city === 'Madinah');

    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/packages', form);
            else await api.put(`umh/v1/packages/${form.id}`, form);
            
            toast.success("Paket berhasil disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (error) { toast.error("Gagal simpan: " + error.message); }
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name', render: r => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-teal-50 flex items-center justify-center text-teal-600">
                    <Package size={20}/>
                </div>
                <div>
                    <div className="font-bold text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.duration_days} Hari • {r.type ? r.type.toUpperCase() : 'UMRAH'}</div>
                </div>
            </div>
        )},
        { header: 'Akomodasi', accessor: 'hotels', render: r => (
            <div className="text-xs space-y-1">
                <div className="flex items-center gap-1"><MapPin size={10} className="text-gray-400"/> <b>Makkah:</b> {r.hotel_makkah_name || '-'}</div>
                <div className="flex items-center gap-1"><MapPin size={10} className="text-gray-400"/> <b>Madinah:</b> {r.hotel_madinah_name || '-'}</div>
            </div>
        )},
        { header: 'Harga Mulai', accessor: 'base_price', render: r => <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded">{formatIDR(r.base_price_quad)}</span> },
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {r.status}
            </span>
        )},
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-xl text-white shadow-md">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Katalog Paket</h1>
                        <p className="text-gray-500 text-sm">Manajemen produk dengan relasi hotel & harga berjenjang.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setForm({ duration_days: 9, currency: 'IDR', status: 'active', type: 'umrah' }); setMode('create'); setIsModalOpen(true); }} 
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-teal-200"
                >
                    <Plus size={18} /> Buat Paket Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={(item) => deleteItem(item.id)} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Paket Baru" : "Edit Paket"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="label">Nama Paket</label>
                            <input className="input-field" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Umroh Akbar 2025" required />
                        </div>
                        <div>
                            <label className="label">Durasi (Hari)</label>
                            <input type="number" className="input-field" value={form.duration_days || 9} onChange={e => setForm({...form, duration_days: e.target.value})} />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h3 className="font-bold text-gray-700 text-xs border-b pb-2 uppercase tracking-wide flex items-center gap-2"><MapPin size={14}/> Konfigurasi Akomodasi (Master Data)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Hotel Makkah</label>
                                <select className="input-field" value={form.hotel_makkah_id || ''} onChange={e => setForm({...form, hotel_makkah_id: e.target.value})}>
                                    <option value="">-- Pilih Hotel --</option>
                                    {makkahHotels.map(h => (
                                        <option key={h.id} value={h.id}>{h.name} ({'★'.repeat(h.rating)})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Hotel Madinah</label>
                                <select className="input-field" value={form.hotel_madinah_id || ''} onChange={e => setForm({...form, hotel_madinah_id: e.target.value})}>
                                    <option value="">-- Pilih Hotel --</option>
                                    {madinahHotels.map(h => (
                                        <option key={h.id} value={h.id}>{h.name} ({'★'.repeat(h.rating)})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wide flex items-center gap-2"><DollarSign size={14}/> Varian Harga (IDR)</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="price-input-group">
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Quad (Sekamar 4)</label>
                                <input type="number" className="input-field font-bold text-gray-800" value={form.base_price_quad || ''} onChange={e => setForm({...form, base_price_quad: e.target.value})} placeholder="30.000.000" />
                            </div>
                            <div className="price-input-group">
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Triple (Sekamar 3)</label>
                                <input type="number" className="input-field font-bold text-gray-800" value={form.base_price_triple || ''} onChange={e => setForm({...form, base_price_triple: e.target.value})} placeholder="32.500.000" />
                            </div>
                            <div className="price-input-group">
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Double (Sekamar 2)</label>
                                <input type="number" className="input-field font-bold text-gray-800" value={form.base_price_double || ''} onChange={e => setForm({...form, base_price_double: e.target.value})} placeholder="35.000.000" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;