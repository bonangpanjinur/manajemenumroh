import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, User, Users, Activity, FileText, Save, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Jamaah = () => {
    const { data, loading, pagination, fetchData, deleteItem, changePage, changeLimit } = useCRUD('umh/v1/jamaah');
    const { data: packages } = useCRUD('umh/v1/packages');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [activeTab, setActiveTab] = useState('pribadi');
    const [uploading, setUploading] = useState(false);

    // State Form Sesuai DB Schema (umh_jamaah)
    const initialForm = {
        full_name: '', full_name_ar: '', nik: '', passport_number: '',
        gender: 'L', birth_place: '', birth_date: '',
        phone: '', email: '', address: '', city: '', job_title: '', education: '',
        father_name: '', mother_name: '', spouse_name: '',
        clothing_size: 'L', disease_history: '', bpjs_number: '',
        package_id: '', package_price: 0, status: 'registered'
    };
    
    const [formData, setFormData] = useState(initialForm);
    const [files, setFiles] = useState({ ktp: null, kk: null, passport: null, photo: null, buku_nikah: null });

    useEffect(() => { fetchData(); }, [fetchData]);

    // Handle perubahan input text
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle pemilihan paket (Auto-fill harga)
    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        const selectedPkg = packages?.find(p => String(p.id) === String(pkgId));
        setFormData(prev => ({ 
            ...prev, 
            package_id: pkgId, 
            package_price: selectedPkg ? selectedPkg.price : 0 
        }));
    };

    // Handle File Upload Change
    const handleFileChange = (type, file) => setFiles(prev => ({ ...prev, [type]: file }));

    // Submit Logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let savedId = formData.id;
            const apiPath = 'umh/v1/jamaah';

            // 1. Simpan Data Teks
            if (modalMode === 'create') {
                const res = await api.post(apiPath, formData);
                savedId = res.id;
            } else {
                await api.post(`${apiPath}/${savedId}`, formData);
            }

            if (!savedId) throw new Error("Gagal menyimpan data dasar.");

            // 2. Upload File secara Paralel jika ada
            const uploadPromises = [];
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    uploadPromises.push(api.upload(files[key], `scan_${key}`, savedId));
                }
            });

            if (uploadPromises.length > 0) {
                setUploading(true);
                await Promise.all(uploadPromises);
            }

            toast.success('Data Jemaah berhasil disimpan lengkap!');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Terjadi kesalahan saat menyimpan.');
        } finally {
            setUploading(false);
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setFormData(item || initialForm);
        setFiles({ ktp: null, kk: null, passport: null, photo: null, buku_nikah: null });
        setActiveTab('pribadi');
        setIsModalOpen(true);
    };

    // Definisi Kolom Tabel
    const columns = [
        { header: 'Nama Jemaah', accessor: 'full_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.full_name}</div>
                <div className="text-xs text-gray-500 font-mono">
                    {r.passport_number ? `Pass: ${r.passport_number}` : `NIK: ${r.nik || '-'}`}
                </div>
            </div>
        )},
        { header: 'Kontak & Domisili', accessor: 'phone', render: r => (
            <div>
                <div className="text-sm font-medium text-gray-700">{r.phone}</div>
                <div className="text-xs text-gray-400">{r.city || '-'}</div>
            </div>
        )},
        { header: 'Paket Pilihan', accessor: 'package_name', render: r => (
            <div>
                <div className="font-medium text-blue-600">{r.package_name || 'Belum pilih'}</div>
                <div className="text-xs text-gray-500">Deal: {formatCurrency(r.package_price)}</div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
             <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                r.status === 'lunas' ? 'bg-green-50 text-green-700 border-green-200' : 
                r.status === 'registered' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>{r.status}</span>
        )},
    ];

    const TabButton = ({ id, label, icon: Icon }) => (
        <button 
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
        >
            <Icon size={16} /> {label}
        </button>
    );

    return (
        <Layout title="Data Jemaah & Pelanggan">
            {/* Header Action */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput onSearch={(q) => fetchData({ search: q })} placeholder="Cari nama, paspor, atau NIK..." />
                </div>
                <button onClick={() => openModal('create')} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200">
                    <Plus size={18}/> Registrasi Baru
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onDelete={deleteItem} 
                    onEdit={(item) => openModal('edit', item)} 
                />
                <Pagination pagination={pagination} onPageChange={changePage} onLimitChange={changeLimit} />
            </div>

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Registrasi Jemaah Baru" : "Edit Data Jemaah"} size="max-w-4xl">
                <form onSubmit={handleSubmit}>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                        <TabButton id="pribadi" label="Data Pribadi" icon={User} />
                        <TabButton id="keluarga" label="Keluarga (Mahram)" icon={Users} />
                        <TabButton id="kesehatan" label="Fisik & Kesehatan" icon={Activity} />
                        <TabButton id="dokumen" label="Upload Dokumen" icon={FileText} />
                    </div>

                    {/* Content Scrollable */}
                    <div className="max-h-[60vh] overflow-y-auto px-1 custom-scrollbar pb-4">
                        
                        {/* TAB 1: DATA PRIBADI */}
                        {activeTab === 'pribadi' && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div><label className="label">Nama Lengkap (KTP)</label><input name="full_name" className="input-field" value={formData.full_name} onChange={handleChange} required /></div>
                                    <div><label className="label">Nama Arab (Paspor)</label><input name="full_name_ar" className="input-field" value={formData.full_name_ar} onChange={handleChange} /></div>
                                    <div><label className="label">NIK (KTP)</label><input name="nik" className="input-field" value={formData.nik} onChange={handleChange} /></div>
                                    <div><label className="label">Nomor Paspor</label><input name="passport_number" className="input-field bg-yellow-50 border-yellow-200" value={formData.passport_number} onChange={handleChange} placeholder="X000000" /></div>
                                    
                                    <div>
                                        <label className="label">Jenis Kelamin</label>
                                        <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="label">Tempat Lahir</label><input name="birth_place" className="input-field" value={formData.birth_place} onChange={handleChange} /></div>
                                        <div><label className="label">Tanggal Lahir</label><input name="birth_date" type="date" className="input-field" value={formData.birth_date} onChange={handleChange} /></div>
                                    </div>

                                    <div><label className="label">No. WhatsApp</label><input name="phone" className="input-field" value={formData.phone} onChange={handleChange} required placeholder="0812..." /></div>
                                    <div><label className="label">Email</label><input name="email" type="email" className="input-field" value={formData.email} onChange={handleChange} /></div>
                                </div>

                                <div><label className="label">Alamat Lengkap</label><textarea name="address" className="input-field" rows="2" value={formData.address} onChange={handleChange}></textarea></div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="label">Kota Domisili</label><input name="city" className="input-field" value={formData.city} onChange={handleChange} /></div>
                                    <div><label className="label">Pekerjaan</label><input name="job_title" className="input-field" value={formData.job_title} onChange={handleChange} /></div>
                                    <div><label className="label">Pendidikan</label><input name="education" className="input-field" value={formData.education} onChange={handleChange} /></div>
                                </div>

                                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mt-2">
                                    <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">📦 Pilih Paket Perjalanan</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Paket</label>
                                            <select name="package_id" className="input-field border-blue-300" value={formData.package_id} onChange={handlePackageChange}>
                                                <option value="">-- Pilih Paket --</option>
                                                {packages?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Harga Deal (Rp)</label>
                                            <input name="package_price" type="number" className="input-field font-bold text-blue-700 border-blue-300" value={formData.package_price} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: KELUARGA */}
                        {activeTab === 'keluarga' && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-bold text-gray-700 mb-4">Data Orang Tua & Pasangan (Penting untuk Visa)</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div><label className="label">Nama Ayah Kandung</label><input name="father_name" className="input-field" value={formData.father_name} onChange={handleChange} /></div>
                                        <div><label className="label">Nama Ibu Kandung</label><input name="mother_name" className="input-field" value={formData.mother_name} onChange={handleChange} /></div>
                                        <div><label className="label">Nama Pasangan (Suami/Istri)</label><input name="spouse_name" className="input-field" value={formData.spouse_name} onChange={handleChange} /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: KESEHATAN */}
                        {activeTab === 'kesehatan' && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Ukuran Perlengkapan (Baju/Kain)</label>
                                        <select name="clothing_size" className="input-field" value={formData.clothing_size} onChange={handleChange}>
                                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Custom'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="label">Nomor BPJS / Asuransi</label><input name="bpjs_number" className="input-field" value={formData.bpjs_number} onChange={handleChange} /></div>
                                    <div className="md:col-span-2">
                                        <label className="label">Riwayat Penyakit / Alergi</label>
                                        <textarea name="disease_history" className="input-field bg-red-50 border-red-100" rows="3" value={formData.disease_history} onChange={handleChange} placeholder="Contoh: Diabetes, Asma, Alergi Udang..."></textarea>
                                        <p className="text-xs text-red-500 mt-1">* Wajib diisi jujur untuk penanganan medis di Tanah Suci.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: DOKUMEN */}
                        {activeTab === 'dokumen' && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200 mb-4 flex items-start gap-2">
                                    <span>ℹ️</span>
                                    <div>Format file: JPG, PNG, atau PDF. Maksimal 2MB per file. Upload baru akan menimpa file lama.</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { key: 'ktp', label: 'Scan KTP' },
                                        { key: 'kk', label: 'Scan Kartu Keluarga' },
                                        { key: 'passport', label: 'Scan Paspor (Halaman Depan)' },
                                        { key: 'photo', label: 'Pas Foto (Latar Putih)' },
                                        { key: 'buku_nikah', label: 'Scan Buku Nikah (Jika Ada)' }
                                    ].map((doc) => (
                                        <div key={doc.key} className="border p-4 rounded-lg hover:shadow-sm transition-shadow bg-gray-50">
                                            <label className="label font-bold mb-2 block">{doc.label}</label>
                                            <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors" onChange={e => handleFileChange(doc.key, e.target.files[0])} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4 bg-white sticky bottom-0">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex items-center gap-2">
                            <X size={18}/> Batal
                        </button>
                        <button type="submit" className="btn-primary w-40 flex items-center justify-center gap-2" disabled={uploading}>
                            {uploading ? 'Mengupload...' : <><Save size={18}/> Simpan Data</>}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Jamaah;