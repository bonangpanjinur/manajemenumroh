import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { PlaneTakeoff, Plus, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Departures = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/departures');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/departures', form);
            else await api.put(`umh/v1/departures/${form.id}`, form);
            
            toast.success("Jadwal disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan"); }
    };

    const columns = [
        { header: 'Tanggal', accessor: 'departure_date', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.departure_date}</div>
                <div className="text-xs text-gray-500">Pulang: {r.return_date || '-'}</div>
            </div>
        )},
        { header: 'Program', accessor: 'package_name' },
        { header: 'Maskapai', accessor: 'airline_name', render: r => <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{r.airline_name || 'TBA'}</span> },
        { header: 'Kuota', accessor: 'quota', render: r => (
            <div className="text-sm">
                <span className="font-bold">{r.available_seats}</span> / {r.quota} Seat
                <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${((r.quota - r.available_seats) / r.quota) * 100}%` }}></div>
                </div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => <span className={`uppercase text-xs font-bold px-2 py-1 rounded ${r.status==='open'?'bg-green-100 text-green-700':'bg-gray-100'}`}>{r.status}</span> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                        <PlaneTakeoff size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Jadwal Keberangkatan</h1>
                        <p className="text-gray-500 text-sm">Atur tanggal, kuota, dan manifest penerbangan.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setForm({ departure_date: '', return_date: '', quota: 45, status: 'open' }); setMode('create'); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Tambah Jadwal
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={(item)=>deleteItem(item.id)} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Buat Jadwal Baru" : "Edit Jadwal"}>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    
                    <div>
                        <label className="label">Pilih Paket Program</label>
                        <select className="input-field" value={form.package_id || ''} onChange={e => setForm({...form, package_id: e.target.value})}>
                            <option value="">-- Pilih Paket --</option>
                            <option value="1">Umroh Reguler 9 Hari</option>
                            <option value="2">Umroh Plus Turki</option>
                            {/* Nanti ini bisa di-fetch dari API packages */}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Total Kuota Seat</label>
                            <input type="number" className="input-field" value={form.quota || 45} onChange={e => setForm({...form, quota: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input-field" value={form.status || 'open'} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="open">Open (Buka)</option>
                                <option value="closed">Closed (Tutup)</option>
                                <option value="departed">Berangkat</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Nama Tour Leader</label>
                        <input type="text" className="input-field" value={form.tour_leader_name || ''} onChange={e => setForm({...form, tour_leader_name: e.target.value})} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Departures;