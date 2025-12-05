import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Calendar, Plane, Users, CheckCircle, AlertCircle, Plus, UserCheck, Filter, ArrowRight, BedDouble } from 'lucide-react';
import toast from 'react-hot-toast';
import RoomingManager from './RoomingManager'; // Import komponen baru

const Departures = () => {
    // ... (State lama tetap sama: packages, airlines, jamaahList, isModalOpen, dll) ...
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/departures');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [packages, setPackages] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [jamaahList, setJamaahList] = useState([]);
    const [selectedPackageFilter, setSelectedPackageFilter] = useState('');
    
    // STATE BARU: Untuk Rooming Manager
    const [selectedDepartureForRooming, setSelectedDepartureForRooming] = useState(null);

    const initialForm = {
        package_id: '', airline_id: '', departure_date: '', return_date: '',
        flight_number_depart: '', flight_number_return: '', quota: 45,
        price_quad: 0, price_triple: 0, price_double: 0, status: 'open',
        tour_leader_name: '', muthawif_name: ''     
    };
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        const loadMasters = async () => {
             // ... (Fetch logic sama seperti sebelumnya) ...
             try {
                const [pkgRes, airRes, jamRes] = await Promise.all([
                    api.get('umh/v1/packages?per_page=100'),
                    api.get('umh/v1/airlines?per_page=100'),
                    api.get('umh/v1/jamaah?per_page=100')
                ]);
                setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : (pkgRes.data.data || []));
                setAirlines(Array.isArray(airRes.data) ? airRes.data : (airRes.data.data || []));
                setJamaahList(Array.isArray(jamRes.data) ? jamRes.data : (jamRes.data.data || []));
            } catch(e) { console.error("Error loading masters", e); }
        };
        loadMasters();
    }, []);

    const filteredData = selectedPackageFilter ? data.filter(item => item.package_id == selectedPackageFilter) : data;

    const handleEditClick = (item) => { setForm(item); setMode('edit'); setIsModalOpen(true); };
    
    // ... (handleSubmit, handlePackageSelect, handleDateChange sama) ...
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/departures', form);
            else await api.put(`umh/v1/departures/${form.uuid || form.id}`, form);
            toast.success("Data tersimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };
    
    const handlePackageSelect = (pkgId) => {
        const pkg = packages.find(p => p.id == pkgId);
        if(pkg) setForm(prev => ({ ...prev, package_id: pkgId, price_quad: pkg.base_price_quad, price_triple: pkg.base_price_triple, price_double: pkg.base_price_double }));
    };

    const handleDateChange = (date) => {
        const d = new Date(date);
        const pkg = packages.find(p => p.id == form.package_id);
        const duration = pkg ? parseInt(pkg.duration_days) : 9;
        d.setDate(d.getDate() + duration); 
        setForm({ ...form, departure_date: date, return_date: form.return_date || d.toISOString().split('T')[0] });
    }

    const columns = [
        { header: 'Tanggal', accessor: 'departure_date', render: r => (
            <div className="flex flex-col border-l-2 border-blue-500 pl-2">
                <span className="font-bold text-gray-800 text-sm">{new Date(r.departure_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                <span className="text-[10px] text-gray-500">Flight: {r.flight_number_depart}</span>
            </div>
        )},
        { header: 'Paket', accessor: 'package_name', render: r => (
            <div className="font-bold text-blue-900 text-sm">{r.package_name || '-'}</div>
        )},
        { header: 'Seat', accessor: 'quota', render: r => {
            const filled = r.quota - r.available_seats;
            const percent = Math.round((filled / r.quota) * 100);
            return (
                <div className="w-24">
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="font-bold">{filled} Pax</span>
                        <span className="text-gray-500">/ {r.quota}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${percent > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }}></div></div>
                </div>
            );
        }},
        // Action Button Custom untuk Rooming
        { header: 'Ops', accessor: 'id', render: r => (
            <button 
                onClick={(e) => { e.stopPropagation(); setSelectedDepartureForRooming(r); }}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold hover:bg-purple-200 flex items-center gap-1"
            >
                <BedDouble size={14}/> Atur Kamar
            </button>
        )}
    ];

    // JIKA MODE ROOMING AKTIF, TAMPILKAN KOMPONEN FULL SCREEN
    if (selectedDepartureForRooming) {
        return (
            <RoomingManager 
                departureId={selectedDepartureForRooming.id} 
                departureInfo={selectedDepartureForRooming}
                onClose={() => setSelectedDepartureForRooming(null)} 
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h1 className="text-2xl font-bold text-gray-800">Kalender Keberangkatan</h1><p className="text-gray-500 text-sm">Kelola jadwal, flight, dan pembagian kamar.</p></div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="px-3 py-2 border rounded text-sm bg-white" value={selectedPackageFilter} onChange={(e) => setSelectedPackageFilter(e.target.value)}>
                        <option value="">Semua Paket</option>
                        {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={() => { setForm(initialForm); if(selectedPackageFilter) handlePackageSelect(selectedPackageFilter); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus size={18}/> Buat Jadwal</button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable columns={columns} data={filteredData} loading={loading} onEdit={handleEditClick} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Jadwal" : "Edit Jadwal"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="mb-3">
                            <label className="label text-xs uppercase text-gray-500">Paket Produk</label>
                            <select className="input-field" value={form.package_id} onChange={e => handlePackageSelect(e.target.value)} required>
                                <option value="">-- Pilih Paket --</option>
                                {packages.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration_days} Hari)</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="label text-xs uppercase text-gray-500">Maskapai</label>
                                <select className="input-field" value={form.airline_id} onChange={e => setForm({...form, airline_id: e.target.value})} required>
                                    <option value="">-- Pilih --</option>
                                    {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label text-xs uppercase text-gray-500">No. Penerbangan</label>
                                <input className="input-field" placeholder="Contoh: SV-819" value={form.flight_number_depart} onChange={e => setForm({...form, flight_number_depart: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    {/* ... (Sisa form sama seperti kode sebelumnya: Tanggal, Harga, Kuota, Operasional) ... */}
                    {/* Saya singkat agar tidak duplikat panjang, isinya sama persis dengan kode Departures.jsx sebelumnya */}
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Tanggal Berangkat</label><input type="date" className="input-field" value={form.departure_date} onChange={e => handleDateChange(e.target.value)} required /></div>
                        <div><label className="label">Tanggal Pulang</label><input type="date" className="input-field" value={form.return_date} onChange={e => setForm({...form, return_date: e.target.value})} required /></div>
                    </div>
                    <div className="border border-blue-100 rounded-lg overflow-hidden">
                        <div className="bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 uppercase flex justify-between items-center">
                            <span>Harga & Seat</span>
                            <span className="text-[10px] font-normal normal-case text-blue-600">Harga default diambil dari paket</span>
                        </div>
                        <div className="p-3 grid grid-cols-3 gap-3">
                            <div><label className="label text-[10px]">Quad (4)</label><input type="number" className="input-field text-xs" value={form.price_quad} onChange={e => setForm({...form, price_quad: e.target.value})} /></div>
                            <div><label className="label text-[10px]">Triple (3)</label><input type="number" className="input-field text-xs" value={form.price_triple} onChange={e => setForm({...form, price_triple: e.target.value})} /></div>
                            <div><label className="label text-[10px]">Double (2)</label><input type="number" className="input-field text-xs" value={form.price_double} onChange={e => setForm({...form, price_double: e.target.value})} /></div>
                        </div>
                        <div className="px-3 pb-3"><label className="label text-xs">Total Kuota Seat</label><input type="number" className="input-field font-bold text-gray-700" value={form.quota} onChange={e => setForm({...form, quota: e.target.value})} /></div>
                    </div>
                    <div className="border border-yellow-100 rounded-lg overflow-hidden">
                        <div className="bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-800 uppercase">Tim Operasional Lapangan</div>
                        <div className="p-3 grid grid-cols-2 gap-3">
                             <div>
                                <label className="label text-[10px]">Tour Leader</label>
                                <input className="input-field text-sm" list="jamaah_list" placeholder="Cari nama..." value={form.tour_leader_name} onChange={e => setForm({...form, tour_leader_name: e.target.value})} />
                                <datalist id="jamaah_list">{jamaahList.map(j => <option key={j.id} value={j.full_name}>{j.passport_number}</option>)}</datalist>
                            </div>
                            <div><label className="label text-[10px]">Muthawif</label><input className="input-field text-sm" placeholder="Nama Muthawif" value={form.muthawif_name} onChange={e => setForm({...form, muthawif_name: e.target.value})} /></div>
                        </div>
                    </div>
                    <div><label className="label">Status</label><select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="open">Open (Buka Pendaftaran)</option><option value="closed">Closed (Penuh/Tutup)</option><option value="departed">Departed (Berangkat)</option><option value="completed">Completed (Selesai)</option><option value="cancelled">Cancelled (Batal)</option></select></div>
                    <div className="flex justify-end gap-2 pt-2"><button type="submit" className="btn-primary w-full">Simpan Jadwal</button></div>
                </form>
            </Modal>
        </div>
    );
};

export default Departures;