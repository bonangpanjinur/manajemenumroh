import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { ShoppingCart, Plus, Calendar, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Bookings = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/bookings');
    
    const [departures, setDepartures] = useState([]); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    useEffect(() => {
        if (isModalOpen) {
            const loadDeps = async () => {
                try {
                    const res = await api.get('umh/v1/departures?status=open');
                    // SAFETY EXTRACTION
                    const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
                    setDepartures(list);
                } catch(e) { console.error(e); setDepartures([]); }
            };
            loadDeps();
        }
    }, [isModalOpen]);

    // Auto Calc
    useEffect(() => {
        if (form.departure_id && form.total_pax) {
            const selectedDep = departures.find(d => d.id == form.departure_id);
            if (selectedDep) {
                const unitPrice = selectedDep.price_quad || 0; 
                setForm(prev => ({ 
                    ...prev, 
                    total_price: unitPrice * prev.total_pax,
                    package_name: selectedDep.package_name 
                }));
            }
        }
    }, [form.departure_id, form.total_pax, departures]);

    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/bookings', form);
            else await api.put(`umh/v1/bookings/${form.id}`, form);
            
            toast.success("Booking berhasil disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan: " + e.message); }
    };

    const columns = [
        { header: 'Booking ID', accessor: 'booking_code', render: r => (
            <div>
                <span className="font-mono font-bold text-blue-600 tracking-wider block">{r.booking_code}</span>
                <span className="text-[10px] text-gray-400">{r.booking_date}</span>
            </div>
        )},
        { header: 'Pemesan', accessor: 'contact_name', render: r => (
            <div className="font-bold text-gray-800 text-sm">{r.contact_name}</div>
        )},
        { header: 'Produk Travel', accessor: 'package_info', render: r => (
            <div className="bg-gray-50 p-2 rounded border border-gray-100 text-xs">
                <div className="font-bold text-gray-700 mb-1">{r.package_name || 'N/A'}</div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1"><Calendar size={10}/> {r.departure_date}</span>
                    <span className="flex items-center gap-1"><UserCheck size={10}/> {r.total_pax} Pax</span>
                </div>
            </div>
        )},
        { header: 'Total', accessor: 'total_price', render: r => formatIDR(r.total_price) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-400 rounded-xl text-white shadow-md">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Booking & Reservasi</h1>
                        <p className="text-gray-500 text-sm">Pusat transaksi B2C & B2B (Agen).</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setForm({ booking_date: new Date().toISOString().split('T')[0], total_pax: 1, payment_status: 'unpaid' }); setMode('create'); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} /> Booking Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={(item) => deleteItem(item.id)} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Input Reservasi Baru" : "Edit Reservasi"}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-800 uppercase mb-3">Data Kontak Pemesan</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Nama Lengkap</label>
                                <input className="input-field" value={form.contact_name || ''} onChange={e => setForm({...form, contact_name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="label">No. Telepon / WA</label>
                                <input className="input-field" value={form.contact_phone || ''} onChange={e => setForm({...form, contact_phone: e.target.value})} required />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="label">Pilih Jadwal Keberangkatan</label>
                        <select className="input-field" value={form.departure_id || ''} onChange={e => setForm({...form, departure_id: e.target.value})} required>
                            <option value="">-- Cari Tanggal & Paket --</option>
                            {departures.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.departure_date} | {d.package_name} | Sisa {d.available_seats} Seat
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jumlah Pax (Jamaah)</label>
                            <input type="number" min="1" className="input-field" value={form.total_pax || 1} onChange={e => setForm({...form, total_pax: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Estimasi Total (Rp)</label>
                            <input type="number" className="input-field font-bold text-gray-800" value={form.total_price || 0} onChange={e => setForm({...form, total_price: e.target.value})} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-full sm:w-auto">Buat Reservasi</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Bookings;