import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Package, Plus, Trash2, DollarSign, List, Building, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Packages = () => {
    // 1. Fetch Data Utama
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/packages');
    
    // 2. State Master Data (untuk Dropdown di Modal)
    const [hotelsMaster, setHotelsMaster] = useState([]);
    const [citiesMaster, setCitiesMaster] = useState([]);

    // 3. State UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // 4. Form State (Complex Object)
    const initialForm = {
        name: '', type: 'umrah', duration_days: 9, down_payment_amount: 5000000,
        description: '', status: 'active',
        prices: [{ room_type: 'Quad', capacity: 4, price: 0, currency: 'IDR' }], // Dynamic Prices
        hotels: [],
        itineraries: []
    };
    const [form, setForm] = useState(initialForm);

    // Fetch Master Data sekali saat komponen mount
    useEffect(() => {
        api.get('umh/v1/hotels').then(res => res.data.success && setHotelsMaster(res.data.data));
        api.get('umh/v1/cities').then(res => res.data.success && setCitiesMaster(res.data.data));
    }, []);

    // --- HANDLERS ---

    const handleEdit = async (item) => {
        setIsLoadingDetails(true);
        try {
            const res = await api.get(`umh/v1/packages/${item.uuid||item.id}/full`);
            if (res.data.success) {
                const d = res.data.data;
                setForm({
                    ...d,
                    prices: d.prices?.length ? d.prices : [{ room_type: 'Quad', capacity: 4, price: 0, currency: 'IDR' }],
                    hotels: d.hotels || [],
                    itineraries: d.itineraries || []
                });
                setActiveTab('info');
                setIsModalOpen(true);
            }
        } catch(e) { 
            toast.error("Gagal memuat detail paket"); 
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Validasi Sederhana
            if (!form.name) return toast.error("Nama paket wajib diisi");
            if (form.prices.some(p => p.price <= 0)) return toast.error("Harga paket tidak boleh 0");

            const endpoint = form.id ? `umh/v1/packages/${form.id}` : 'umh/v1/packages';
            const method = form.id ? 'put' : 'post';
            
            await api[method](endpoint, form);
            toast.success("Paket berhasil disimpan!");
            setIsModalOpen(false);
            fetchData();
        } catch(e) { 
            console.error(e);
            toast.error("Gagal menyimpan paket"); 
        }
    };

    // --- DYNAMIC FIELD HELPERS ---

    // Prices
    const addPrice = () => setForm({...form, prices: [...form.prices, {room_type:'', capacity:2, price:0, currency:'IDR'}]});
    const removePrice = (idx) => setForm({...form, prices: form.prices.filter((_,i)=>i!==idx)});
    const updatePrice = (idx, field, val) => {
        const newPrices = [...form.prices];
        newPrices[idx][field] = val;
        setForm({...form, prices: newPrices});
    };

    // Hotels
    const addHotel = () => setForm({...form, hotels: [...form.hotels, {hotel_id:'', city_name:'', nights:1}]});
    const removeHotel = (idx) => setForm({...form, hotels: form.hotels.filter((_,i)=>i!==idx)});
    const updateHotel = (idx, field, val) => {
        const newHotels = [...form.hotels];
        newHotels[idx][field] = val;
        // Auto fill city if hotel selected
        if (field === 'hotel_id') {
            const selectedHotel = hotelsMaster.find(h => h.id == val);
            if (selectedHotel) newHotels[idx]['city_name'] = selectedHotel.city;
        }
        setForm({...form, hotels: newHotels});
    };

    // Itineraries
    const addItinerary = () => setForm({...form, itineraries: [...form.itineraries, {day_number: form.itineraries.length+1, title:'', description:''}]});
    const removeItinerary = (idx) => setForm({...form, itineraries: form.itineraries.filter((_,i)=>i!==idx)});
    const updateItinerary = (idx, field, val) => {
        const newItin = [...form.itineraries];
        newItin[idx][field] = val;
        setForm({...form, itineraries: newItin});
    };

    // --- RENDER ---

    const cols = [
        { header: 'Nama Paket', accessor: 'name', render: r => <div><div className="font-bold text-gray-800">{r.name}</div><div className="text-xs text-gray-500">{r.duration_days} Hari - {r.type.toUpperCase()}</div></div> },
        { header: 'Harga Mulai', accessor: 'id', render: r => <span className="text-sm font-mono text-green-600">Cek Detail</span> },
        { header: 'Status', accessor: 'status', render: r => <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.status==='active'?'bg-green-100 text-green-700':'bg-gray-100'}`}>{r.status}</span> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Master Paket</h1>
                    <p className="text-sm text-gray-500">Kelola produk paket Umroh & Haji beserta varian harganya.</p>
                </div>
                <button onClick={()=>{setForm(initialForm); setIsModalOpen(true)}} className="btn-primary flex gap-2"><Plus size={18}/> Buat Paket Baru</button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <CrudTable columns={cols} data={data} loading={loading} onEdit={handleEdit} onDelete={deleteItem} />
            </div>

            {/* MODAL FULLSCREEN UNTUK PAKET */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                {form.id ? 'Edit Paket' : 'Buat Paket Baru'}
                            </h2>
                            <button onClick={()=>setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">Tutup</button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-b px-6 bg-gray-50">
                            {[
                                {id:'info',icon:Package,label:'Informasi Dasar'},
                                {id:'prices',icon:DollarSign,label:'Harga & Kamar'},
                                {id:'hotels',icon:Building,label:'Akomodasi'},
                                {id:'itinerary',icon:List,label:'Itinerary'}
                            ].map(t=> (
                                <button 
                                    key={t.id} 
                                    onClick={()=>setActiveTab(t.id)} 
                                    className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab===t.id?'border-blue-600 text-blue-600 bg-white':'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    <t.icon size={16}/> {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            
                            {/* TAB 1: INFO */}
                            {activeTab === 'info' && (
                                <div className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div><label className="label">Nama Paket</label><input className="input-field" placeholder="Contoh: Umroh Akbar Awal Ramadhan 2025" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div><label className="label">Jenis Paket</label><select className="input-field" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}><option value="umrah">Umroh Reguler</option><option value="umrah_plus">Umroh Plus</option><option value="haji">Haji Furoda/Plus</option><option value="tour">Halal Tour</option></select></div>
                                        <div><label className="label">Durasi (Hari)</label><input type="number" className="input-field" value={form.duration_days} onChange={e=>setForm({...form, duration_days:e.target.value})}/></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div><label className="label">Minimal DP (Rp)</label><input type="number" className="input-field" value={form.down_payment_amount} onChange={e=>setForm({...form, down_payment_amount:e.target.value})}/></div>
                                        <div><label className="label">Status</label><select className="input-field" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}><option value="active">Aktif (Dijual)</option><option value="archived">Arsip (Tidak Dijual)</option></select></div>
                                    </div>
                                    <div><label className="label">Deskripsi Lengkap</label><textarea className="input-field h-32" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/></div>
                                </div>
                            )}

                            {/* TAB 2: PRICES (DYNAMIC) */}
                            {activeTab === 'prices' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">Atur variasi harga berdasarkan tipe kamar (Quad, Triple, Double).</div>
                                        <button type="button" onClick={addPrice} className="btn-secondary text-xs flex gap-1"><Plus size={14}/> Tambah Varian</button>
                                    </div>
                                    {form.prices.map((p, i) => (
                                        <div key={i} className="flex gap-3 items-end bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
                                            <div className="flex-1">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase">Tipe Kamar</label>
                                                <input className="input-field" list="roomTypes" placeholder="Contoh: Quad" value={p.room_type} onChange={e=>updatePrice(i,'room_type',e.target.value)}/>
                                                <datalist id="roomTypes"><option value="Quad"/><option value="Triple"/><option value="Double"/><option value="Quint"/><option value="Suite"/></datalist>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase">Pax/Kamar</label>
                                                <input type="number" className="input-field" value={p.capacity} onChange={e=>updatePrice(i,'capacity',e.target.value)}/>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase">Harga (Rp)</label>
                                                <input type="number" className="input-field font-bold text-gray-800" value={p.price} onChange={e=>updatePrice(i,'price',e.target.value)}/>
                                            </div>
                                            <button type="button" onClick={()=>removePrice(i)} className="p-2.5 mb-0.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"><Trash2 size={18}/></button>
                                        </div>
                                    ))}
                                    {form.prices.length === 0 && <div className="text-center p-8 bg-white rounded-xl border border-dashed text-gray-400">Belum ada harga diatur.</div>}
                                </div>
                            )}

                            {/* TAB 3: HOTELS */}
                            {activeTab === 'hotels' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">Daftar hotel yang digunakan dalam paket ini.</div>
                                        <button type="button" onClick={addHotel} className="btn-secondary text-xs flex gap-1"><Plus size={14}/> Tambah Hotel</button>
                                    </div>
                                    {form.hotels.map((h, i) => (
                                        <div key={i} className="flex gap-3 items-end bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <div className="flex-[2]">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase">Pilih Hotel</label>
                                                <select className="input-field" value={h.hotel_id} onChange={e=>updateHotel(i,'hotel_id',e.target.value)}>
                                                    <option value="">-- Pilih Hotel --</option>
                                                    {hotelsMaster.map(hm => <option key={hm.id} value={hm.id}>{hm.name} ({hm.city} - {hm.rating}*)</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase">Kota</label>
                                                <input className="input-field bg-gray-50" readOnly value={h.city_name||''} placeholder="Auto"/>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase">Malam</label>
                                                <input type="number" className="input-field" value={h.nights} onChange={e=>updateHotel(i,'nights',e.target.value)}/>
                                            </div>
                                            <button type="button" onClick={()=>removeHotel(i)} className="p-2.5 mb-0.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TAB 4: ITINERARY */}
                            {activeTab === 'itinerary' && (
                                <div className="space-y-4">
                                     <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">Rencana perjalanan hari demi hari.</div>
                                        <button type="button" onClick={addItinerary} className="btn-secondary text-xs flex gap-1"><Plus size={14}/> Tambah Hari</button>
                                    </div>
                                    {form.itineraries.map((it, i) => (
                                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                                            <div className="w-16 pt-2 text-center">
                                                <div className="bg-blue-100 text-blue-700 font-bold rounded-lg py-1 text-sm">Hari {it.day_number}</div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <input className="input-field font-bold" placeholder="Judul Kegiatan (Misal: Tiba di Jeddah)" value={it.title} onChange={e=>updateItinerary(i,'title',e.target.value)}/>
                                                <textarea className="input-field text-sm min-h-[60px]" placeholder="Deskripsi detail kegiatan..." value={it.description} onChange={e=>updateItinerary(i,'description',e.target.value)}/>
                                            </div>
                                            <button type="button" onClick={()=>removeItinerary(i)} className="text-gray-400 hover:text-red-500 self-start"><Trash2 size={18}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t bg-white flex justify-end gap-3">
                            <button type="button" onClick={()=>setIsModalOpen(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">Batal</button>
                            <button type="button" onClick={handleSave} className="btn-primary px-8">Simpan Paket</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Packages;