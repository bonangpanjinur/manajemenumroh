import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { ShoppingCart, Plus, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Bookings = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/bookings');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    // Formatter Rupiah
    const formatIDR = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
    };

    const handleEdit = (item) => {
        setForm(item);
        setMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Hapus data booking ini?")) await deleteItem(id);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post('umh/v1/bookings', form);
                toast.success("Booking berhasil dibuat");
            } else {
                await api.put(`umh/v1/bookings/${form.id}`, form);
                toast.success("Booking diupdate");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };

    const columns = [
        { header: 'Kode Booking', accessor: 'booking_code', render: r => (
            <div>
                <span className="font-mono font-bold text-blue-600 block">{r.booking_code}</span>
                <span className="text-xs text-gray-400">{r.created_at?.substring(0,10)}</span>
            </div>
        )},
        { header: 'Kontak', accessor: 'contact_name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.contact_name}</div>
                <div className="text-xs text-gray-500">{r.contact_phone}</div>
            </div>
        )},
        { header: 'Paket Info', accessor: 'package_info', render: r => (
            <div className="text-sm">
                <div className="font-medium">{r.package_name || 'Custom'}</div>
                <div className="text-xs bg-gray-100 inline-block px-1 rounded mt-1">{r.total_pax} Pax</div>
            </div>
        )},
        { header: 'Total Biaya', accessor: 'total_price', render: r => <span className="font-medium text-gray-900">{formatIDR(r.total_price)}</span> },
        { header: 'Status Pembayaran', accessor: 'payment_status', render: r => {
            const colors = {
                paid: 'bg-green-100 text-green-700',
                dp: 'bg-blue-100 text-blue-700',
                unpaid: 'bg-red-100 text-red-700',
                partial: 'bg-yellow-100 text-yellow-700'
            };
            return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[r.payment_status] || 'bg-gray-100'}`}>{r.payment_status}</span>
        }},
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Transaksi Booking</h1>
                        <p className="text-gray-500 text-sm">Kelola pemesanan dan pembayaran jamaah.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setForm({ booking_date: new Date().toISOString().split('T')[0], total_pax: 1, payment_status: 'unpaid' }); setMode('create'); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Booking Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={handleEdit} onDelete={(item) => handleDelete(item.id)} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Buat Booking Baru" : "Edit Booking"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nama Kontak Pemesan</label>
                            <input className="input-field" value={form.contact_name || ''} onChange={e => setForm({...form, contact_name: e.target.value})} required />
                        </div>
                        <div>
                            <label className="label">Nomor Telepon</label>
                            <input className="input-field" value={form.contact_phone || ''} onChange={e => setForm({...form, contact_phone: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tanggal Booking</label>
                            <input type="date" className="input-field" value={form.booking_date || ''} onChange={e => setForm({...form, booking_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="label">Jumlah Pax (Orang)</label>
                            <input type="number" min="1" className="input-field" value={form.total_pax || 1} onChange={e => setForm({...form, total_pax: e.target.value})} />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Total Tagihan (Rp)</label>
                                <input type="number" className="input-field font-bold text-gray-800" value={form.total_price || 0} onChange={e => setForm({...form, total_price: e.target.value})} />
                            </div>
                            <div>
                                <label className="label">Status Pembayaran</label>
                                <select className="input-field" value={form.payment_status || 'unpaid'} onChange={e => setForm({...form, payment_status: e.target.value})}>
                                    <option value="unpaid">Belum Bayar</option>
                                    <option value="dp">Down Payment (DP)</option>
                                    <option value="partial">Cicilan</option>
                                    <option value="paid">Lunas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="label">Catatan Tambahan</label>
                        <textarea className="input-field h-20" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Transaksi</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Bookings;