import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { User, Plus, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const Jamaah = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/jamaah');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    // Reset form ke state awal
    const resetForm = () => {
        setForm({
            full_name: '', nik: '', passport_number: '', gender: 'L',
            phone: '', city: '', package_id: '', birth_date: '',
            father_name: '', address: '', disease_history: ''
        });
    };

    const handleEdit = (item) => {
        setForm(item);
        setMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Yakin hapus data jamaah ini?")) {
            await deleteItem(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post('umh/v1/jamaah', form);
                toast.success("Jamaah berhasil didaftarkan");
            } else {
                await api.put(`umh/v1/jamaah/${form.id}`, form);
                toast.success("Data jamaah diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal menyimpan: " + error.message);
        }
    };

    const columns = [
        { header: 'Nama Lengkap', accessor: 'full_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.full_name}</div>
                <div className="text-xs text-gray-500">NIK: {r.nik || '-'}</div>
            </div>
        )},
        { header: 'Jenis Kelamin', accessor: 'gender', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold ${r.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                {r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
            </span>
        )},
        { header: 'Paspor', accessor: 'passport_number', render: r => <span className="font-mono text-gray-700">{r.passport_number || 'Belum ada'}</span> },
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div className="text-sm">
                <div>{r.phone}</div>
                <div className="text-gray-400 text-xs">{r.city}</div>
            </div>
        )},
        { header: 'Paket', accessor: 'package_name', render: r => <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200">{r.package_name || 'Belum Pilih'}</span> },
    ];

    return (
        <div className="space-y-6">
            {/* Header Manual */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600">
                        <User size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Data Jamaah</h1>
                        <p className="text-gray-500 text-sm">Database lengkap jamaah umroh & haji.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { resetForm(); setMode('create'); setIsModalOpen(true); }} 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Tambah Jamaah
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={(item) => handleDelete(item.id)}
                />
            </div>

            {/* Modal Form Lengkap */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create' ? "Registrasi Jamaah Baru" : "Edit Data Jamaah"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Section 1: Identitas Utama */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><User size={14}/> Identitas Diri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Nama Lengkap (Sesuai KTP)</label>
                                <input className="input-field" value={form.full_name || ''} onChange={e => setForm({...form, full_name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="label">NIK (Nomor Induk Kependudukan)</label>
                                <input className="input-field" value={form.nik || ''} onChange={e => setForm({...form, nik: e.target.value})} />
                            </div>
                            <div>
                                <label className="label">Jenis Kelamin</label>
                                <select className="input-field" value={form.gender || 'L'} onChange={e => setForm({...form, gender: e.target.value})}>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Tanggal Lahir</label>
                                <input type="date" className="input-field" value={form.birth_date || ''} onChange={e => setForm({...form, birth_date: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Dokumen & Kontak */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><FileText size={14}/> Dokumen & Kontak</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Nomor Paspor</label>
                                <input className="input-field" value={form.passport_number || ''} onChange={e => setForm({...form, passport_number: e.target.value})} placeholder="X000000" />
                            </div>
                            <div>
                                <label className="label">Nama Ayah Kandung (Untuk Visa)</label>
                                <input className="input-field" value={form.father_name || ''} onChange={e => setForm({...form, father_name: e.target.value})} />
                            </div>
                            <div>
                                <label className="label">Nomor HP / WhatsApp</label>
                                <input className="input-field" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="label">Kota Domisili</label>
                                <input className="input-field" value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="label">Alamat Lengkap</label>
                                <textarea className="input-field h-16" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Kesehatan */}
                    <div>
                        <label className="label">Riwayat Penyakit / Catatan Khusus</label>
                        <textarea className="input-field" value={form.disease_history || ''} onChange={e => setForm({...form, disease_history: e.target.value})} placeholder="Contoh: Diabetes, Asma (Kosongkan jika sehat)"></textarea>
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

export default Jamaah;