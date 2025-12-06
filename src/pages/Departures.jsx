import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Calendar, Plane, Plus, Trash2, DollarSign, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const Departures = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/departures');
    
    // State Master Data
    const [packages, setPackages] = useState([]);
    const [airlines, setAirlines] = useState([]);
    
    // State UI & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const initialForm = {
        package_id: '', airline_id: '', departure_date: '', return_date: '',
        flight_number_depart: '', flight_number_return: '', quota: 45,
        status: 'open',
        prices: [] // Dynamic Prices Array
    };
    const [form, setForm] = useState(initialForm);

    // 1. Load Master Data (Paket & Maskapai)
    useEffect(() => {
        api.get('umh/v1/packages?per_page=100').then(res => res.data.success && setPackages(res.data.data));
        api.get('umh/v1/airlines?per_page=100').then(res => res.data.success && setAirlines(res.data.data));
    }, []);

    // 2. Handle Pilih Paket -> Auto Load Harga Default
    const handlePackageSelect = async (pkgId) => {
        setForm(prev => ({ ...prev, package_id: pkgId }));
        
        // Fetch detail paket (termasuk harga default)
        if (pkgId) {
            try {
                const res = await api.get(`umh/v1/packages/${pkgId}/full`);
                if (res.data.success && res.data.data.prices) {
                    setForm(prev => ({
                        ...prev,
                        // Salin harga dari paket ke form keberangkatan
                        prices: res.data.data.prices.map(p => ({
                            room_type: p.room_type,
                            capacity: p.capacity,
                            price: p.price
                        }))
                    }));
                }
            } catch (e) { console.error("Gagal load harga paket"); }
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
        } catch(e) { toast.error("Gagal load data"); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.package_id) return toast.error("Pilih Paket dulu");
        if (!form.airline_id) return toast.error("Pilih Maskapai dulu");
        if (form.prices.length === 0) return toast.error("Minimal ada 1 tipe harga");

        try {
            const endpoint = mode === 'edit' ? `umh/v1/departures/${form.id}` : 'umh/v1/departures';
            const method = mode === 'edit' ? 'put' : 'post';
            await api[method](endpoint, form);
            toast.success("Jadwal Tersimpan");
            setIsModalOpen(false);
            fetchData();
        } catch(e) { toast.error("Gagal simpan"); }
    };

    // Helper Pricing
    const updatePrice = (idx, field, val) => {
        const newPrices = [...form.prices];
        newPrices[idx][field] = val;
        setForm({...form, prices: newPrices});
    };
    const addPrice = () => setForm({...form, prices: [...form.prices, {room_type:'', capacity:2, price:0}]});
    const removePrice = (idx) => setForm({...form, prices: form.prices.filter((_,i)=>i!==idx)});

    const cols = [
        { header: 'Tanggal', accessor: 'departure_date', render: r => <div className="font-bold text-blue-600">{new Date(r.departure_date).toLocaleDateString('id-ID')}</div> },
        { header: 'Paket & Maskapai', accessor: 'package_name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.package_name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1"><Plane size={10}/> {r.airline_name} ({r.flight_number_depart})</div>
            </div>
        )},
        { header: 'Seat', accessor: 'quota', render: r => (
            <div>
                <span className="text-xs font-bold">{r.quota - r.available_seats} / {r.quota} Terisi</span>
                <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${((r.quota - r.available_seats)/r.quota)*100}%` }}></div>
                </div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => <span className="uppercase text-[10px] font-bold bg-gray-100 px-2 py-1 rounded">{r.status}</span> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Jadwal Keberangkatan</h1>
                    <p className="text-sm text-gray-500">Atur tanggal, maskapai, dan harga spesifik per tanggal.</p>
                </div>
                <button onClick={()=>{setForm(initialForm); setMode('create'); setIsModalOpen(true)}} className="btn-primary flex gap-2"><Plus size={18}/> Buat Jadwal</button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={cols} data={data} loading={loading} onEdit={handleEdit} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title={mode==='create'?"Jadwal Baru":"Edit Jadwal"}>
                <form onSubmit={handleSave} className="space-y-5">
                    
                    {/* INFO DASAR */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <div>
                            <label className="label">Pilih Paket Umroh/Haji</label>
                            <select className="input-field font-medium" value={form.package_id} onChange={e=>handlePackageSelect(e.target.value)} required>
                                <option value="">-- Pilih Paket --</option>
                                {packages.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration_days} Hari)</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Maskapai</label>
                                <select className="input-field" value={form.airline_id} onChange={e=>setForm({...form, airline_id:e.target.value})} required>
                                    <option value="">-- Pilih Maskapai --</option>
                                    {airlines.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">No. Penerbangan</label>
                                <input className="input-field" placeholder="SV-816" value={form.flight_number_depart} onChange={e=>setForm({...form, flight_number_depart:e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="label">Tgl Berangkat</label><input type="date" className="input-field" value={form.departure_date} onChange={e=>setForm({...form, departure_date:e.target.value})} required/></div>
                            <div><label className="label">Tgl Pulang</label><input type="date" className="input-field" value={form.return_date} onChange={e=>setForm({...form, return_date:e.target.value})} required/></div>
                            <div><label className="label">Kuota Seat</label><input type="number" className="input-field" value={form.quota} onChange={e=>setForm({...form, quota:e.target.value})}/></div>
                        </div>
                    </div>

                    {/* HARGA DINAMIS */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="label flex items-center gap-2"><DollarSign size={14}/> Harga & Tipe Kamar</label>
                            <button type="button" onClick={addPrice} className="text-xs text-blue-600 hover:underline font-bold flex gap-1"><Plus size={12}/> Tambah Tipe</button>
                        </div>
                        
                        {form.prices.length === 0 && <div className="text-center p-4 border border-dashed rounded text-sm text-gray-500">Belum ada harga. Pilih Paket untuk auto-load atau tambah manual.</div>}

                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {form.prices.map((p, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input className="input-field py-1.5 text-sm flex-1" placeholder="Tipe (Quad/Triple...)" value={p.room_type} onChange={e=>updatePrice(i,'room_type',e.target.value)} />
                                    <input className="input-field py-1.5 text-sm w-20 text-center" type="number" placeholder="Pax" value={p.capacity} onChange={e=>updatePrice(i,'capacity',e.target.value)} />
                                    <div className="relative flex-[1.5]">
                                        <span className="absolute left-3 top-1.5 text-gray-400 text-xs">Rp</span>
                                        <input className="input-field py-1.5 pl-8 text-sm font-mono" type="number" value={p.price} onChange={e=>updatePrice(i,'price',e.target.value)} />
                                    </div>
                                    <button type="button" onClick={()=>removePrice(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">*Harga ini spesifik untuk tanggal keberangkatan ini.</p>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button className="btn-primary w-full">Simpan Jadwal</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default Departures;