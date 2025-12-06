import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { User, FileText, Upload, Trash2, Eye, CheckCircle, AlertCircle, Briefcase, Calendar, DollarSign, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Jamaah = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/jamaah');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [activeTab, setActiveTab] = useState('biodata'); 
    
    const initialForm = { 
        full_name: '', nik: '', passport_number: '', gender: 'L', 
        birth_place: '', birth_date: '', phone: '', email: '', 
        address: '', city: '', status: 'registered', pic: 'Pusat' 
    };
    const [form, setForm] = useState(initialForm);

    const [documents, setDocuments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

    const fetchDetails = async (id) => {
        try {
            const res = await api.get(`umh/v1/jamaah/${id}/details`);
            if (res.data.success) {
                setForm(res.data.data);
                setDocuments(res.data.data.documents || []);
                setBookings(res.data.data.bookings || []);
            }
        } catch (e) { toast.error("Gagal memuat detail jemaah"); }
    };

    const handleEditClick = (item) => {
        setMode('edit');
        setIsModalOpen(true);
        setActiveTab('biodata');
        fetchDetails(item.uuid || item.id);
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
            fetchDetails(id); // Reload details
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
            fetchDetails(form.uuid || form.id); // Reload details
            toast.success("Dokumen dihapus");
        } catch (e) { toast.error("Gagal hapus"); }
    };

    const columns = [
        { header: 'Nama Lengkap', accessor: 'full_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.full_name}</div>
                <div className="text-xs text-gray-500">{r.passport_number ? `Paspor: ${r.passport_number}` : 'No Paspor Belum Ada'}</div>
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
                <div className="text-gray-400">{r.email}</div>
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

    const DocumentRow = ({ type, label }) => {
        const doc = documents.find(d => d.doc_type === type);
        const statusColor = doc ? (doc.status === 'pending' ? 'text-yellow-600' : 'text-green-600') : 'text-red-500';

        return (
            <div className="border-b py-3 flex justify-between items-center">
                <div className="text-sm font-medium text-gray-800">{label}</div>
                <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium ${statusColor}`}>
                        {doc ? doc.status.toUpperCase() : 'BELUM ADA'}
                    </span>
                    <div className="flex gap-2">
                        {doc && (
                             <a href={doc.file_path} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                                <Eye size={16}/>
                            </a>
                        )}
                        <label className={`p-2 rounded cursor-pointer flex items-center gap-1 text-xs ${uploading ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                            <Upload size={14}/> 
                            <input type="file" disabled={uploading} className="hidden" onChange={(e) => handleUpload(e, type)} accept="image/*,application/pdf" />
                        </label>
                        {doc && (
                            <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100">
                                <Trash2 size={16}/>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Data Jemaah</h1>
                <button onClick={() => { setForm(initialForm); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <User size={18}/> Tambah Manual
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={handleEditClick} onDelete={deleteItem} />
            </div>

            {/* Modal Detail Jemaah */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Jemaah" size="max-w-4xl">
                {loading ? <Spinner /> : (
                    <>
                        <div className="flex border-b mb-4">
                            <button onClick={() => setActiveTab('biodata')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'biodata' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Biodata</button>
                            {mode === 'edit' && (
                                <>
                                    <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Dokumen & Visa</button>
                                    <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Riwayat Booking</button>
                                </>
                            )}
                        </div>

                        {/* TAB 1: BIODATA */}
                        {activeTab === 'biodata' && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded border border-blue-100 grid grid-cols-3 gap-4">
                                    <div><label className="label text-blue-800">Nama PIC</label><input className="input-field border-blue-300" value={form.pic} onChange={e => setForm({...form, pic: e.target.value})} placeholder="Sales / Agen / Pusat"/></div>
                                    <div><label className="label text-blue-800">NIK</label><input className="input-field border-blue-300" value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} placeholder="NIK KTP"/></div>
                                    <div><label className="label text-blue-800">No. Paspor</label><input className="input-field border-blue-300" value={form.passport_number} onChange={e => setForm({...form, passport_number: e.target.value})} placeholder="X000000"/></div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="label">Nama Lengkap</label><input className="input-field" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required /></div>
                                    <div><label className="label">Jenis Kelamin</label><select className="input-field" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                                    <div><label className="label">Email</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/></div>
                                    <div><label className="label">No. Telepon</label><input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                                </div>
                                <div className="col-span-2"><label className="label">Alamat Lengkap</label><textarea className="input-field" value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows="2"></textarea></div>

                                <div className="flex justify-end pt-4 border-t"><button type="submit" className="btn-primary">Simpan Perubahan</button></div>
                            </form>
                        )}

                        {/* TAB 2: DOKUMEN */}
                        {activeTab === 'documents' && (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                                <DocumentRow type="passport_file" label="Scan Paspor" />
                                <DocumentRow type="ktp_file" label="Scan KTP" />
                                <DocumentRow type="photo_file" label="Pas Foto 4x6" />
                                <DocumentRow type="vaccine_cert" label="Sertifikat Vaksin" />
                                <DocumentRow type="visa_file" label="E-Visa (Jika Ada)" />
                            </div>
                        )}

                        {/* TAB 3: RIWAYAT BOOKING */}
                        {activeTab === 'bookings' && (
                            <div className="space-y-4">
                                {bookings.length === 0 ? (
                                    <div className="text-gray-500 italic p-4 border rounded">Jemaah ini belum memiliki booking aktif.</div>
                                ) : (
                                    <div className="bg-white rounded-lg border overflow-hidden">
                                        <table className="min-w-full text-sm text-left">
                                            <thead>
                                                <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                                                    <th className="px-4 py-3">Kode Booking</th>
                                                    <th className="px-4 py-3">Paket & Tgl</th>
                                                    <th className="px-4 py-3">Total Tagihan</th>
                                                    <th className="px-4 py-3">Status Bayar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookings.map(b => (
                                                    <tr key={b.id} className="border-b hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-bold text-blue-600">{b.booking_code}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div>{b.package_name}</div>
                                                            <div className="text-xs flex items-center gap-1 text-gray-500"><Calendar size={12}/> {new Date(b.departure_date).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono">{formatIDR(b.total_price)}</td>
                                                        <td className="px-4 py-3 text-xs">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${b.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {b.payment_status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
};

export default Jamaah;