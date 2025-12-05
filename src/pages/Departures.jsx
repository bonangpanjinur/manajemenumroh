import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { PlaneTakeoff, Plus, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Departures = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/departures');
    
    // State Relasi (Default Array Kosong)
    const [packages, setPackages] = useState([]);
    const [airlines, setAirlines] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    // Fetch Referensi
    useEffect(() => {
        if(isModalOpen) {
            const loadRefs = async () => {
                try {
                    const [pkgRes, airlineRes] = await Promise.all([
                        api.get('umh/v1/packages'),
                        api.get('umh/v1/masters/airlines')
                    ]);
                    // Extraction logic yang aman
                    setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : (pkgRes.data.data || []));
                    setAirlines(Array.isArray(airlineRes.data) ? airlineRes.data : (airlineRes.data.data || []));
                } catch(e) { console.error(e); }
            };
            loadRefs();
        }
    }, [isModalOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/departures', form);
            else await api.put(`umh/v1/departures/${form.id}`, form);
            
            toast.success("Jadwal keberangkatan disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan: " + e.message); }
    };

    const columns = [
        { header: 'Tanggal', accessor: 'departure_date', render: r => (
            <div className="flex flex-col justify-center h-full">
                <span className="font-bold text-gray-800 text-sm flex items-center gap-2"><Calendar size={14}/> {r.departure_date}</span>
                <span className="text-xs text-gray-500 ml-6">Pulang: {r.return_date}</span>
            </div>
        )},
        { header: 'Paket & Maskapai', accessor: 'package_name', render: r => (
            <div>
                <div className="font-bold text-blue-700 text-sm">{r.package_name || 'Tanpa Paket'}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <PlaneTakeoff size={12}/> {r.airline_name || 'TBA'} ({r.flight_number_depart || '-'})
                </div>
            </div>
        )},
        { header: 'Status Seat', accessor: 'quota', render: r => {
            const filled = r.quota - (r.available_seats || r.quota);
            const percent = Math.min((filled / r.quota) * 100, 100);
            return (
                <div className="w-32">
                    <div className="flex justify-between text-[10px] mb-1 font-medium">
                        <span className="text-green-700">{r.available_seats} Sisa</span>
                        <span className="text-gray-400">Total {r.quota}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                        <div className={`h-full ${percent > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }}></div>
                    </div>
                </div>
            )
        }},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`uppercase text-[10px] font-extrabold px-2 py-1 rounded border ${r.status==='open'?'bg-green-50 text-green-700 border-green-200':'bg-gray-50 border-gray-200'}`}>{r.status}</span>
        )},
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl text-white shadow-md">
                        <PlaneTakeoff size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manajemen Keberangkatan</h1>
                        <p className="text-gray-500 text-sm">Atur tanggal, kuota, dan manifest penerbangan.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setForm({ quota: 45, status: 'open', available_seats: 45 }); setMode('create'); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <Plus size={18} /> Tambah Jadwal
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={(item)=>deleteItem(item.id)} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Buat Jadwal Baru" : "Edit Jadwal"}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tanggal Berangkat</label>
                            <input type="date" className="input-field" value={form.departure_date || ''} onChange={e => setForm({...form, departure_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="label">Tanggal Pulang</label>
                            <input type="date" className="input-field" value={form.return_date || ''} onChange={e => setForm({...form, return_date: e.target.value})} required />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                        <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase border-b border-blue-200 pb-2">
                            <AlertCircle size={14}/> Relasi Produk
                        </div>
                        <div>
                            <label className="label">Pilih Paket Umroh/Haji</label>
                            <select className="input-field" value={form.package_id || ''} onChange={e => setForm({...form, package_id: e.target.value})} required>
                                <option value="">-- Pilih Paket Katalog --</option>
                                {packages.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.duration_days} Hari)</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Maskapai</label>
                                <select className="input-field" value={form.airline_id || ''} onChange={e => setForm({...form, airline_id: e.target.value})}>
                                    <option value="">-- Pilih Maskapai --</option>
                                    {airlines.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">No. Penerbangan</label>
                                <input className="input-field" value={form.flight_number_depart || ''} onChange={e => setForm({...form, flight_number_depart: e.target.value})} placeholder="Ex: SV-819" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="label">Total Kuota Seat</label>
                            <input type="number" className="input-field font-bold" value={form.quota || 45} onChange={e => setForm({...form, quota: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className="label">Status Penjualan</label>
                            <select className="input-field" value={form.status || 'open'} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="open">🟢 Open Seat</option>
                                <option value="closed">🔴 Closed / Full</option>
                                <option value="waitlist">🟠 Waitlist</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Jadwal</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Departures;