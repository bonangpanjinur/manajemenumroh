import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { User, FileText, Upload, Trash2, Eye, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Jamaah = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/jamaah');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [activeTab, setActiveTab] = useState('biodata'); 
    
    // Updated Form State with PIC
    const initialForm = { 
        full_name: '', nik: '', passport_number: '', gender: 'L', 
        birth_place: '', birth_date: '', phone: '', email: '', 
        address: '', city: '', status: 'registered', pic: 'Pusat' 
    };
    const [form, setForm] = useState(initialForm);

    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchDocuments = async (jamaahId) => {
        try {
            const res = await api.get(`umh/v1/jamaah/${jamaahId}/documents`);
            if (res.data.success) setDocuments(res.data.data);
        } catch (e) { console.error("Gagal load dokumen", e); }
    };

    const handleEditClick = (item) => {
        setForm(item);
        setMode('edit');
        setIsModalOpen(true);
        setActiveTab('biodata');
        fetchDocuments(item.uuid || item.id);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post('umh/v1/jamaah', form);
                toast.success("Jemaah berhasil didaftarkan");
            } else {
                const id = form.uuid || form.id;
                await api.put(`umh/v1/jamaah/${id}`, form);
                toast.success("Data jemaah diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };

    const handleUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', docType);
        
        setUploading(true);
        try {
            const id = form.uuid || form.id;
            await api.post(`umh/v1/jamaah/${id}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Dokumen diupload!");
            fetchDocuments(id);
        } catch (e) { 
            toast.error("Gagal upload: " + e.message); 
        } finally { 
            setUploading(false); 
        }
    };

    const handleDeleteDoc = async (docId) => {
        if(!confirm("Hapus dokumen ini?")) return;
        try {
            await api.delete(`umh/v1/documents/${docId}`);
            fetchDocuments(form.uuid || form.id);
            toast.success("Dokumen dihapus");
        } catch (e) { toast.error("Gagal hapus"); }
    };

    const columns = [
        { header: 'Nama Lengkap', accessor: 'full_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.full_name}</div>
                <div className="text-xs text-gray-500">{r.nik ? `NIK: ${r.nik}` : 'NIK Belum ada'}</div>
            </div>
        )},
        { header: 'PIC / Agen', accessor: 'pic', render: r => (
            <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">
                <Briefcase size={12}/> {r.pic || 'Pusat'}
            </div>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div className="text-xs">
                <div>{r.phone}</div>
                <div className="text-gray-400">{r.city}</div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                r.status === 'active_jamaah' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}>
                {r.status.replace('_', ' ')}
            </span>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Jemaah</h1>
                    <p className="text-gray-500 text-sm">Database pusat jamaah dan manajemen dokumen perjalanan.</p>
                </div>
                <button onClick={() => { setForm(initialForm); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <User size={18}/> Tambah Manual
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={handleEditClick} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Jemaah">
                <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('biodata')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'biodata' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Biodata</button>
                    {mode === 'edit' && (
                        <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Dokumen & Visa</button>
                    )}
                </div>

                {activeTab === 'biodata' ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded border border-blue-100">
                            <label className="label text-blue-800">Penanggung Jawab (PIC)</label>
                            <input 
                                className="input-field border-blue-300" 
                                value={form.pic} 
                                onChange={e => setForm({...form, pic: e.target.value})} 
                                placeholder="Nama Sales / Agen / Pusat"
                            />
                            <p className="text-[10px] text-blue-500 mt-1">*Jika kosong, otomatis diset "Pusat".</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Nama Lengkap (Sesuai KTP)</label>
                                <input className="input-field" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="label">Nomor Paspor</label>
                                <input className="input-field" value={form.passport_number} onChange={e => setForm({...form, passport_number: e.target.value})} placeholder="X000000" />
                            </div>
                            <div>
                                <label className="label">Jenis Kelamin</label>
                                <select className="input-field" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">No. Telepon</label>
                                <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="label">Alamat Lengkap</label>
                            <textarea className="input-field" value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows="2"></textarea>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button type="submit" className="btn-primary">Simpan Perubahan</button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['passport', 'ktp', 'photo', 'vaccine', 'visa_file'].map(type => {
                                const doc = documents.find(d => d.doc_type === type);
                                const labels = { passport: 'Scan Paspor', ktp: 'KTP', photo: 'Pas Foto', vaccine: 'Sertifikat Vaksin', visa_file: 'E-Visa (PDF)' };
                                
                                return (
                                    <div key={type} className="border rounded-lg p-3 flex justify-between items-center bg-gray-50">
                                        <div>
                                            <div className="text-sm font-bold text-gray-700">{labels[type]}</div>
                                            {doc ? (
                                                <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                                    <CheckCircle size={12}/> Terupload
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-red-400 mt-1">Belum ada file</div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {doc ? (
                                                <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 bg-white border rounded hover:bg-red-50 text-red-500">
                                                    <Trash2 size={16}/>
                                                </button>
                                            ) : (
                                                <label className={`p-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 flex items-center gap-1 text-xs ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <Upload size={14}/> Upload
                                                    <input type="file" disabled={uploading} className="hidden" onChange={(e) => handleUpload(e, type)} accept="image/*,application/pdf" />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Jamaah;