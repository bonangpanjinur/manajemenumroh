import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Megaphone, Users, PhoneCall, Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Marketing = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/marketing/leads');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    // Handler Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post('umh/v1/marketing/leads', form);
                toast.success("Lead baru berhasil ditambahkan");
            } else {
                await api.put(`umh/v1/marketing/leads/${form.id}`, form);
                toast.success("Data lead diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal menyimpan: " + error.message);
        }
    };

    const handleEdit = (item) => {
        setForm(item);
        setMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Hapus data prospek ini?")) await deleteItem(id);
    };

    const columns = [
        { header: 'Nama Prospek', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500">{r.email || '-'}</div>
            </div>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => <span className="font-mono text-gray-600">{r.phone}</span> },
        { header: 'Sumber', accessor: 'source', render: r => <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">{r.source}</span> },
        { header: 'Paket Minat', accessor: 'interest_package_name', render: r => <span className="text-sm text-gray-600">{r.interest_package_name || 'Umum'}</span> },
        { header: 'Status', accessor: 'status', render: r => {
            const colors = {
                new: 'bg-blue-100 text-blue-700',
                contacted: 'bg-yellow-100 text-yellow-700',
                hot: 'bg-red-100 text-red-700',
                deal: 'bg-green-100 text-green-700',
                lost: 'bg-gray-100 text-gray-500'
            };
            return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[r.status] || 'bg-gray-100'}`}>{r.status}</span>
        }},
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Marketing & Leads</h1>
                        <p className="text-gray-500 text-sm">Kelola kampanye iklan dan calon jamaah potensial.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setForm({ status: 'new', source: 'Instagram' }); setMode('create'); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Tambah Lead Manual
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-pink-100 text-sm mb-1 font-medium">Total Leads (Bulan Ini)</p>
                        <h3 className="text-3xl font-bold">128</h3>
                        <p className="text-xs text-pink-200 mt-2">↑ 12% dari bulan lalu</p>
                    </div>
                    <Users className="absolute right-4 bottom-4 opacity-20 text-white" size={64} />
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-500 text-sm font-medium">Konversi ke Booking</p>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">+2.4%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">12.5%</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '12.5%' }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-500 text-sm font-medium">Prospek "HOT"</p>
                        <PhoneCall className="text-red-500" size={18} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">15</h3>
                    <p className="text-xs text-gray-400 mt-1">Perlu follow up segera</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">Daftar Leads Terbaru</h3>
                    <button className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                        <Filter size={14}/> Filter
                    </button>
                </div>
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={handleEdit} 
                    onDelete={(item)=>handleDelete(item.id)} 
                />
            </div>

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Prospek Baru" : "Edit Data Prospek"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Lengkap</label>
                        <input className="input-field" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nomor WhatsApp</label>
                            <input className="input-field" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} required />
                        </div>
                        <div>
                            <label className="label">Email (Opsional)</label>
                            <input type="email" className="input-field" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Sumber Leads</label>
                            <select className="input-field" value={form.source || 'Instagram'} onChange={e => setForm({...form, source: e.target.value})}>
                                <option value="Instagram">Instagram Ads</option>
                                <option value="Facebook">Facebook Ads</option>
                                <option value="Website">Website</option>
                                <option value="Referral">Referral / Agen</option>
                                <option value="Walk-in">Datang Langsung</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Status Prospek</label>
                            <select className="input-field" value={form.status || 'new'} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="new">New (Baru Masuk)</option>
                                <option value="contacted">Sedang Dihubungi</option>
                                <option value="hot">Hot (Minat Tinggi)</option>
                                <option value="deal">Deal (Booking)</option>
                                <option value="lost">Lost (Batal/Gagal)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Catatan Follow Up</label>
                        <textarea className="input-field h-24" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Contoh: Berminat paket Turki bulan Desember, minta dihubungi lagi sore ini."></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Data</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Marketing;