import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Upload, User, Users, Activity, FileText, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Jamaah = () => {
    // Hook CRUD
    const { data, loading, pagination, fetchData, deleteItem, changePage, changeLimit } = useCRUD('umh/v1/jamaah');
    const { data: packages } = useCRUD('umh/v1/packages');

    // State Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [activeTab, setActiveTab] = useState('pribadi'); // pribadi, keluarga, kesehatan, dokumen
    const [uploading, setUploading] = useState(false);

    // Inisialisasi State Form sesuai DB Schema baru
    const initialForm = {
        // Data Pribadi
        full_name: '', full_name_ar: '', nik: '', passport_number: '',
        gender: 'L', birth_place: '', birth_date: '',
        phone: '', email: '', address: '', city: '', job_title: '', education: '',
        
        // Data Keluarga (Mahram)
        father_name: '', mother_name: '', spouse_name: '',
        
        // Kesehatan & Fisik
        clothing_size: 'L', disease_history: '', bpjs_number: '',
        
        // Paket
        package_id: '', package_price: 0, status: 'registered'
    };
    
    const [formData, setFormData] = useState(initialForm);
    const [files, setFiles] = useState({ ktp: null, kk: null, passport: null, photo: null, buku_nikah: null });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = (q) => fetchData(1, pagination.limit, q);

    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        const selectedPkg = packages?.find(p => String(p.id) === String(pkgId));
        setFormData(prev => ({ ...prev, package_id: pkgId, package_price: selectedPkg ? selectedPkg.price : 0 }));
    };

    const handleFileChange = (type, file) => setFiles(prev => ({ ...prev, [type]: file }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let savedId = formData.id;
            const apiPath = 'umh/v1/jamaah';

            if (modalMode === 'create') {
                const res = await api.post(apiPath, formData);
                savedId = res.id;
            } else {
                await api.post(`${apiPath}/${savedId}`, formData);
            }

            if (!savedId) throw new Error("Gagal menyimpan data.");

            // Upload Files Logic
            const uploadPromises = [];
            if (files.ktp) uploadPromises.push(api.upload(files.ktp, 'scan_ktp', savedId));
            if (files.kk) uploadPromises.push(api.upload(files.kk, 'scan_kk', savedId));
            if (files.passport) uploadPromises.push(api.upload(files.passport, 'scan_passport', savedId));
            if (files.photo) uploadPromises.push(api.upload(files.photo, 'scan_photo', savedId));
            if (files.buku_nikah) uploadPromises.push(api.upload(files.buku_nikah, 'scan_buku_nikah', savedId));

            if (uploadPromises.length > 0) {
                setUploading(true);
                await Promise.all(uploadPromises);
            }

            toast.success('Data Jemaah berhasil disimpan!');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Terjadi kesalahan.');
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

    // Kolom Tabel
    const columns = [
        { header: 'Nama Lengkap', accessor: 'full_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.full_name}</div>
                <div className="text-xs text-gray-500">{r.passport_number ? `Paspor: ${r.passport_number}` : `NIK: ${r.nik || '-'}`}</div>
            </div>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div>
                <div className="text-sm">{r.phone}</div>
                <div className="text-xs text-gray-400">{r.city}</div>
            </div>
        )},
        { header: 'Paket', accessor: 'package_name', render: r => (
            <div>
                <div className="font-medium text-blue-600">{r.package_name || 'Belum pilih'}</div>
                <div className="text-xs text-gray-500">{formatCurrency(r.package_price)}</div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
             <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                r.status === 'registered' ? 'bg-blue-100 text-blue-700' : 
                r.status === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>{r.status}</span>
        )},
    ];

    // Komponen Tab Button
    const TabButton = ({ id, label, icon: Icon }) => (
        <button 
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
            <Icon size={16} /> {label}
        </button>
    );

    return (
        <Layout title="Manajemen Data Jemaah">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex justify-between items-center gap-4">
                <div className="w-full md:w-1/3"><SearchInput onSearch={handleSearch} /></div>
                <button onClick={() => openModal('create')} className="btn-primary flex items-center gap-2"><Plus size={18}/> Tambah Jemaah</button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onDelete={deleteItem} onEdit={(item) => openModal('edit', item)} />
                <Pagination pagination={pagination} onPageChange={changePage} onLimitChange={changeLimit} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Registrasi Jemaah Baru" : "Edit Data Jemaah"} size="max-w-4xl">
                <form onSubmit={handleSubmit}>
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                        <TabButton id="pribadi" label="Data Pribadi" icon={User} />
                        <TabButton id="keluarga" label="Keluarga" icon={Users} />
                        <TabButton id="kesehatan" label="Fisik & Kesehatan" icon={Activity} />
                        <TabButton id="dokumen" label="Dokumen" icon={FileText} />
                    </div>

                    <div className="max-h-[65vh] overflow-y-auto px-1 custom-scrollbar">
                        {/* TAB 1: DATA PRIBADI */}
                        {activeTab === 'pribadi' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="label">Nama Lengkap</label><input className="input-field" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required /></div>
                                    <div><label className="label">Nama Arab (Opsional)</label><input className="input-field" value={formData.full_name_ar} onChange={e => setFormData({...formData, full_name_ar: e.target.value})} /></div>
                                    <div><label className="label">NIK (KTP)</label><input className="input-field" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} /></div>
                                    <div><label className="label">Nomor Paspor</label><input className="input-field" value={formData.passport_number} onChange={e => setFormData({...formData, passport_number: e.target.value})} /></div>
                                    <div><label className="label">Jenis Kelamin</label><select className="input-field" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="label">Tempat Lahir</label><input className="input-field" value={formData.birth_place} onChange={e => setFormData({...formData, birth_place: e.target.value})} /></div>
                                        <div><label className="label">Tanggal Lahir</label><input type="date" className="input-field" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} /></div>
                                    </div>
                                    <div><label className="label">No. HP / WA</label><input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
                                    <div><label className="label">Email</label><input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                                    <div className="md:col-span-2"><label className="label">Alamat Lengkap</label><textarea className="input-field" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea></div>
                                    <div><label className="label">Kota Domisili</label><input className="input-field" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                                    <div><label className="label">Pekerjaan</label><input className="input-field" value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} /></div>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                                    <h4 className="font-bold text-blue-800 mb-2">Pilih Paket Perjalanan</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Paket</label>
                                            <select className="input-field" value={formData.package_id} onChange={handlePackageChange}>
                                                <option value="">-- Pilih Paket --</option>
                                                {packages?.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                                            </select>
                                        </div>
                                        <div><label className="label">Harga Deal (Rp)</label><input type="number" className="input-field font-bold" value={formData.package_price} onChange={e => setFormData({...formData, package_price: e.target.value})} /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: KELUARGA */}
                        {activeTab === 'keluarga' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="label">Nama Ayah Kandung</label><input className="input-field" value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} placeholder="Penting untuk visa" /></div>
                                    <div><label className="label">Nama Ibu Kandung</label><input className="input-field" value={formData.mother_name} onChange={e => setFormData({...formData, mother_name: e.target.value})} /></div>
                                    <div><label className="label">Nama Pasangan (Suami/Istri)</label><input className="input-field" value={formData.spouse_name} onChange={e => setFormData({...formData, spouse_name: e.target.value})} /></div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: KESEHATAN */}
                        {activeTab === 'kesehatan' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Ukuran Pakaian</label>
                                        <select className="input-field" value={formData.clothing_size} onChange={e => setFormData({...formData, clothing_size: e.target.value})}>
                                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="label">Nomor BPJS / Asuransi</label><input className="input-field" value={formData.bpjs_number} onChange={e => setFormData({...formData, bpjs_number: e.target.value})} /></div>
                                    <div className="md:col-span-2">
                                        <label className="label">Riwayat Penyakit</label>
                                        <textarea className="input-field" rows="3" value={formData.disease_history} onChange={e => setFormData({...formData, disease_history: e.target.value})} placeholder="Sebutkan jika ada alergi atau penyakit khusus..."></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: DOKUMEN */}
                        {activeTab === 'dokumen' && (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200 mb-4">
                                    Format file: JPG, PNG, atau PDF. Maksimal 2MB per file.
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="label">Scan KTP</label><input type="file" className="input-field" onChange={e => handleFileChange('ktp', e.target.files[0])} /></div>
                                    <div><label className="label">Scan KK</label><input type="file" className="input-field" onChange={e => handleFileChange('kk', e.target.files[0])} /></div>
                                    <div><label className="label">Scan Paspor</label><input type="file" className="input-field" onChange={e => handleFileChange('passport', e.target.files[0])} /></div>
                                    <div><label className="label">Pas Foto</label><input type="file" className="input-field" onChange={e => handleFileChange('photo', e.target.files[0])} /></div>
                                    <div><label className="label">Buku Nikah</label><input type="file" className="input-field" onChange={e => handleFileChange('buku_nikah', e.target.files[0])} /></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32" disabled={uploading}>{uploading ? 'Menyimpan...' : 'Simpan Data'}</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Jamaah;