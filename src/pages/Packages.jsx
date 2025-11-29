import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import { Package, Plus, Trash2, Hotel, Plane } from 'lucide-react';
import toast from 'react-hot-toast';

const Packages = () => {
    // 1. Data Utama
    const { data, loading, fetchData, createItem, deleteItem } = useCRUD('umh/v1/packages');
    
    // 2. Data Master (untuk Dropdown)
    const [categories, setCategories] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [masterHotels, setMasterHotels] = useState([]);

    // 3. State Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', category_id: '', airline_id: '', duration: 9, description: '',
        itinerary_type: 'text', itinerary_content: '',
        hotels: [] // Array of { id, city, nights }
    });

    useEffect(() => {
        fetchData();
        fetchMasters();
    }, [fetchData]);

    const fetchMasters = async () => {
        try {
            const [catRes, airRes, hotelRes] = await Promise.all([
                api.get('umh/v1/package-categories'),
                api.get('umh/v1/flights'),
                api.get('umh/v1/hotels')
            ]);
            setCategories(catRes);
            setAirlines(airRes);
            setMasterHotels(hotelRes);
        } catch (e) {
            console.error("Gagal ambil master data", e);
        }
    };

    // --- Logic Dynamic Hotels ---
    const addHotelRow = () => {
        setFormData({
            ...formData,
            hotels: [...formData.hotels, { id: '', city: 'makkah', nights: 3 }]
        });
    };

    const updateHotelRow = (index, field, value) => {
        const newHotels = [...formData.hotels];
        newHotels[index][field] = value;
        setFormData({ ...formData, hotels: newHotels });
    };

    const removeHotelRow = (index) => {
        const newHotels = formData.hotels.filter((_, i) => i !== index);
        setFormData({ ...formData, hotels: newHotels });
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ name: '', category_id: '', airline_id: '', duration: 9, hotels: [], itinerary_type: 'text' });
        }
    };

    // --- Columns untuk Table ---
    const columns = [
        { header: 'Nama Paket', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500">{r.duration} Hari | {r.category_name}</div>
            </div>
        )},
        { header: 'Maskapai', accessor: 'airline_name', render: r => (
            <div className="flex items-center gap-1 text-sm text-gray-600">
                <Plane size={14}/> {r.airline_name || '-'}
            </div>
        )},
        { header: 'Status', accessor: 'status' }
    ];

    return (
        <Layout title="Manajemen Paket Umroh & Haji">
            <div className="mb-4 flex justify-between">
                <div></div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Buat Paket Baru
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onDelete={(item) => deleteItem(item.id)} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Paket Baru">
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Nama Paket</label>
                            <input className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Umroh Hemat Januari 2025" />
                        </div>
                        <div>
                            <label className="label">Kategori</label>
                            <select className="input-field" required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                                <option value="">Pilih Kategori</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Maskapai</label>
                            <select className="input-field" required value={formData.airline_id} onChange={e => setFormData({...formData, airline_id: e.target.value})}>
                                <option value="">Pilih Maskapai</option>
                                {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Durasi (Hari)</label>
                            <input type="number" className="input-field" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                        </div>
                    </div>

                    {/* Dynamic Hotels */}
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <label className="label mb-0 flex items-center gap-2"><Hotel size={14}/> Akomodasi Hotel</label>
                            <button type="button" onClick={addHotelRow} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">+ Tambah Hotel</button>
                        </div>
                        {formData.hotels.map((h, idx) => (
                            <div key={idx} className="flex gap-2 mb-2 items-end">
                                <div className="flex-grow">
                                    <label className="text-[10px] text-gray-500">Kota</label>
                                    <select className="input-field text-sm py-1" value={h.city} onChange={e => updateHotelRow(idx, 'city', e.target.value)}>
                                        <option value="makkah">Makkah</option>
                                        <option value="madinah">Madinah</option>
                                    </select>
                                </div>
                                <div className="flex-grow-[2]">
                                    <label className="text-[10px] text-gray-500">Hotel (Master)</label>
                                    <select className="input-field text-sm py-1" value={h.id} onChange={e => updateHotelRow(idx, 'id', e.target.value)}>
                                        <option value="">Pilih Hotel...</option>
                                        {masterHotels.filter(mh => mh.city.toLowerCase() === h.city).map(mh => (
                                            <option key={mh.id} value={mh.id}>{mh.name} ({mh.star_rating} Bintang)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-16">
                                    <label className="text-[10px] text-gray-500">Malam</label>
                                    <input type="number" className="input-field text-sm py-1" value={h.nights} onChange={e => updateHotelRow(idx, 'nights', e.target.value)} />
                                </div>
                                <button type="button" onClick={() => removeHotelRow(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        {formData.hotels.length === 0 && <div className="text-xs text-center text-gray-400 py-2">Belum ada hotel dipilih</div>}
                    </div>

                    {/* Itinerary */}
                    <div>
                        <label className="label">Itinerary</label>
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="iti_type" checked={formData.itinerary_type === 'text'} onChange={() => setFormData({...formData, itinerary_type: 'text'})} /> Tulis Manual
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-not-allowed" title="Fitur Upload dalam pengembangan">
                                <input type="radio" name="iti_type" disabled /> Upload File (Soon)
                            </label>
                        </div>
                        {formData.itinerary_type === 'text' && (
                            <textarea 
                                className="input-field h-24" 
                                placeholder="Hari 1: Berangkat, Hari 2: Tiba di Madinah..." 
                                value={formData.itinerary_content}
                                onChange={e => setFormData({...formData, itinerary_content: e.target.value})}
                            ></textarea>
                        )}
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