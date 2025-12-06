import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Package, Plus, Trash2, Building, List, DollarSign, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Packages = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/packages');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [activeTab, setActiveTab] = useState('info'); 
    const [masterHotels, setMasterHotels] = useState([]);

    const initialForm = {
        name: '', slug: '', type: 'umrah', duration_days: 9,
        base_price_quad: 0, base_price_triple: 0, base_price_double: 0,
        down_payment_amount: 5000000, description: '', status: 'active',
        itineraries: [{ day_number: 1, title: 'Keberangkatan', description: '', location: 'Jakarta' }],
        hotels: [] 
    };
    const [form, setForm] = useState(initialForm);

    // Fetch Master Hotels saat Modal Dibuka
    useEffect(() => {
        if (isModalOpen) {
            api.get('umh/v1/hotels?per_page=100').then(res => {
                const hotelList = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setMasterHotels(hotelList);
            }).catch(console.error);
        }
    }, [isModalOpen]);

    const handleEditClick = async (item) => {
        setMode('edit');
        setIsModalOpen(true);
        try {
            const id = item.uuid || item.id;
            const res = await api.get(`umh/v1/packages/${id}/full`);
            if (res.data.success) {
                const loadedData = res.data.data;
                // Normalize data arrays
                if(!loadedData.hotels) loadedData.hotels = [];
                if(!loadedData.itineraries) loadedData.itineraries = [];
                setForm(loadedData);
            }
        } catch (error) { toast.error("Gagal memuat detail paket"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (mode === 'create') await api.post('umh/v1/packages', payload);
            else await api.put(`umh/v1/packages/${form.uuid || form.id}`, payload);
            
            toast.success("Paket berhasil disimpan!");
            setIsModalOpen(false);
            fetchData();
        } catch (err) { toast.error("Gagal: " + (err.response?.data?.message || err.message)); }
    };

    // --- Dynamic Hotel Logic ---
    const addHotel = () => {
        setForm(prev => ({
            ...prev,
            hotels: [...prev.hotels, { city_name: 'Makkah', hotel_id: '', nights: 1 }]
        }));
    };

    const updateHotel = (index, field, value) => {
        const newHotels = [...form.hotels];
        newHotels[index][field] = value;
        setForm({ ...form, hotels: newHotels });
    };

    const removeHotel = (index) => {
        const newHotels = [...form.hotels];
        newHotels.splice(index, 1);
        setForm({ ...form, hotels: newHotels });
    };
    // ---------------------------

    const columns = [
        { header: 'Nama Paket', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{r.type.replace('_',' ')}</span> • {r.duration_days} Hari
                </div>
            </div>
        )},
        { header: 'Akomodasi', accessor: 'hotel_summary', render: r => (
            <div className="text-xs space-y-1">
                {r.hotel_summary ? (
                    r.hotel_summary.split(', ').map((h, i) => (
                        <div key={i} className="flex items-center gap-1 text-gray-600">
                            <Building size={10} className="text-blue-400"/> {h}
                        </div>
                    ))
                ) : <span className="text-gray-400 italic">Belum diset</span>}
            </div>
        )},
        { header: 'Harga Quad', accessor: 'base_price_quad', render: r => (
            <span className="font-mono font-bold text-gray-800">{new Intl.NumberFormat('id-ID').format(r.base_price_quad)}</span>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${r.status==='active'?'bg-green-100 text-green-600':'bg-gray-100 text-gray-500'}`}>{r.status}</span>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Master Paket</h1>
                    <p className="text-sm text-gray-500">Kelola produk paket perjalanan dan fasilitasnya.</p>
                </div>
                <button onClick={() => { setMode('create'); setForm(initialForm); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Buat Paket Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={handleEditClick} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create'?"Buat Paket":"Edit Paket"} size="max-w-4xl">
                <form onSubmit={handleSubmit}>
                    <div className="flex border-b mb-6 space-x-4">
                        {[
                            {id: 'info', icon: Package, label: 'Informasi Dasar'},
                            {id: 'pricing', icon: DollarSign, label: 'Harga & Biaya'},
                            {id: 'hotels', icon: Building, label: 'Hotel & Akomodasi'},
                            {id: 'itinerary', icon: List, label: 'Itinerary'}
                        ].map(tab => (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} 
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab===tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                <tab.icon size={16}/> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[300px]">
                        {activeTab === 'info' && (
                            <div className="space-y-4 animate-fade-in grid grid-cols-2 gap-4">
                                <div className="col-span-2"><label className="label">Nama Paket</label><input className="input-field font-medium text-lg" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required placeholder="Contoh: Umroh Turki Akhir Tahun 2025" /></div>
                                <div><label className="label">Tipe Produk</label>
                                    <select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                                        <option value="umrah">Umroh Reguler</option><option value="umrah_plus">Umroh Plus</option><option value="haji">Haji</option><option value="tour">Wisata Halal</option>
                                    </select>
                                </div>
                                <div><label className="label">Durasi (Hari)</label><input type="number" className="input-field" value={form.duration_days} onChange={e=>setForm({...form, duration_days:e.target.value})}/></div>
                                <div className="col-span-2"><label className="label">Deskripsi Singkat</label><textarea className="input-field" rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}></textarea></div>
                            </div>
                        )}

                        {activeTab === 'pricing' && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 items-start">
                                    <DollarSign className="text-blue-600 mt-0.5" size={20}/>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-bold">Info Harga Dasar</p>
                                        Harga ini akan menjadi <i>default</i> saat membuat jadwal keberangkatan. Anda masih bisa mengubahnya nanti per jadwal.
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div><label className="label">Harga Quad (4 Org)</label><input type="number" className="input-field font-mono" value={form.base_price_quad} onChange={e=>setForm({...form, base_price_quad:e.target.value})}/></div>
                                    <div><label className="label">Harga Triple (3 Org)</label><input type="number" className="input-field font-mono" value={form.base_price_triple} onChange={e=>setForm({...form, base_price_triple:e.target.value})}/></div>
                                    <div><label className="label">Harga Double (2 Org)</label><input type="number" className="input-field font-mono" value={form.base_price_double} onChange={e=>setForm({...form, base_price_double:e.target.value})}/></div>
                                </div>
                                <div><label className="label">Minimal Uang Muka (DP)</label><input type="number" className="input-field font-bold" value={form.down_payment_amount} onChange={e=>setForm({...form, down_payment_amount:e.target.value})}/></div>
                            </div>
                        )}

                        {activeTab === 'hotels' && (
                            <div className="space-y-4 animate-fade-in">
                                {form.hotels.map((h, idx) => (
                                    <div key={idx} className="flex gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                                        <div className="w-1/4">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kota</label>
                                            <select className="input-field text-sm" value={h.city_name} onChange={e=>updateHotel(idx, 'city_name', e.target.value)}>
                                                <option value="Makkah">Makkah</option><option value="Madinah">Madinah</option>
                                                <option value="Jeddah">Jeddah</option><option value="Istanbul">Istanbul</option><option value="Dubai">Dubai</option><option value="Lainnya">Lainnya</option>
                                            </select>
                                        </div>
                                        <div className="w-1/2">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pilih Hotel (Master Data)</label>
                                            <select className="input-field text-sm" value={h.hotel_id} onChange={e=>updateHotel(idx, 'hotel_id', e.target.value)}>
                                                <option value="">-- Pilih Hotel --</option>
                                                {masterHotels
                                                    .filter(mh => mh.city === h.city_name || h.city_name === 'Lainnya')
                                                    .map(mh => (
                                                    <option key={mh.id} value={mh.id}>{mh.name} ({mh.rating}*)</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-1/4">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Durasi (Malam)</label>
                                            <input type="number" className="input-field text-sm" value={h.nights} onChange={e=>updateHotel(idx, 'nights', e.target.value)} />
                                        </div>
                                        <button type="button" onClick={() => removeHotel(idx)} className="mb-1 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addHotel} className="btn-secondary w-full py-3 border-dashed border-2 flex justify-center gap-2 text-blue-600 hover:border-blue-400 hover:bg-blue-50">
                                    <Plus size={18}/> Tambah Akomodasi Hotel
                                </button>
                            </div>
                        )}

                        {activeTab === 'itinerary' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                                    {form.itineraries?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">{item.day_number}</div>
                                            <div className="flex-1 bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <input className="font-bold text-gray-800 border-b border-transparent focus:border-blue-500 focus:outline-none w-2/3" 
                                                        placeholder="Judul Kegiatan" value={item.title} 
                                                        onChange={e=>{const n=[...form.itineraries]; n[idx].title=e.target.value; setForm({...form, itineraries:n})}}
                                                    />
                                                    <button type="button" onClick={()=>{
                                                        const n=[...form.itineraries]; n.splice(idx,1); 
                                                        setForm({...form, itineraries:n.map((x,i)=>({...x, day_number:i+1}))});
                                                    }} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                                                </div>
                                                <textarea className="w-full text-sm text-gray-600 bg-gray-50 p-2 rounded border-0 focus:ring-1 focus:ring-blue-500 resize-none" 
                                                    rows="2" placeholder="Deskripsi..." value={item.description}
                                                    onChange={e=>{const n=[...form.itineraries]; n[idx].description=e.target.value; setForm({...form, itineraries:n})}}
                                                ></textarea>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={()=>setForm(p=>({...p, itineraries:[...p.itineraries, {day_number:p.itineraries.length+1, title:'', description:''}]}))} className="btn-secondary w-full text-sm py-2"><Plus size={16}/> Tambah Hari</button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t bg-white sticky bottom-0">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition">Batal</button>
                        <button type="submit" className="btn-primary px-6 py-2.5 shadow-lg shadow-blue-200">Simpan Data Paket</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;