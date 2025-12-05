import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { User, Plus, FileText, Heart, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Jamaah = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/jamaah');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [activeTab, setActiveTab] = useState('personal'); 
    
    // Initial State sesuai Database umh_jamaah
    const initialForm = {
        nik: '', 
        passport_number: '', 
        full_name: '', 
        gender: 'L',
        birth_place: '', 
        birth_date: '', 
        phone: '', 
        email: '', // Added
        address: '', 
        city: '', // Added
        job_title: '', 
        clothing_size: 'L',
        father_name: '', 
        mother_name: '', 
        disease_history: '', 
        bpjs_number: '',
        status: 'registered', 
        payment_status: 'pending'
    };

    const [form, setForm] = useState(initialForm);

    const handleCreate = () => {
        setForm(initialForm);
        setMode('create');
        setActiveTab('personal');
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        // Pastikan nilai null dari DB diubah jadi string kosong agar input controlled tidak error
        const safeItem = Object.keys(initialForm).reduce((acc, key) => {
            acc[key] = item[key] || '';
            return acc;
        }, {});
        
        setForm({ ...safeItem, id: item.id });
        setMode('edit');
        setActiveTab('personal');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/jamaah', form);
            else await api.put(`umh/v1/jamaah/${form.id}`, form);
            
            toast.success(mode === 'create' ? "Jamaah berhasil didaftarkan" : "Data jamaah diperbarui");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal menyimpan: " + error.message);
        }
    };

    const columns = [
        { header: 'Identitas Jamaah', accessor: 'full_name', render: r => (
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${r.gender === 'L' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                    {r.full_name.charAt(0)}
                </div>
                <div>
                    <div className="font-bold text-gray-900">{r.full_name}</div>
                    <div className="text-xs text-gray-500">NIK: {r.nik || '-'}</div>
                </div>
            </div>
        )},
        { header: 'Paspor', accessor: 'passport_number', render: r => (
            r.passport_number ? 
            <span className="font-mono bg-gray-100 border border-gray-300 px-2 py-1 rounded text-xs text-gray-700">{r.passport_number}</span> : 
            <span className="text-red-400 text-xs italic">Belum ada</span>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div className="text-sm">
                <div className="flex items-center gap-1 text-gray-800">{r.phone}</div>
                <div className="text-gray-400 text-xs">{r.city || '-'}</div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <div className="flex flex-col gap-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${r.status==='berangkat'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{r.status}</span>
            </div>
        )},
    ];

    const TabButton = ({ id, icon: Icon, label }) => (
        <button 
            type="button" 
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${activeTab === id ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-500 hover:text-gray-700'}`}
        >
            <Icon size={16}/> {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl text-white shadow-md">
                        <User size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Database Jamaah</h1>
                        <p className="text-gray-500 text-sm">Manajemen data lengkap calon tamu Allah.</p>
                    </div>
                </div>
                <button onClick={handleCreate} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200">
                    <Plus size={18} /> Registrasi Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={handleEdit} onDelete={(item) => deleteItem(item.id)} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create' ? "Registrasi Jamaah" : `Edit: ${form.full_name}`}>
                <form onSubmit={handleSubmit}>
                    <div className="flex mb-6 bg-gray-50 rounded-t-lg">
                        <TabButton id="personal" icon={User} label="Pribadi" />
                        <TabButton id="docs" icon={FileText} label="Dokumen" />
                        <TabButton id="health" icon={Heart} label="Kesehatan" />
                        <TabButton id="family" icon={Users} label="Keluarga" />
                    </div>

                    <div className="space-y-4 min-h-[300px]">
                        {/* TAB 1: DATA PRIBADI */}
                        {activeTab === 'personal' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                                <div>
                                    <label className="label">Nama Lengkap (Sesuai KTP)</label>
                                    <input className="input-field" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">NIK / KTP</label>
                                        <input className="input-field" value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Jenis Kelamin</label>
                                        <select className="input-field" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Tempat Lahir</label>
                                        <input className="input-field" value={form.birth_place} onChange={e => setForm({...form, birth_place: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Tanggal Lahir</label>
                                        <input type="date" className="input-field" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">No. Telepon / WA</label>
                                        <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Email</label>
                                        <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Kota Domisili</label>
                                        <input className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Ukuran Pakaian</label>
                                        <select className="input-field" value={form.clothing_size} onChange={e => setForm({...form, clothing_size: e.target.value})}>
                                            <option value="S">S</option> <option value="M">M</option> <option value="L">L</option> <option value="XL">XL</option> <option value="XXL">XXL</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Alamat Lengkap</label>
                                    <textarea className="input-field h-20" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: DOKUMEN & PEKERJAAN */}
                        {activeTab === 'docs' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Nomor Paspor</label>
                                        <input className="input-field font-mono" value={form.passport_number} onChange={e => setForm({...form, passport_number: e.target.value})} placeholder="X0000000" />
                                    </div>
                                    <div>
                                        <label className="label">Pekerjaan</label>
                                        <input className="input-field" value={form.job_title} onChange={e => setForm({...form, job_title: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Status Pendaftaran</label>
                                    <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                        <option value="registered">Terdaftar</option>
                                        <option value="dp">Sudah DP</option>
                                        <option value="lunas">Lunas</option>
                                        <option value="berangkat">Siap Berangkat</option>
                                        <option value="selesai">Selesai (Pulang)</option>
                                        <option value="batal">Batal</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: KESEHATAN */}
                        {activeTab === 'health' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                                <div>
                                    <label className="label">Riwayat Penyakit</label>
                                    <textarea className="input-field h-24" value={form.disease_history} onChange={e => setForm({...form, disease_history: e.target.value})} placeholder="Sebutkan jika ada diabetes, jantung, asma, dll..."></textarea>
                                </div>
                                <div>
                                    <label className="label">Nomor BPJS</label>
                                    <input className="input-field" value={form.bpjs_number} onChange={e => setForm({...form, bpjs_number: e.target.value})} />
                                </div>
                            </div>
                        )}

                        {/* TAB 4: KELUARGA */}
                        {activeTab === 'family' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                                <div>
                                    <label className="label">Nama Ayah Kandung (Wajib untuk Visa)</label>
                                    <input className="input-field" value={form.father_name} onChange={e => setForm({...form, father_name: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="label">Nama Ibu Kandung</label>
                                    <input className="input-field" value={form.mother_name} onChange={e => setForm({...form, mother_name: e.target.value})} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32">Simpan Data</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Jamaah;