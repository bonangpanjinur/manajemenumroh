import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Package, Plus, Trash2, Building, MapPin, List, DollarSign } from 'lucide-react';
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
        hotels: [] // [{ city_name: 'Makkah', hotel_id: 1, nights: 4 }]
    };
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if(isModalOpen) {
            // Load Master Hotel untuk Dropdown
            api.get('umh/v1/hotels?per_page=100').then(res => {
                setMasterHotels(Array.isArray(res.data) ? res.data : (res.data.data || []));
            });
        }
    }, [isModalOpen]);

    const handleEditClick = async (item) => {
        setMode('edit');
        setIsModalOpen(true);
        try {
            const id = item.uuid || item.id;
            const res = await api.get(`umh/v1/packages/${id}/full`);
            if (res.data.success) {
                // Pastikan format hotel sesuai
                const loadedData = res.data.data;
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
            
            toast.success("Data Paket berhasil disimpan!");
            setIsModalOpen(false);
            fetchData();
        } catch (err) { toast.error("Gagal: " + err.message); }
    };

    // --- Logic Dynamic Hotel ---
    const addHotel = () => {
        setForm(prev => ({
            ...prev,
            hotels: [...prev.hotels, { city_name: 'Makkah', hotel_id: '', nights: 1 }]
        }));
    };

    const removeHotel = (idx) => {
        const newHotels = [...form.hotels];
        newHotels.splice(idx, 1);
        setForm({ ...form, hotels: newHotels });
    };

    const updateHotel = (idx, field, val) => {
        const newHotels = [...form.hotels];
        newHotels[idx][field] = val;
        setForm({ ...form, hotels: newHotels });
    };
    // ---------------------------

    const columns = [
        { header: 'Nama Paket', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">{r.type} • {r.duration_days} Hari</div>
            </div>
        )},
        { header: 'Akomodasi', accessor: 'hotel_summary', render: r => (
            <div className="text-xs">
                {r.hotel_summary ? (
                    r.hotel_summary.split(', ').map((h, i) => (
                        <div key={i} className="flex items-center gap-1 mb-1 text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit">
                            <Building size={10} className="text-blue-500"/> {h}
                        </div>
                    ))
                ) : <span className="text-gray-400 italic">Belum diset</span>}
            </div>
        )},
        { header: 'Harga Mulai', accessor: 'base_price_quad', render: r => (
            <span className="font-mono text-blue-600 font-bold text-sm">{new Intl.NumberFormat('id-ID').format(r.base_price_quad)}</span>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${r.status==='active'?'bg-green-100 text-green-600':'bg-gray-100'}`}>{r.status}</span>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Master Paket</h1>
                    <p className="text-sm text-gray-500">Definisikan produk Umroh/Haji dan akomodasinya.</p>
                </div>
                <button onClick={() => { setMode('create'); setForm(initialForm); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Buat Paket Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={handleEditClick} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create'?"Buat Paket":"Edit Paket"}>
                <form onSubmit={handleSubmit}>
                    <div className="flex border-b mb-4 space-x-2 bg-gray-50 p-1 rounded-t-lg">
                        {[
                            {id: 'info', icon: Package, label: 'Info Dasar'},
                            {id: 'pricing', icon: DollarSign, label: 'Harga'},
                            {id: 'hotels', icon: Building, label: 'Hotel & Akomodasi'},
                            {id: 'itinerary', icon: List, label: 'Itinerary'}
                        ].map(tab => (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} 
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab===tab.id ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                <tab.icon size={14}/> {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'info' && (
                        <div className="space-y-4 animate-fade-in">
                            <div><label className="label">Nama Paket</label><input className="input-field font-medium" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required placeholder="Contoh: Umroh Turki Akhir Tahun" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Tipe Produk</label>
                                    <select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                                        <option value="umrah">Umroh Reguler</option><option value="umrah_plus">Umroh Plus</option><option value="haji">Haji</option><option value="tour">Wisata Halal</option>
                                    </select>
                                </div>
                                <div><label className="label">Durasi (Hari)</label><input type="number" className="input-field" value={form.duration_days} onChange={e=>setForm({...form, duration_days:e.target.value})}/></div>
                            </div>
                            <div><label className="label">Deskripsi</label><textarea className="input-field" rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}></textarea></div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-2 border border-blue-100">
                                Set harga dasar per paket. Harga ini akan menjadi default saat Anda membuat jadwal keberangkatan.
                            </div>
                            <div><label className="label">Harga Quad (1 Kamar 4 Orang)</label><input type="number" className="input-field" value={form.base_price_quad} onChange={e=>setForm({...form, base_price_quad:e.target.value})}/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Harga Triple (1 Kamar 3 Orang)</label><input type="number" className="input-field" value={form.base_price_triple} onChange={e=>setForm({...form, base_price_triple:e.target.value})}/></div>
                                <div><label className="label">Harga Double (1 Kamar 2 Orang)</label><input type="number" className="input-field" value={form.base_price_double} onChange={e=>setForm({...form, base_price_double:e.target.value})}/></div>
                            </div>
                            <div><label className="label">Uang Muka (DP) Minimal</label><input type="number" className="input-field" value={form.down_payment_amount} onChange={e=>setForm({...form, down_payment_amount:e.target.value})}/></div>
                        </div>
                    )}

                    {activeTab === 'hotels' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-700">Daftar Hotel</span>
                                <button type="button" onClick={addHotel} className="text-xs flex items-center gap-1 text-blue-600 font-bold hover:underline"><Plus size={14}/> Tambah Hotel</button>
                            </div>
                            
                            <div className="space-y-3">
                                {form.hotels.length === 0 && <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-400 text-sm">Belum ada hotel yang dipilih.</div>}
                                
                                {form.hotels.map((h, idx) => (
                                    <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded border border-gray-200">
                                        <div className="w-1/3">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Kota</label>
                                            <select className="input-field text-xs py-1" value={h.city_name} onChange={e=>updateHotel(idx, 'city_name', e.target.value)}>
                                                <option value="Makkah">Makkah</option><option value="Madinah">Madinah</option>
                                                <option value="Istanbul">Istanbul</option><option value="Dubai">Dubai</option>
                                                <option value="Cairo">Cairo</option><option value="Jeddah">Jeddah</option>
                                                <option value="Transit">Transit</option>
                                            </select>
                                        </div>
                                        <div className="w-1/2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Hotel</label>
                                            <select className="input-field text-xs py-1" value={h.hotel_id} onChange={e=>updateHotel(idx, 'hotel_id', e.target.value)}>
                                                <option value="">-- Pilih --</option>
                                                {/* Filter hotel yang sesuai kota saja, kecuali jika kota 'Transit' tampilkan semua */}
                                                {masterHotels
                                                    .filter(mh => h.city_name === 'Transit' || mh.city === h.city_name || h.city_name === 'Lainnya')
                                                    .map(mh => (
                                                    <option key={mh.id} value={mh.id}>{mh.name} ({mh.rating}*)</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-1/6">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Malam</label>
                                            <input type="number" className="input-field text-xs py-1" value={h.nights} onChange={e=>updateHotel(idx, 'nights', e.target.value)} />
                                        </div>
                                        <button type="button" onClick={() => removeHotel(idx)} className="mt-6 text-red-500 hover:text-red-700 bg-white p-1 rounded border border-gray-200 shadow-sm"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'itinerary' && (
                        <div className="space-y-4 animate-fade-in max-h-[400px] overflow-y-auto">
                             {form.itineraries?.map((item, idx) => (
                                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 relative bg-gray-50 rounded-r">
                                    <button type="button" onClick={()=>{
                                        const n=[...form.itineraries]; n.splice(idx,1); 
                                        setForm({...form, itineraries:n.map((x,i)=>({...x, day_number:i+1}))});
                                    }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                    
                                    <div className="font-bold text-xs text-blue-700 mb-1">HARI KE-{item.day_number}</div>
                                    <input className="input-field text-sm font-semibold mb-1" placeholder="Judul Kegiatan (Misal: Tiba di Jeddah)" value={item.title} onChange={e=>{
                                        const n=[...form.itineraries]; n[idx].title=e.target.value; setForm({...form, itineraries:n});
                                    }}/>
                                    <textarea className="input-field text-xs" rows="2" placeholder="Deskripsi detail..." value={item.description} onChange={e=>{
                                        const n=[...form.itineraries]; n[idx].description=e.target.value; setForm({...form, itineraries:n});
                                    }}></textarea>
                                </div>
                            ))}
                            <button type="button" onClick={()=>setForm(p=>({...p, itineraries:[...p.itineraries, {day_number:p.itineraries.length+1, title:'', description:'', location:''}]}))} className="btn-secondary w-full text-xs py-2"><Plus size={14}/> Tambah Hari</button>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="btn-primary px-6">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;