import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { User, Plus, CreditCard, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import AsyncCitySelect from '../components/AsyncCitySelect'; // Pastikan komponen ini ada

const Jamaah = () => {
    // 1. Fetch Data Jamaah
    // Gunakan default value [] untuk data agar tidak error saat initial load
    const { data = [], loading, fetchData, deleteItem } = useCRUD('umh/v1/jamaah');
    
    // 2. State Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Initial form state yang lengkap
    const initialForm = { 
        full_name: '', 
        nik: '', 
        passport_number: '', 
        gender: 'L', 
        phone: '', 
        city_id: '', 
        address: '',
        email: '',
        birth_date: ''
    };
    const [form, setForm] = useState(initialForm);
    const [mode, setMode] = useState('create'); // create atau edit

    // 3. Handlers
    const handleCreateClick = () => {
        setForm(initialForm);
        setMode('create');
        setIsModalOpen(true);
    };

    const handleEditClick = (item) => {
        setForm(item);
        setMode('edit');
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = mode === 'edit' ? `umh/v1/jamaah/${form.uuid || form.id}` : 'umh/v1/jamaah';
            const method = mode === 'edit' ? 'put' : 'post';
            
            await api[method](endpoint, form);
            
            toast.success(`Data Jemaah berhasil ${mode === 'edit' ? 'diperbarui' : 'disimpan'}`);
            setIsModalOpen(false);
            fetchData();
        } catch(e) { 
            console.error(e);
            toast.error("Gagal menyimpan data: " + (e.response?.data?.message || e.message)); 
        }
    };

    const handleDelete = async (item) => {
        if(confirm('Yakin ingin menghapus data jemaah ini?')) {
            await deleteItem(item);
        }
    }

    // 4. Definisi Kolom Tabel
    const cols = [
        { 
            header: 'Nama Lengkap', 
            accessor: 'full_name', 
            render: r => (
                <div>
                    <div className="font-bold text-gray-800">{r.full_name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <User size={10}/> {r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                </div>
            ) 
        },
        { 
            header: 'Identitas', 
            accessor: 'passport_number', 
            render: r => (
                <div className="space-y-1">
                    {r.passport_number && (
                        <span className="block text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded w-fit font-mono border border-blue-100">
                            P: {r.passport_number}
                        </span>
                    )}
                    <span className="block text-xs text-gray-500">NIK: {r.nik || '-'}</span>
                </div>
            ) 
        },
        { 
            header: 'Kontak', 
            accessor: 'phone', 
            render: r => (
                <div className="text-sm text-gray-600 flex flex-col">
                    <span className="flex items-center gap-1"><Phone size={12}/> {r.phone || '-'}</span>
                    {r.email && <span className="text-xs text-gray-400">{r.email}</span>}
                </div>
            ) 
        },
        { 
            header: 'Domisili', 
            accessor: 'city_id', 
            render: r => (
                <div className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin size={12}/> 
                    {/* Disini kita asumsikan backend sudah mengirim nama kota (join) 
                        atau kita handle async jika perlu. 
                        Untuk performa terbaik, idealnya API list jamaah sudah include nama kota.
                        Jika belum, bisa tampilkan ID atau fetching ulang (kurang disarankan untuk list).
                        
                        Solusi sementara: Tampilkan jika ada properti city_name dari backend, 
                        jika tidak, kosongkan/strip.
                    */}
                    {r.city_name || r.city_id || '-'} 
                </div>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: r => (
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                    r.status === 'active_jamaah' ? 'bg-green-50 text-green-700 border-green-200' : 
                    r.status === 'alumni' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                    {r.status ? r.status.replace('_', ' ') : 'REGISTERED'}
                </span>
            ) 
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Database Jemaah</h1>
                    <p className="text-sm text-gray-500">Kelola data jemaah, alumni, dan calon prospek secara terpusat.</p>
                </div>
                <button onClick={handleCreateClick} className="btn-primary flex gap-2 items-center">
                    <Plus size={18}/> Tambah Jemaah
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable 
                    columns={cols} 
                    data={data} 
                    loading={loading} 
                    onEdit={handleEditClick} 
                    onDelete={handleDelete} 
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={mode === 'create' ? "Tambah Data Jemaah" : "Edit Data Jemaah"}
            >
                <form onSubmit={handleSave} className="space-y-6">
                    
                    {/* Section 1: Data Pribadi */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                        <h4 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2 mb-2 flex items-center gap-2">
                            <User size={16} className="text-blue-600"/> Data Pribadi
                        </h4>
                        
                        <div>
                            <label className="label">Nama Lengkap (Sesuai KTP/Paspor)</label>
                            <input 
                                className="input-field" 
                                value={form.full_name || ''} 
                                onChange={e => setForm({...form, full_name: e.target.value})} 
                                required 
                                placeholder="Contoh: Muhammad Abdullah"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">NIK (KTP)</label>
                                <input 
                                    className="input-field" 
                                    type="number"
                                    value={form.nik || ''} 
                                    onChange={e => setForm({...form, nik: e.target.value})}
                                    placeholder="16 digit NIK"
                                />
                            </div>
                            <div>
                                <label className="label">Jenis Kelamin</label>
                                <select 
                                    className="input-field" 
                                    value={form.gender || 'L'} 
                                    onChange={e => setForm({...form, gender: e.target.value})}
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Tanggal Lahir</label>
                                <input 
                                    type="date"
                                    className="input-field" 
                                    value={form.birth_date || ''} 
                                    onChange={e => setForm({...form, birth_date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="label">Email (Opsional)</label>
                                <input 
                                    type="email"
                                    className="input-field" 
                                    value={form.email || ''} 
                                    onChange={e => setForm({...form, email: e.target.value})}
                                    placeholder="nama@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Dokumen & Kontak */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                        <h4 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2 mb-2 flex items-center gap-2">
                            <CreditCard size={16} className="text-blue-600"/> Dokumen & Kontak
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Nomor Paspor</label>
                                <input 
                                    className="input-field font-mono uppercase" 
                                    value={form.passport_number || ''} 
                                    onChange={e => setForm({...form, passport_number: e.target.value})} 
                                    placeholder="X1234567"
                                />
                            </div>
                            <div>
                                <label className="label">WhatsApp / HP</label>
                                <input 
                                    type="tel"
                                    className="input-field" 
                                    value={form.phone || ''} 
                                    onChange={e => setForm({...form, phone: e.target.value})} 
                                    placeholder="0812..."
                                />
                            </div>
                        </div>
                        
                        {/* Komponen Async City Select */}
                        <div>
                            <label className="label">Kota Domisili</label>
                            <AsyncCitySelect 
                                value={form.city_id} 
                                onChange={(newCityId) => setForm({...form, city_id: newCityId})}
                                placeholder="Ketik nama kota (misal: Surabaya)..."
                            />
                            <p className="text-[10px] text-gray-500 mt-1">*Ketik minimal 3 huruf untuk mencari kota.</p>
                        </div>

                        <div>
                            <label className="label">Alamat Lengkap</label>
                            <textarea 
                                className="input-field" 
                                rows="2" 
                                value={form.address || ''} 
                                onChange={e => setForm({...form, address: e.target.value})}
                                placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary"
                        >
                            Batal
                        </button>
                        <button type="submit" className="btn-primary px-8">
                            Simpan Data
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Jamaah;