import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Calendar, Plane, Plus, Trash2, DollarSign, User, Flag, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Departures = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/departures');
    
    // Master Data States
    const [packages, setPackages] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [mutawifs, setMutawifs] = useState([]);
    const [jamaahList, setJamaahList] = useState([]); // Calon Tour Leader (dari data Jemaah)
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [isLoadingPrices, setIsLoadingPrices] = useState(false);

    const initialForm = {
        package_id: '', airline_id: '', 
        departure_date: '', return_date: '',
        flight_number_depart: '', flight_number_return: '', 
        quota: 45, status: 'open',
        mutawif_id: '', tour_leader_id: '',
        prices: [] // Array Harga Dinamis
    };
    const [form, setForm] = useState(initialForm);

    // Load semua master data yang diperlukan saat komponen mount
    useEffect(() => {
        const loadMasters = async () => {
            try {
                const [p, a, m, j] = await Promise.all([
                    api.get('umh/v1/packages?per_page=100'),
                    api.get('umh/v1/airlines?per_page=100'),
                    api.get('umh/v1/mutawifs?per_page=100'),
                    api.get('umh/v1/jamaah?per_page=200') // Ambil 200 jemaah terakhir utk opsi TL
                ]);
                setPackages(p.data.data || []);
                setAirlines(a.data.data || []);
                setMutawifs(m.data.data || []);
                setJamaahList(j.data.data || []);
            } catch (e) { console.error("Gagal load master data", e); }
        };
        loadMasters();
    }, []);

    // Handle saat Paket dipilih -> Otomatis tarik harga default paket tersebut
    const handlePackageSelect = async (pkgId) => {
        setForm(prev => ({ ...prev, package_id: pkgId }));
        if (pkgId) {
            setIsLoadingPrices(true);
            try {
                const res = await api.get(`umh/v1/packages/${pkgId}/full`);
                if (res.data.success && res.data.data.prices) {
                    setForm(prev => ({
                        ...prev,
                        // Copy harga paket ke harga keberangkatan (sebagai draft awal)
                        prices: res.data.data.prices.map(p => ({ 
                            room_type: p.room_type, 
                            capacity: p.capacity, 
                            price: p.price 
                        }))
                    }));
                }
            } catch (e) { toast.error("Gagal menarik harga paket"); }
            finally { setIsLoadingPrices(false); }
        }
    };

    const handleEdit = async (item) => {
        try {
            const res = await api.get(`umh/v1/departures/${item.uuid||item.id}/full`);
            if (res.data.success) {
                setForm(res.data.data);
                setMode('edit');
                setIsModalOpen(true);
            }
        } catch(e) { toast.error("Gagal load detail jadwal"); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Validasi Sederhana
            if(form.prices.length === 0) return toast.error("Mohon isi minimal 1 tipe harga");
            if(form.prices.some(p => p.price <= 0)) return toast.error("Harga tidak boleh 0");

            const endpoint = mode === 'edit' ? `umh/v1/departures/${form.id}` : 'umh/v1/departures';
            const method = mode === 'edit' ? 'put' : 'post';
            await api[method](endpoint, form);
            
            toast.success("Jadwal Keberangkatan Disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch(e) { toast.error("Gagal simpan: " + e.message); }
    };

    // --- Dynamic Pricing Helpers ---
    const updatePrice = (idx, field, val) => {
        const newPrices = [...form.prices]; newPrices[idx][field] = val; setForm({...form, prices: newPrices});
    };
    const addPrice = () => setForm({...form, prices: [...form.prices, {room_type:'', capacity:2, price:0}]});
    const removePrice = (idx) => setForm({...form, prices: form.prices.filter((_,i)=>i!==idx)});

    // Format Tanggal
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : '-';

    const cols = [
        { header: 'Tanggal', accessor: 'departure_date', render: r => (
            <div>
                <div className="font-bold text-blue-600">{fmtDate(r.departure_date)}</div>
                <div className="text-xs text-gray-500">Pulang: {fmtDate(r.return_date)}</div>
            </div>
        )},
        { header: 'Paket & Pesawat', accessor: 'package_name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.package_name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Plane size={10}/> {r.airline_name} <span className="bg-gray-100 px-1 rounded font-mono">{r.flight_number_depart}</span>
                </div>
            </div>
        )},
        { header: 'Tim Lapangan', accessor: 'id', render: r => (
            <div className="text-xs space-y-1">
                <div className="flex items-center gap-1 text-gray-700">
                    <User size={10} className="text-purple-600"/> 
                    {r.muthawif_name ? <span className="font-medium">{r.muthawif_name}</span> : <span className="text-gray-400 italic">Belum ada Muthawif</span>}
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                    <Flag size={10} className="text-orange-600"/> 
                    {r.tour_leader_name ? <span>TL: {r.tour_leader_name}</span> : <span className="text-gray-400 italic">Belum ada TL</span>}
                </div>
            </div>
        )},
        { header: 'Kuota', accessor: 'quota', render: r => (
            <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                    <span>{r.quota - r.available_seats} Pax</span>
                    <span className="text-gray-400">Total {r.quota}</span>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${((r.quota - r.available_seats)/r.quota)*100}%` }}></div>
                </div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => <span className={`uppercase text-[10px] font-bold px-2 py-1 rounded ${r.status==='open'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{r.status}</span> }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Jadwal Keberangkatan</h1>
                    <p className="text-sm text-gray-500">Atur tanggal, tim bertugas, dan harga spesifik.</p>
                </div>
                <button onClick={()=>{setForm(initialForm); setMode('create'); setIsModalOpen(true)}} className="btn-primary flex gap-2"><Plus size={18}/> Buat Jadwal</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={cols} data={data} loading={loading} onEdit={handleEdit} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title={mode==='create'?"Buat Jadwal Baru":"Edit Jadwal"}>
                <form onSubmit={handleSave} className="space-y-6">
                    
                    {/* SECTION 1: PAKET & PENERBANGAN */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Plane size={12}/> Paket & Penerbangan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="label">Pilih Paket</label>
                                <select className="input-field" value={form.package_id} onChange={e=>handlePackageSelect(e.target.value)} required disabled={mode==='edit'}>
                                    <option value="">-- Pilih Paket --</option>
                                    {packages.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration_days} Hari)</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="label">Maskapai</label>
                                <select className="input-field" value={form.airline_id} onChange={e=>setForm({...form, airline_id:e.target.value})} required>
                                    <option value="">-- Pilih Maskapai --</option>
                                    {airlines.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                                </select>
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">No. Flight Berangkat</label><input className="input-field" placeholder="cth: GA-980" value={form.flight_number_depart} onChange={e=>setForm({...form, flight_number_depart:e.target.value})}/></div>
                            <div><label className="label">No. Flight Pulang</label><input className="input-field" placeholder="cth: GA-981" value={form.flight_number_return} onChange={e=>setForm({...form, flight_number_return:e.target.value})}/></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="label">Tgl Berangkat</label><input type="date" className="input-field" value={form.departure_date} onChange={e=>setForm({...form, departure_date:e.target.value})} required/></div>
                            <div><label className="label">Tgl Pulang</label><input type="date" className="input-field" value={form.return_date} onChange={e=>setForm({...form, return_date:e.target.value})} required/></div>
                            <div><label className="label">Kuota Seat</label><input type="number" className="input-field" value={form.quota} onChange={e=>setForm({...form, quota:e.target.value})}/></div>
                        </div>
                    </div>

                    {/* SECTION 2: TIM BERTUGAS (MUTHAWIF & TL) */}
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 space-y-4">
                        <h4 className="text-xs font-bold text-yellow-800 uppercase flex items-center gap-2"><Users size={12}/> Tim Operasional</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Muthawif (Ustadz)</label>
                                <select className="input-field bg-white" value={form.mutawif_id} onChange={e=>setForm({...form, mutawif_id:e.target.value})}>
                                    <option value="">-- Belum Ditentukan --</option>
                                    {mutawifs.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Tour Leader (Ketua)</label>
                                <input className="input-field bg-white" list="tl_list" placeholder="Cari nama jemaah..." value={form.tour_leader_id} onChange={e=>setForm({...form, tour_leader_id:e.target.value})}/>
                                <datalist id="tl_list">
                                    {jamaahList.map(j=><option key={j.id} value={j.id}>{j.full_name} - {j.passport_number}</option>)}
                                </datalist>
                                <p className="text-[10px] text-gray-500 mt-1">*Input ID Jemaah yang ditunjuk sebagai TL</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: HARGA DINAMIS */}
                    <div className="border rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="label flex items-center gap-2 m-0 text-blue-800"><DollarSign size={16}/> Harga Jual (Per Pax)</label>
                            <button type="button" onClick={addPrice} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-bold flex gap-1 items-center transition-colors"><Plus size={12}/> Tambah Tipe</button>
                        </div>
                        
                        {isLoadingPrices && <div className="text-center text-xs text-gray-400 py-2">Mengambil harga paket...</div>}
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                            {form.prices.length === 0 && !isLoadingPrices && <div className="text-center text-xs text-red-400 italic p-2 bg-red-50 rounded">Belum ada harga diatur.</div>}
                            
                            {form.prices.map((p, i) => (
                                <div key={i} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Tipe Kamar</label>
                                        <input className="input-field py-1 text-sm h-8" placeholder="Quad/Triple" value={p.room_type} onChange={e=>updatePrice(i,'room_type',e.target.value)} />
                                    </div>
                                    <div className="w-20">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Pax</label>
                                        <input className="input-field py-1 text-sm h-8 text-center" type="number" value={p.capacity} onChange={e=>updatePrice(i,'capacity',e.target.value)} />
                                    </div>
                                    <div className="flex-[1.5] relative">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Harga (IDR)</label>
                                        <input className="input-field py-1 text-sm h-8 font-mono font-bold" type="number" value={p.price} onChange={e=>updatePrice(i,'price',e.target.value)} />
                                    </div>
                                    <div className="pt-4">
                                        <button type="button" onClick={()=>removePrice(i)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button className="btn-primary px-8">Simpan Jadwal</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default Departures;