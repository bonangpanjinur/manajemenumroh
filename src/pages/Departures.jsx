import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import api from '../utils/api';
import { Calendar, Users, Plane, Plus, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const Departures = () => {
    const [data, setData] = useState([]);
    const [packages, setPackages] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    
    const initialForm = {
        package_id: '', departure_date: '', return_date: '',
        quota: 45, available_seats: 45,
        airline_id: '', flight_number_depart: '', flight_number_return: '',
        price_quad: 0, price_triple: 0, price_double: 0,
        status: 'open'
    };
    const [form, setForm] = useState(initialForm);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [depRes, pkgRes, airRes] = await Promise.all([
                api.get('umh/v1/departures/full'),
                api.get('umh/v1/packages'),
                api.get('umh/v1/airlines')
            ]);
            setData(depRes.data.data);
            setPackages(pkgRes.data.data || pkgRes.data);
            setAirlines(airRes.data.data || airRes.data);
        } catch (e) { toast.error("Gagal memuat data"); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // Auto-fill harga & tanggal saat paket dipilih
    const handlePackageChange = (pkgId) => {
        const pkg = packages.find(p => p.id == pkgId);
        if (pkg) {
            setForm(prev => ({
                ...prev,
                package_id: pkgId,
                price_quad: pkg.base_price_quad,
                price_triple: pkg.base_price_triple,
                price_double: pkg.base_price_double,
                // Bisa tambahkan logika hitung return_date otomatis berdasarkan duration_days
            }));
        } else {
            setForm(prev => ({ ...prev, package_id: pkgId }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/departures', form);
            else await api.put(`umh/v1/departures/${form.id}`, form);
            
            toast.success("Jadwal tersimpan!");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal menyimpan jadwal"); }
    };

    const handleDelete = async (id) => {
        if(!confirm("Hapus jadwal ini?")) return;
        try { await api.delete(`umh/v1/departures/${id}`); fetchData(); toast.success("Terhapus"); } 
        catch (e) { toast.error("Gagal menghapus"); }
    };

    const columns = [
        { header: 'Tanggal', accessor: 'departure_date', render: r => (
            <div>
                <div className="font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500"/> 
                    {new Date(r.departure_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kembali: {r.return_date}</div>
            </div>
        )},
        { header: 'Paket & Maskapai', accessor: 'package_name', render: r => (
            <div>
                <div className="font-bold text-blue-700">{r.package_name || 'Paket dihapus'}</div>
                <div className="text-xs flex items-center gap-1 mt-1 text-gray-600">
                    <Plane size={10}/> {r.flight_number_depart || '-'}
                </div>
            </div>
        )},
        { header: 'Seat', accessor: 'quota', render: r => {
            const percentage = (r.available_seats / r.quota) * 100;
            let color = 'bg-green-500';
            if(percentage < 20) color = 'bg-red-500';
            else if(percentage < 50) color = 'bg-yellow-500';
            
            return (
                <div className="w-24">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold">{r.available_seats} Avail</span>
                        <span className="text-gray-400">/ {r.quota}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{width: `${percentage}%`}}></div>
                    </div>
                </div>
            )
        }},
        { header: 'Harga', accessor: 'price_quad', render: r => (
            <div className="font-mono text-sm">
                Rp {new Intl.NumberFormat('id-ID').format(r.price_quad)} <span className="text-xs text-gray-400">(Quad)</span>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => <span className="uppercase text-[10px] font-bold bg-gray-100 px-2 py-1 rounded">{r.status}</span> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Jadwal Keberangkatan</h1>
                    <p className="text-gray-500 text-sm">Atur tanggal keberangkatan, seat, dan harga final per batch.</p>
                </div>
                <button onClick={() => { setMode('create'); setForm(initialForm); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Buat Jadwal
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={(item) => { setMode('edit'); setForm(item); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create'?"Jadwal Baru":"Edit Jadwal"} size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Section 1: Paket & Tanggal */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><Package size={16}/> Informasi Dasar</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="label">Pilih Paket</label>
                                <select className="input-field" value={form.package_id} onChange={e=>handlePackageChange(e.target.value)} required disabled={mode==='edit'}>
                                    <option value="">-- Pilih Paket --</option>
                                    {packages.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration_days} Hari)</option>)}
                                </select>
                            </div>
                            <div><label className="label">Tanggal Berangkat</label><input type="date" className="input-field" value={form.departure_date} onChange={e=>setForm({...form, departure_date:e.target.value})} required/></div>
                            <div><label className="label">Tanggal Pulang</label><input type="date" className="input-field" value={form.return_date} onChange={e=>setForm({...form, return_date:e.target.value})} required/></div>
                        </div>
                    </div>

                    {/* Section 2: Seat & Penerbangan */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Users size={16}/> Kuota Seat</h4>
                            <div><label className="label">Total Seat (Quota)</label><input type="number" className="input-field font-bold text-lg" value={form.quota} onChange={e=>setForm({...form, quota:e.target.value, available_seats:e.target.value})} required/></div>
                            <div className="mt-2 text-xs text-gray-500">Available seats akan diset sama dengan quota untuk jadwal baru.</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Plane size={16}/> Penerbangan</h4>
                            <div className="space-y-2">
                                <select className="input-field text-sm" value={form.airline_id} onChange={e=>setForm({...form, airline_id:e.target.value})}>
                                    <option value="">-- Pilih Maskapai --</option>
                                    {airlines.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                                </select>
                                <input placeholder="No Flight (Depart)" className="input-field text-sm" value={form.flight_number_depart} onChange={e=>setForm({...form, flight_number_depart:e.target.value})}/>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Harga Final */}
                    <div>
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><DollarSign size={16}/> Harga Final (Per Tanggal Ini)</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="label">Quad</label><input type="number" className="input-field font-mono" value={form.price_quad} onChange={e=>setForm({...form, price_quad:e.target.value})}/></div>
                            <div><label className="label">Triple</label><input type="number" className="input-field font-mono" value={form.price_triple} onChange={e=>setForm({...form, price_triple:e.target.value})}/></div>
                            <div><label className="label">Double</label><input type="number" className="input-field font-mono" value={form.price_double} onChange={e=>setForm({...form, price_double:e.target.value})}/></div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary px-8">Simpan Jadwal</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Departures;