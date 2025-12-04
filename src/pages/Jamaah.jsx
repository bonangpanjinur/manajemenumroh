import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, User, FileText, Trash, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const Jamaah = () => {
    // Menggunakan endpoint master jamaah
    const { data, loading, pagination, fetchData, deleteItem, changePage, changeLimit } = useCRUD('umh/v1/jamaah');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [activeTab, setActiveTab] = useState('pribadi');
    const [uploading, setUploading] = useState(false);

    const initialForm = {
        full_name: '', full_name_ar: '', nik: '', passport_number: '',
        gender: 'L', birth_place: '', birth_date: '',
        phone: '', email: '', address: '', city: '', 
        clothing_size: 'L', disease_history: '', 
        father_name: '', mother_name: '', spouse_name: ''
    };
    
    const [formData, setFormData] = useState(initialForm);
    const [files, setFiles] = useState({ ktp: null, passport: null, photo: null });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (type, file) => setFiles(prev => ({ ...prev, [type]: file }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let savedId = formData.id;
            const apiPath = 'umh/v1/jamaah';
            
            // 1. Simpan Data Teks
            if (modalMode === 'create') {
                const res = await api.post(apiPath, formData);
                // Handle jika response mengembalikan id langsung atau dalam object data
                savedId = res.id || (res.data && res.data.id);
            } else {
                await api.put(`${apiPath}/${savedId}`, formData);
            }
            
            if (!savedId) throw new Error("Gagal mendapatkan ID Jemaah untuk upload file.");

            // 2. Upload File (Jika ada file baru dipilih)
            const uploadPromises = [];
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    // Pastikan api.upload menghandle POST multipart/form-data
                    uploadPromises.push(api.upload(files[key], `scan_${key}`, savedId));
                }
            });

            if (uploadPromises.length > 0) {
                setUploading(true);
                await Promise.all(uploadPromises);
            }

            toast.success(modalMode === 'create' ? 'Jemaah berhasil didaftarkan!' : 'Data berhasil diperbarui!');
            setIsModalOpen(false);
            fetchData(); 
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Terjadi kesalahan saat menyimpan.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!item || !item.id) return;
        if (window.confirm("Yakin hapus data ini? Jemaah yang sudah pernah booking tidak bisa dihapus.")) {
            const success = await deleteItem(item.id);
            if (success) toast.success("Data jemaah dihapus.");
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setFormData(item || initialForm);
        setFiles({ ktp: null, passport: null, photo: null });
        setActiveTab('pribadi');
        setIsModalOpen(true);
    };

    const columns = [
        { header: 'Nama Lengkap', accessor: 'full_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.full_name}</div>
                <div className="text-xs text-gray-500">{r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
            </div>
        )},
        { header: 'Identitas', accessor: 'nik', render: r => (
            <div className="text-xs font-mono text-gray-600">
                <div>NIK: {r.nik || '-'}</div>
                <div>Paspor: {r.passport_number || '-'}</div>
            </div>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div>
                <div className="text-sm text-gray-700">{r.phone}</div>
                <div className="text-xs text-gray-400">{r.city}</div>
            </div>
        )},
        { header: 'Dokumen', accessor: 'id', render: r => (
            <div className="flex gap-2">
                <span title="KTP" className={r.scan_ktp ? "text-green-500" : "text-gray-300"}><FileText size={16}/></span>
                <span title="Paspor" className={r.scan_passport ? "text-green-500" : "text-gray-300"}><FileText size={16}/></span>
            </div>
        )},
    ];

    const TabButton = ({ id, label, icon: Icon }) => (
        <button type="button" onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            <Icon size={16} /> {label}
        </button>
    );

    return (
        <Layout title="Database Jemaah (Master Data)">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput onSearch={(q) => fetchData({ search: q })} placeholder="Cari nama, NIK, atau paspor..." />
                </div>
                <button onClick={() => openModal('create')} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200">
                    <Plus size={18}/> Tambah Jemaah Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onDelete={handleDelete} 
                    onEdit={(item) => openModal('edit', item)} 
                    actionLabel="Aksi"
                />
                <Pagination pagination={pagination} onPageChange={changePage} onLimitChange={changeLimit} />
            </div>

            {/* MODAL INPUT JEMAAH */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Input Biodata Jemaah" : "Edit Biodata Jemaah"} size="max-w-4xl">
                <form onSubmit={handleSubmit}>
                    <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                        <TabButton id="pribadi" label="Data Pribadi" icon={User} />
                        <TabButton id="dokumen" label="Upload Dokumen" icon={FileText} />
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto px-1 custom-scrollbar pb-4">
                        {activeTab === 'pribadi' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                                <div><label className="label">Nama Lengkap (Sesuai KTP)</label><input name="full_name" className="input-field" value={formData.full_name} onChange={handleChange} required /></div>
                                <div><label className="label">Nama di Paspor (Opsional)</label><input name="full_name_ar" className="input-field" value={formData.full_name_ar} onChange={handleChange} placeholder="Sesuai buku paspor" /></div>
                                
                                <div><label className="label">NIK (KTP)</label><input name="nik" className="input-field" value={formData.nik} onChange={handleChange} /></div>
                                <div><label className="label">Nomor Paspor</label><input name="passport_number" className="input-field" value={formData.passport_number} onChange={handleChange} /></div>
                                
                                <div><label className="label">Jenis Kelamin</label><select name="gender" className="input-field" value={formData.gender} onChange={handleChange}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                                <div><label className="label">No. WhatsApp</label><input name="phone" className="input-field" value={formData.phone} onChange={handleChange} required /></div>

                                <div><label className="label">Tempat Lahir</label><input name="birth_place" className="input-field" value={formData.birth_place} onChange={handleChange} /></div>
                                <div><label className="label">Tanggal Lahir</label><input type="date" name="birth_date" className="input-field" value={formData.birth_date} onChange={handleChange} /></div>

                                <div className="md:col-span-2"><label className="label">Alamat Lengkap</label><textarea name="address" className="input-field h-20" value={formData.address} onChange={handleChange}></textarea></div>
                                
                                <div><label className="label">Kota/Kabupaten</label><input name="city" className="input-field" value={formData.city} onChange={handleChange} /></div>
                                <div><label className="label">Ukuran Baju</label><select name="clothing_size" className="input-field" value={formData.clothing_size} onChange={handleChange}><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option></select></div>
                                
                                <div><label className="label">Nama Ayah Kandung</label><input name="father_name" className="input-field" value={formData.father_name} onChange={handleChange} /></div>
                                <div><label className="label">Riwayat Penyakit</label><input name="disease_history" className="input-field" value={formData.disease_history} onChange={handleChange} placeholder="Kosongkan jika sehat" /></div>
                            </div>
                        )}

                        {activeTab === 'dokumen' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-200 mb-4">
                                    Format file: JPG/PNG/PDF. Maksimal 2MB per file.
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border p-4 rounded-lg bg-gray-50">
                                        <label className="label font-bold mb-2 uppercase">Scan KTP</label>
                                        <input type="file" className="block w-full text-sm" onChange={e => handleFileChange('ktp', e.target.files[0])} accept="image/*,application/pdf" />
                                        {formData.scan_ktp && <a href={formData.scan_ktp} target="_blank" className="text-xs text-blue-600 mt-2 block hover:underline">Lihat File Saat Ini</a>}
                                    </div>
                                    <div className="border p-4 rounded-lg bg-gray-50">
                                        <label className="label font-bold mb-2 uppercase">Scan Paspor</label>
                                        <input type="file" className="block w-full text-sm" onChange={e => handleFileChange('passport', e.target.files[0])} accept="image/*,application/pdf" />
                                        {formData.scan_passport && <a href={formData.scan_passport} target="_blank" className="text-xs text-blue-600 mt-2 block hover:underline">Lihat File Saat Ini</a>}
                                    </div>
                                    <div className="border p-4 rounded-lg bg-gray-50">
                                        <label className="label font-bold mb-2 uppercase">Pas Foto Terbaru</label>
                                        <input type="file" className="block w-full text-sm" onChange={e => handleFileChange('photo', e.target.files[0])} accept="image/*" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4 bg-white sticky bottom-0">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'Mengupload...' : 'Simpan Data'}</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Jamaah;