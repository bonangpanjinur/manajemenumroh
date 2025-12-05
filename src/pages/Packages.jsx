import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Package, Map, DollarSign, Plus, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Packages = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/packages');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [activeTab, setActiveTab] = useState('info'); // info | pricing | itinerary

    // State Form Kompleks
    const initialForm = {
        name: '',
        slug: '',
        type: 'umrah',
        duration_days: 9,
        base_price_quad: 0,
        base_price_triple: 0,
        base_price_double: 0,
        currency: 'IDR',
        down_payment_amount: 5000000,
        description: '',
        status: 'active',
        itineraries: [
            { day_number: 1, title: 'Keberangkatan', description: 'Berkumpul di Bandara Soekarno Hatta', location: 'Jakarta' }
        ]
    };
    const [form, setForm] = useState(initialForm);

    // Fetch detail lengkap saat edit (karena tabel utama tidak memuat itinerary)
    const handleEditClick = async (item) => {
        setMode('edit');
        setIsModalOpen(true);
        try {
            // Load detail itinerary dari backend
            const id = item.uuid || item.id;
            const res = await api.get(`umh/v1/packages/${id}/full`);
            if (res.data.success) {
                setForm(res.data.data);
            }
        } catch (error) {
            toast.error("Gagal memuat detail paket");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            // Pastikan angka tersimpan sebagai angka
            payload.base_price_quad = parseFloat(payload.base_price_quad);
            
            if (mode === 'create') {
                await api.post('umh/v1/packages', payload);
                toast.success("Paket berhasil dibuat");
            } else {
                const id = form.uuid || form.id;
                await api.put(`umh/v1/packages/${id}`, payload);
                toast.success("Paket berhasil diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Gagal menyimpan: " + err.message);
        }
    };

    // Helper Itinerary
    const addItineraryDay = () => {
        setForm(prev => ({
            ...prev,
            itineraries: [
                ...prev.itineraries,
                { day_number: prev.itineraries.length + 1, title: '', description: '', location: '' }
            ]
        }));
    };

    const removeItinerary = (index) => {
        const newItin = [...form.itineraries];
        newItin.splice(index, 1);
        // Re-index hari
        const reindexed = newItin.map((item, idx) => ({ ...item, day_number: idx + 1 }));
        setForm({ ...form, itineraries: reindexed });
    };

    const updateItinerary = (index, field, value) => {
        const newItin = [...form.itineraries];
        newItin[index][field] = value;
        setForm({ ...form, itineraries: newItin });
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500">{r.duration_days} Hari - {r.type.toUpperCase()}</div>
            </div>
        )},
        { header: 'Harga Mulai (Quad)', accessor: 'base_price_quad', render: r => (
            <span className="font-mono text-blue-600 font-bold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(r.base_price_quad)}
            </span>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${r.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {r.status}
            </span>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Produk & Paket</h1>
                    <p className="text-gray-500 text-sm">Kelola katalog paket Umroh dan Haji.</p>
                </div>
                <button onClick={() => { setMode('create'); setForm(initialForm); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Buat Paket
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={handleEditClick} // Custom handler untuk load itinerary
                    onDelete={deleteItem} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Buat Paket Baru" : "Edit Paket"}>
                <form onSubmit={handleSubmit}>
                    {/* Tab Navigation */}
                    <div className="flex border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Informasi Dasar</button>
                        <button type="button" onClick={() => setActiveTab('pricing')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'pricing' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Harga</button>
                        <button type="button" onClick={() => setActiveTab('itinerary')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'itinerary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Itinerary</button>
                    </div>

                    {/* TAB 1: INFO */}
                    {activeTab === 'info' && (
                        <div className="space-y-4">
                            <div>
                                <label className="label">Nama Paket</label>
                                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Promo Umroh Hemat 9 Hari" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Tipe</label>
                                    <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                        <option value="umrah">Umroh</option>
                                        <option value="haji">Haji</option>
                                        <option value="tour">Wisata Halal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Durasi (Hari)</label>
                                    <input type="number" className="input-field" value={form.duration_days} onChange={e => setForm({...form, duration_days: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Deskripsi Singkat</label>
                                <textarea className="input-field" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PRICING */}
                    {activeTab === 'pricing' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 mb-2">
                                Masukkan harga dasar. Harga jual aktual nanti disesuaikan di Jadwal Keberangkatan.
                            </div>
                            <div>
                                <label className="label">Harga Quad (Sekamar Ber-4)</label>
                                <input type="number" className="input-field" value={form.base_price_quad} onChange={e => setForm({...form, base_price_quad: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Harga Triple</label>
                                    <input type="number" className="input-field" value={form.base_price_triple} onChange={e => setForm({...form, base_price_triple: e.target.value})} />
                                </div>
                                <div>
                                    <label className="label">Harga Double</label>
                                    <input type="number" className="input-field" value={form.base_price_double} onChange={e => setForm({...form, base_price_double: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Minimal DP</label>
                                <input type="number" className="input-field" value={form.down_payment_amount} onChange={e => setForm({...form, down_payment_amount: e.target.value})} />
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ITINERARY */}
                    {activeTab === 'itinerary' && (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {form.itineraries?.map((item, idx) => (
                                <div key={idx} className="border p-3 rounded-lg relative bg-gray-50">
                                    <div className="absolute top-2 right-2">
                                        <button type="button" onClick={() => removeItinerary(idx)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="font-bold text-sm text-gray-700 mb-2">Hari ke-{item.day_number}</div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <input 
                                            placeholder="Judul Kegiatan (Misal: City Tour Makkah)" 
                                            className="input-field text-sm" 
                                            value={item.title} 
                                            onChange={e => updateItinerary(idx, 'title', e.target.value)} 
                                        />
                                        <textarea 
                                            placeholder="Deskripsi kegiatan..." 
                                            className="input-field text-sm" 
                                            rows="2"
                                            value={item.description}
                                            onChange={e => updateItinerary(idx, 'description', e.target.value)}
                                        ></textarea>
                                        <input 
                                            placeholder="Lokasi (Opsional)" 
                                            className="input-field text-sm" 
                                            value={item.location} 
                                            onChange={e => updateItinerary(idx, 'location', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addItineraryDay} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2">
                                <Plus size={16} /> Tambah Hari
                            </button>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;