import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Trash, List, CheckSquare } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Packages = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/packages');
    
    // State untuk Data Master Dropdown
    const [categories, setCategories] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [airlines, setAirlines] = useState([]);

    useEffect(() => {
        fetchData();
        // Load Master Data untuk Dropdown (Kategori, Hotel, Maskapai)
        const loadMasters = async () => {
            try {
                const [cats, hots, airs] = await Promise.all([
                    api.get('umh/v1/package-categories'),
                    api.get('umh/v1/masters/hotels'),
                    api.get('umh/v1/masters/airlines')
                ]);
                // Handle struktur data response (res.data jika ada)
                setCategories(cats.data || cats || []);
                setHotels(hots.data || hots || []);
                setAirlines(airs.data || airs || []);
            } catch (e) { console.error("Error loading masters", e); }
        };
        loadMasters();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [activeTab, setActiveTab] = useState('info');

    // Initial Form State yang lengkap
    const initialForm = {
        category_id: '', name: '', description: '', duration_days: 9,
        currency: 'IDR', base_price_quad: 0, base_price_triple: 0, base_price_double: 0,
        hotel_makkah_id: '', hotel_madinah_id: '', airline_id: '',
        itinerary: [], // Array of objects
        facilities: [] // Array of objects
    };
    const [formData, setFormData] = useState(initialForm);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // --- Logic Itinerary ---
    const handleAddItinerary = () => {
        setFormData(prev => ({
            ...prev,
            itinerary: [...prev.itinerary, { day_number: prev.itinerary.length + 1, title: '', description: '', meals: 'B/L/D' }]
        }));
    };

    const handleItineraryChange = (idx, field, val) => {
        const newItin = [...formData.itinerary];
        newItin[idx][field] = val;
        setFormData({ ...formData, itinerary: newItin });
    };

    const handleRemoveItinerary = (idx) => {
        const newItin = formData.itinerary.filter((_, i) => i !== idx);
        const reordered = newItin.map((item, i) => ({ ...item, day_number: i + 1 }));
        setFormData({ ...formData, itinerary: reordered });
    };

    // --- Logic Fasilitas ---
    const handleAddFacility = () => {
        setFormData(prev => ({
            ...prev,
            facilities: [...prev.facilities, { item_name: '', type: 'include' }]
        }));
    };

    const handleFacilityChange = (idx, field, val) => {
        const newFac = [...formData.facilities];
        newFac[idx][field] = val;
        setFormData({ ...formData, facilities: newFac });
    };

    const handleRemoveFacility = (idx) => {
        setFormData(prev => ({ ...prev, facilities: prev.facilities.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiPath = 'umh/v1/packages';
            if (modalMode === 'create') {
                await api.post(apiPath, formData);
            } else {
                toast.error("Fitur Edit Paket Lengkap sedang dalam pengembangan. Silakan buat baru untuk saat ini.");
                return;
                // Nanti: await api.put(`${apiPath}/${formData.id}`, formData);
            }
            toast.success("Paket berhasil disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Gagal simpan paket: " + err.message);
        }
    };

    const openModal = async (mode, item = null) => {
        setModalMode(mode);
        setActiveTab('info');
        if (mode === 'edit' && item) {
            // Ambil detail lengkap dari API (karena di tabel cuma header)
            try {
                const detail = await api.get(`umh/v1/packages/${item.id}`);
                if (detail.success || detail.data) {
                    setFormData(detail.data || detail);
                }
            } catch (e) { console.error(e); }
        } else {
            setFormData(initialForm);
        }
        setIsModalOpen(true);
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name', render: r => (
            <div>
                <div className="font-bold">{r.name}</div>
                <div className="text-xs text-gray-500">{r.duration_days} Hari • {r.currency}</div>
            </div>
        )},
        { header: 'Harga (Quad)', accessor: 'base_price_quad', render: r => formatCurrency(r.base_price_quad, r.currency) },
        { header: 'Akomodasi', accessor: 'id', render: r => {
            const makkah = hotels.find(h => h.id == r.hotel_makkah_id)?.name || '-';
            return <div className="text-xs">Makkah: {makkah}</div>
        }},
    ];

    return (
        <Layout title="Katalog Paket Umroh & Haji">
            <div className="mb-6 flex justify-between">
                <h2 className="text-xl font-bold">Daftar Paket</h2>
                <button onClick={() => openModal('create')} className="btn-primary flex items-center gap-2"><Plus size={18}/> Buat Paket Baru</button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onDelete={(item) => deleteItem(item.id)}
                    onEdit={(item) => openModal('edit', item)}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode==='create'?"Buat Paket Baru":"Edit Paket"} size="max-w-6xl">
                <form onSubmit={handleSubmit} className="flex flex-col h-[70vh]">
                    <div className="flex border-b mb-4">
                        {['info', 'itinerary', 'facilities'].map(tab => (
                            <button key={tab} type="button" onClick={() => setActiveTab(tab)} 
                                className={`px-6 py-3 font-medium capitalize border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
                        {activeTab === 'info' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2"><label className="label">Nama Paket</label><input name="name" className="input-field" value={formData.name} onChange={handleChange} required /></div>
                                <div><label className="label">Kategori</label><select name="category_id" className="input-field" value={formData.category_id} onChange={handleChange}><option value="">Pilih Kategori</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                <div><label className="label">Durasi (Hari)</label><input type="number" name="duration_days" className="input-field" value={formData.duration_days} onChange={handleChange} /></div>
                                
                                <div className="col-span-2 border-t pt-4 font-bold text-gray-700">Konfigurasi Harga</div>
                                <div><label className="label">Mata Uang</label><select name="currency" className="input-field" value={formData.currency} onChange={handleChange}><option value="IDR">IDR (Rupiah)</option><option value="USD">USD (Dolar)</option></select></div>
                                <div><label className="label">Harga Quad (Sekamar 4)</label><input type="number" name="base_price_quad" className="input-field" value={formData.base_price_quad} onChange={handleChange} /></div>
                                <div><label className="label">Harga Triple (Sekamar 3)</label><input type="number" name="base_price_triple" className="input-field" value={formData.base_price_triple} onChange={handleChange} /></div>
                                <div><label className="label">Harga Double (Sekamar 2)</label><input type="number" name="base_price_double" className="input-field" value={formData.base_price_double} onChange={handleChange} /></div>

                                <div className="col-span-2 border-t pt-4 font-bold text-gray-700">Akomodasi</div>
                                <div><label className="label">Hotel Makkah</label><select name="hotel_makkah_id" className="input-field" value={formData.hotel_makkah_id} onChange={handleChange}><option value="">Pilih Hotel</option>{hotels.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                                <div><label className="label">Hotel Madinah</label><select name="hotel_madinah_id" className="input-field" value={formData.hotel_madinah_id} onChange={handleChange}><option value="">Pilih Hotel</option>{hotels.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                                <div><label className="label">Maskapai</label><select name="airline_id" className="input-field" value={formData.airline_id} onChange={handleChange}><option value="">Pilih Maskapai</option>{airlines.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                            </div>
                        )}

                        {activeTab === 'itinerary' && (
                            <div className="space-y-4">
                                {formData.itinerary.map((day, idx) => (
                                    <div key={idx} className="border p-4 rounded bg-gray-50 flex gap-4 items-start">
                                        <div className="w-16 pt-2 font-bold text-gray-500 text-center">Hari {day.day_number}</div>
                                        <div className="flex-1 space-y-2">
                                            <input className="input-field font-bold" placeholder="Judul Kegiatan" value={day.title} onChange={e => handleItineraryChange(idx, 'title', e.target.value)} />
                                            <textarea className="input-field h-20" placeholder="Deskripsi detil..." value={day.description} onChange={e => handleItineraryChange(idx, 'description', e.target.value)} />
                                            <input className="input-field" placeholder="Makan (B/L/D)" value={day.meals} onChange={e => handleItineraryChange(idx, 'meals', e.target.value)} />
                                        </div>
                                        <button type="button" onClick={() => handleRemoveItinerary(idx)} className="text-red-500 p-2"><Trash size={18}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddItinerary} className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:bg-gray-50 flex justify-center items-center gap-2"><Plus size={18}/> Tambah Hari</button>
                            </div>
                        )}

                        {activeTab === 'facilities' && (
                            <div className="space-y-2">
                                {formData.facilities.map((fac, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <select className="input-field w-32" value={fac.type} onChange={e => handleFacilityChange(idx, 'type', e.target.value)}>
                                            <option value="include">Termasuk</option>
                                            <option value="exclude">Tidak Termasuk</option>
                                        </select>
                                        <input className="input-field flex-1" placeholder="Nama Fasilitas" value={fac.item_name} onChange={e => handleFacilityChange(idx, 'item_name', e.target.value)} />
                                        <button type="button" onClick={() => handleRemoveFacility(idx)} className="text-red-500 p-2"><Trash size={18}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddFacility} className="btn-secondary w-full mt-4"><Plus size={16}/> Tambah Item</button>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Packages;