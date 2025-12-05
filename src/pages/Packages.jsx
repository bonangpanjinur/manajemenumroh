import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Package, Plus, Calendar, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Packages = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/packages');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    // Helper formatter
    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Simulasi upload gambar jika ada (logika upload sesungguhnya butuh FormData)
            const payload = { ...form };
            
            if (mode === 'create') {
                await api.post('umh/v1/packages', payload);
                toast.success("Paket berhasil dibuat");
            } else {
                await api.put(`umh/v1/packages/${form.id}`, payload);
                toast.success("Paket diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal simpan: " + error.message);
        }
    };

    const handleEdit = (item) => {
        setForm(item);
        setMode('edit');
        setIsModalOpen(true);
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500">{r.duration_days} Hari | {r.category_name}</div>
            </div>
        )},
        { header: 'Hotel', accessor: 'hotels', render: r => (
            <div className="text-sm">
                <div className="flex items-center gap-1"><MapPin size={10} className="text-gray-400"/> Makkah: {r.hotel_makkah || 'TBA'}</div>
                <div className="flex items-center gap-1"><MapPin size={10} className="text-gray-400"/> Madinah: {r.hotel_madinah || 'TBA'}</div>
            </div>
        )},
        { header: 'Harga Mulai', accessor: 'base_price', render: r => <span className="font-bold text-green-700">{formatIDR(r.base_price)}</span> },
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {r.status}
            </span>
        )},
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Paket Umroh & Haji</h1>
                        <p className="text-gray-500 text-sm">Kelola katalog produk perjalanan.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setForm({ duration_days: 9, currency: 'IDR', status: 'active' }); setMode('create'); setIsModalOpen(true); }} 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Buat Paket Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={(item) => { if(window.confirm('Hapus paket?')) deleteItem(item.id) }}
                />
            </div>

            {/* Modal Form Besar */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Paket Baru" : "Edit Paket"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Info Dasar */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 border-b pb-2">Informasi Dasar</h3>
                        <div>
                            <label className="label">Nama Paket</label>
                            <input className="input-field" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Umroh Awal Ramadhan 2025" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Kategori</label>
                                <select className="input-field" value={form.category_id || ''} onChange={e => setForm({...form, category_id: e.target.value})}>
                                    <option value="">-- Pilih Kategori --</option>
                                    <option value="1">Umroh Reguler</option>
                                    <option value="2">Umroh Plus</option>
                                    <option value="3">Haji Furoda</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Durasi (Hari)</label>
                                <input type="number" className="input-field" value={form.duration_days || 9} onChange={e => setForm({...form, duration_days: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* 2. Akomodasi */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 border-b pb-2">Akomodasi Hotel</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Hotel Makkah</label>
                                <input className="input-field" value={form.hotel_makkah || ''} onChange={e => setForm({...form, hotel_makkah: e.target.value})} placeholder="Cari Hotel..." />
                            </div>
                            <div>
                                <label className="label">Hotel Madinah</label>
                                <input className="input-field" value={form.hotel_madinah || ''} onChange={e => setForm({...form, hotel_madinah: e.target.value})} placeholder="Cari Hotel..." />
                            </div>
                        </div>
                    </div>

                    {/* 3. Harga */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><DollarSign size={16}/> Varian Harga (IDR)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="label">Quad (Sekamar 4)</label>
                                <input type="number" className="input-field" value={form.base_price_quad || ''} onChange={e => setForm({...form, base_price_quad: e.target.value})} placeholder="30.000.000" />
                            </div>
                            <div>
                                <label className="label">Triple (Sekamar 3)</label>
                                <input type="number" className="input-field" value={form.base_price_triple || ''} onChange={e => setForm({...form, base_price_triple: e.target.value})} placeholder="32.000.000" />
                            </div>
                            <div>
                                <label className="label">Double (Sekamar 2)</label>
                                <input type="number" className="input-field" value={form.base_price_double || ''} onChange={e => setForm({...form, base_price_double: e.target.value})} placeholder="35.000.000" />
                            </div>
                        </div>
                        <div>
                            <label className="label">Uang Muka (DP)</label>
                            <input type="number" className="input-field" value={form.down_payment_amount || 5000000} onChange={e => setForm({...form, down_payment_amount: e.target.value})} />
                        </div>
                    </div>

                    {/* 4. Deskripsi & Media */}
                    <div className="space-y-4">
                        <div>
                            <label className="label">Deskripsi Paket</label>
                            <textarea className="input-field h-24" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                        </div>
                        <div>
                            <label className="label">URL Gambar Banner</label>
                            <div className="flex gap-2">
                                <input className="input-field" value={form.image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
                                <button type="button" className="btn-secondary whitespace-nowrap"><ImageIcon size={16}/></button>
                            </div>
                        </div>
                        <div>
                            <label className="label">Status Publikasi</label>
                            <select className="input-field" value={form.status || 'active'} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="active">Active (Tampil di Web)</option>
                                <option value="draft">Draft (Disembunyikan)</option>
                                <option value="archived">Arsip (Tidak Aktif)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;