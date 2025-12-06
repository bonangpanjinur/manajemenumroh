import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Calendar, CreditCard, CheckCircle, Clock, Upload, FileText, Eye, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Bookings = () => {
    const { data, loading, fetchData } = useCRUD('umh/v1/bookings');
    const [viewMode, setViewMode] = useState('list'); // list | verify
    
    // State Modals
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [proofHistory, setProofHistory] = useState([]);
    
    // State Forms
    const [paymentForm, setPaymentForm] = useState({ amount: 0, bank_destination: 'BCA', proof_file: '' });
    const [uploading, setUploading] = useState(false);

    const formatMoney = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n || 0);

    // 1. User/Agen: Buka Modal Bayar
    const handlePaymentClick = (booking) => {
        setSelectedBooking(booking);
        const remaining = parseFloat(booking.total_price) - parseFloat(booking.total_paid);
        setPaymentForm({ amount: remaining, bank_destination: 'BCA', proof_file: '' });
        setIsPaymentModalOpen(true);
    };

    // 2. Staff: Buka Modal Verifikasi
    const handleVerifyClick = async (booking) => {
        setSelectedBooking(booking);
        try {
            const res = await api.get(`umh/v1/bookings/${booking.id}/payment-proofs`);
            if(res.data.success) {
                setProofHistory(res.data.data);
                setIsVerifyModalOpen(true);
            }
        } catch(e) { toast.error("Gagal memuat history pembayaran"); }
    };

    // Aksi Upload Bukti
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            // Upload Temporary via Utility API dulu (Opsional, atau langsung ke endpoint booking)
            // Di sini kita langsung pakai endpoint booking agar atomik
            const bookingId = selectedBooking.uuid || selectedBooking.id;
            formData.append('amount', paymentForm.amount);
            formData.append('bank_destination', paymentForm.bank_destination);
            
            await api.post(`umh/v1/bookings/${bookingId}/upload-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success("Bukti berhasil diupload dan menunggu verifikasi!");
            setIsPaymentModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal: " + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    // Aksi Verifikasi (Approve/Reject)
    const submitVerification = async (proofId, action, notes='') => {
        if(!confirm(action === 'approve' ? "Terima pembayaran ini?" : "Tolak pembayaran ini?")) return;
        try {
            await api.post(`umh/v1/payments/${proofId}/verify`, { action, notes });
            toast.success(action === 'approve' ? "Pembayaran diterima!" : "Pembayaran ditolak.");
            setIsVerifyModalOpen(false);
            fetchData();
        } catch (e) {
            toast.error("Gagal: " + e.message);
        }
    };

    // Kolom Tabel
    const columns = [
        { header: 'Kode Booking', accessor: 'booking_code', render: r => (
            <div>
                <div className="font-bold text-blue-600 cursor-pointer hover:underline">{r.booking_code}</div>
                <div className="text-xs text-gray-500">{r.contact_name}</div>
            </div>
        )},
        { header: 'Tagihan', accessor: 'total_price', render: r => (
            <div className="font-mono text-sm">
                <div>{formatMoney(r.total_price)}</div>
                <div className="text-xs text-gray-400">Sisa: <span className="text-red-500">{formatMoney(r.total_price - r.total_paid)}</span></div>
            </div>
        )},
        { header: 'Status', accessor: 'payment_status', render: r => {
            const colors = { paid: 'bg-green-100 text-green-700', partial: 'bg-yellow-100 text-yellow-700', unpaid: 'bg-red-100 text-red-700' };
            return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${colors[r.payment_status]}`}>{r.payment_status}</span>
        }},
        { header: 'Verifikasi', accessor: 'status', render: r => (
            r.status === 'pending' ? 
            <span className="flex items-center gap-1 text-xs text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded border border-orange-200">
                <Clock size={12}/> Butuh Verifikasi
            </span> : <span className="text-gray-400 text-xs">-</span>
        )},
        { header: 'Aksi', accessor: 'id', render: r => (
            <div className="flex gap-2 justify-end">
                {/* Tombol User: Bayar */}
                {r.payment_status !== 'paid' && (
                    <button onClick={() => handlePaymentClick(r)} className="btn-secondary px-2 py-1 text-xs flex items-center gap-1">
                        <Upload size={12}/> Upload Bukti
                    </button>
                )}
                {/* Tombol Staff: Verifikasi */}
                <button onClick={() => handleVerifyClick(r)} className="btn-primary px-2 py-1 text-xs flex items-center gap-1">
                    <CheckCircle size={12}/> Cek Bukti
                </button>
            </div>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Transaksi & Pembayaran</h1>
                    <p className="text-gray-500 text-sm">Kelola pesanan masuk dan verifikasi bukti transfer manual.</p>
                </div>
                
                <div className="flex bg-white border rounded-lg p-1 shadow-sm">
                    <button onClick={()=>setViewMode('list')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${viewMode==='list'?'bg-blue-50 text-blue-600':'text-gray-500'}`}>Semua Data</button>
                    <button onClick={()=>setViewMode('verify')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${viewMode==='verify'?'bg-orange-50 text-orange-600':'text-gray-500'}`}>Perlu Verifikasi</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div><p className="text-sm text-gray-500">Total Booking</p><h3 className="text-xl font-bold">{data.length}</h3></div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><FileText size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div><p className="text-sm text-gray-500">Menunggu Verifikasi</p><h3 className="text-xl font-bold text-orange-600">{data.filter(i => i.status === 'pending').length}</h3></div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><Clock size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div><p className="text-sm text-gray-500">Sudah Lunas</p><h3 className="text-xl font-bold text-green-600">{data.filter(i => i.payment_status === 'paid').length}</h3></div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-full"><CheckCircle size={20}/></div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={viewMode === 'verify' ? data.filter(i => i.status === 'pending') : data} 
                    loading={loading} 
                    onDelete={() => {}} 
                />
            </div>

            {/* MODAL 1: UPLOAD BUKTI (USER/AGEN) */}
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Konfirmasi Pembayaran">
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded border border-blue-100 text-sm">
                        <p className="font-bold text-blue-800 mb-1">Instruksi Transfer:</p>
                        <ul className="list-disc pl-4 text-blue-700 space-y-1">
                            <li>Silakan transfer ke <b>BCA 1234567890</b> a.n PT Travel Umroh</li>
                            <li>Upload bukti transfer di bawah ini agar diproses Admin.</li>
                        </ul>
                    </div>
                    <div>
                        <label className="label">Nominal Transfer</label>
                        <input type="number" className="input-field text-lg font-bold" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
                    </div>
                    <div>
                        <label className="label">Bank Tujuan</label>
                        <select className="input-field" value={paymentForm.bank_destination} onChange={e => setPaymentForm({...paymentForm, bank_destination: e.target.value})}>
                            <option value="BCA">BCA - 1234567890</option>
                            <option value="Mandiri">Mandiri - 0987654321</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Bukti Foto (JPG/PNG/PDF)</label>
                        <input type="file" className="input-field pt-2" onChange={handleFileChange} disabled={uploading} accept="image/*,application/pdf"/>
                        {uploading && <p className="text-xs text-blue-500 mt-1 animate-pulse">Sedang mengupload...</p>}
                    </div>
                </div>
            </Modal>

            {/* MODAL 2: VERIFIKASI (STAFF FINANCE) */}
            <Modal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} title="Verifikasi Pembayaran" size="max-w-3xl">
                <div className="flex gap-6">
                    {/* Kiri: List History Bukti */}
                    <div className="w-1/2 space-y-3 border-r pr-4">
                        <h4 className="font-bold text-gray-700 mb-2">Riwayat Upload Bukti</h4>
                        {proofHistory.length === 0 && <p className="text-gray-400 italic text-sm">Belum ada bukti diupload.</p>}
                        
                        {proofHistory.map(proof => (
                            <div key={proof.id} className="border rounded p-3 bg-gray-50">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-gray-500">{new Date(proof.created_at).toLocaleString()}</span>
                                    <span className={`font-bold uppercase ${proof.status==='verified'?'text-green-600':'text-orange-600'}`}>{proof.status}</span>
                                </div>
                                <div className="font-bold text-gray-800 mb-1">{formatMoney(proof.amount)}</div>
                                <div className="text-xs text-gray-600 mb-3">via {proof.bank_destination}</div>
                                
                                <div className="mb-3">
                                    <a href={proof.file_url} target="_blank" rel="noreferrer" className="block w-full h-32 bg-gray-200 rounded overflow-hidden hover:opacity-80 transition relative group">
                                        <img src={proof.file_url} alt="Bukti" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-30 text-white font-bold text-xs">
                                            <Eye size={16} className="mr-1"/> Lihat Full
                                        </div>
                                    </a>
                                </div>

                                {proof.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => submitVerification(proof.id, 'approve')} className="flex-1 bg-green-600 text-white py-1.5 rounded text-xs font-bold hover:bg-green-700 flex justify-center gap-1">
                                            <Check size={14}/> Terima
                                        </button>
                                        <button onClick={() => submitVerification(proof.id, 'reject')} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-1.5 rounded text-xs font-bold hover:bg-red-100 flex justify-center gap-1">
                                            <X size={14}/> Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Kanan: Info Booking */}
                    <div className="w-1/2 pl-2">
                        <h4 className="font-bold text-gray-700 mb-4">Detail Booking</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Kode Booking</span>
                                <span className="font-mono font-bold text-blue-600">{selectedBooking?.booking_code}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Total Tagihan</span>
                                <span className="font-bold">{formatMoney(selectedBooking?.total_price)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Sudah Dibayar</span>
                                <span className="font-bold text-green-600">{formatMoney(selectedBooking?.total_paid)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Sisa Kekurangan</span>
                                <span className="font-bold text-red-600">{formatMoney(selectedBooking?.total_price - selectedBooking?.total_paid)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Bookings;