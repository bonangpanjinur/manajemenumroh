import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Calendar, Plane, Hotel } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Departures = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/departures');
    
    // Master Paket untuk Dropdown
    const [packages, setPackages] = useState([]);

    useEffect(() => {
        fetchData();
        api.get('umh/v1/packages').then(res => setPackages(res.data || [])).catch(console.error);
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    
    const initialForm = {
        package_id: '',
        departure_date: '', return_date: '',
        seat_quota: 45,
        flight_number_depart: '', flight_number_return: '',
        // Override Harga (Opsional)
        price_quad: '', price_triple: '', price_double: ''
    };
    const [formData, setFormData] = useState(initialForm);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await api.post('umh/v1/departures', formData);
            } else {
                toast.error("Edit jadwal belum didukung penuh, hapus dan buat baru.");
                return;
            }
            toast.success("Jadwal berhasil dibuat");
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Gagal: " + err.message);
        }
    };

    const columns = [
        { header: 'Tanggal', accessor: 'departure_date', render: r => (
            <div>
                <div className="font-bold flex items-center gap-2"><Calendar size={14}/> {formatDate(r.departure_date)}</div>
                <div className="text-xs text-gray-500">Pulang: {formatDate(r.return_date)}</div>
            </div>
        )},
        { header: 'Paket', accessor: 'package_name', render: r => <span className="font-medium text-blue-600">{r.package_name}</span> },
        { header: 'Penerbangan', accessor: 'flight_number_depart', render: r => (
            <div className="text-xs">
                <div>Pergi: {r.flight_number_depart || '-'}</div>
                <div>Pulang: {r.flight_number_return || '-'}</div>
            </div>
        )},
        { header: 'Seat', accessor: 'seat_quota', render: r => (
            <div className="text-center">
                <div className="font-bold text-lg">{r.available_seats}</div>
                <div className="text-[10px] text-gray-400">dari {r.seat_quota}</div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold ${r.status==='open'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>
                {r.status.toUpperCase()}
            </span>
        )}
    ];

    return (
        <Layout title="Jadwal Keberangkatan (Inventory)">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between">
                <h2 className="text-lg font-bold text-gray-700">Kalender Keberangkatan</h2>
                <button onClick={() => { setModalMode('create'); setFormData(initialForm); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Jadwal
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onDelete={(item) => deleteItem(item.id)} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Jadwal Baru" size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="label">Pilih Paket Dasar</label>
                        <select name="package_id" className="input-field" value={formData.package_id} onChange={handleChange} required>
                            <option value="">-- Pilih Paket --</option>
                            {packages.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration_days} Hari)</option>)}
                        </select>
                        <p className="text-xs text-blue-600 mt-1">* Jadwal ini akan mewarisi hotel & maskapai dari paket yg dipilih.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Tgl Keberangkatan</label><input type="date" name="departure_date" className="input-field" value={formData.departure_date} onChange={handleChange} required /></div>
                        <div><label className="label">Tgl Kepulangan</label><input type="date" name="return_date" className="input-field" value={formData.return_date} onChange={handleChange} required /></div>
                        
                        <div><label className="label">No. Flight Pergi</label><input name="flight_number_depart" className="input-field" placeholder="cth: GA-980" value={formData.flight_number_depart} onChange={handleChange} /></div>
                        <div><label className="label">No. Flight Pulang</label><input name="flight_number_return" className="input-field" placeholder="cth: GA-981" value={formData.flight_number_return} onChange={handleChange} /></div>
                        
                        <div><label className="label">Kuota Seat (Pax)</label><input type="number" name="seat_quota" className="input-field" value={formData.seat_quota} onChange={handleChange} /></div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-gray-700 mb-2 text-sm">Override Harga (Khusus Tanggal Ini)</h4>
                        <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded">
                            <div><label className="label">Quad</label><input type="number" name="price_quad" className="input-field text-sm" placeholder="Default Paket" value={formData.price_quad} onChange={handleChange} /></div>
                            <div><label className="label">Triple</label><input type="number" name="price_triple" className="input-field text-sm" placeholder="Default Paket" value={formData.price_triple} onChange={handleChange} /></div>
                            <div><label className="label">Double</label><input type="number" name="price_double" className="input-field text-sm" placeholder="Default Paket" value={formData.price_double} onChange={handleChange} /></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">* Kosongkan jika ingin mengikuti harga standar paket.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Jadwal</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Departures;