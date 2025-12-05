import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Calendar, CreditCard, CheckCircle, Clock, Upload, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const Bookings = () => {
    const { data, loading, fetchData } = useCRUD('umh/v1/bookings');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentForm, setPaymentForm] = useState({ amount: 0, payment_method: 'transfer', proof_file: '' });
    const [uploading, setUploading] = useState(false);

    const formatMoney = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n || 0);

    const handlePaymentClick = (booking) => {
        setSelectedBooking(booking);
        const remaining = parseFloat(booking.total_price) - parseFloat(booking.total_paid);
        setPaymentForm({ amount: remaining, payment_method: 'transfer', proof_file: '' });
        setIsPaymentModalOpen(true);
    };

    // Handler Upload File
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            // Upload ke endpoint baru
            const res = await api.post('umh/v1/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.success) {
                setPaymentForm(prev => ({ ...prev, proof_file: res.data.url }));
                toast.success("Bukti berhasil diupload!");
            }
        } catch (error) {
            toast.error("Gagal upload bukti: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const id = selectedBooking.uuid || selectedBooking.id;
            await api.post(`umh/v1/bookings/${id}/pay`, paymentForm);
            toast.success("Pembayaran berhasil dicatat & menunggu verifikasi!");
            setIsPaymentModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal: " + (error.response?.data?.message || error.message));
        }
    };

    const columns = [
        { header: 'Kode Booking', accessor: 'booking_code', render: r => (
            <div>
                <div className="font-bold text-blue-600">{r.booking_code}</div>
                <div className="text-xs text-gray-500">{r.contact_name}</div>
            </div>
        )},
        { header: 'Tanggal', accessor: 'booking_date', render: r => (
            <span className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar size={12}/> {new Date(r.booking_date).toLocaleDateString('id-ID')}
            </span>
        )},
        { header: 'Total Harga', accessor: 'total_price', render: r => (
            <div className="font-mono text-sm">
                <div>{formatMoney(r.total_price)}</div>
                <div className="text-xs text-gray-400">Pax: {r.total_pax} Org</div>
            </div>
        )},
        { header: 'Status Bayar', accessor: 'payment_status', render: r => {
            const statusColors = {
                paid: 'bg-green-100 text-green-700',
                partial: 'bg-yellow-100 text-yellow-700',
                dp: 'bg-blue-100 text-blue-700',
                unpaid: 'bg-red-100 text-red-700'
            };
            const paidPercent = (parseFloat(r.total_paid) / parseFloat(r.total_price)) * 100;
            
            return (
                <div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${statusColors[r.payment_status] || 'bg-gray-100'}`}>
                        {r.payment_status}
                    </span>
                    <div className="w-24 h-1 bg-gray-200 rounded-full mt-1">
                        <div className="h-1 bg-green-500 rounded-full" style={{ width: `${paidPercent}%` }}></div>
                    </div>
                </div>
            );
        }},
        { header: 'Aksi', accessor: 'id', render: r => (
            <div className="flex gap-2">
                {r.payment_status !== 'paid' && (
                    <button 
                        onClick={() => handlePaymentClick(r)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium flex items-center gap-1"
                    >
                        <CreditCard size={14}/> Bayar
                    </button>
                )}
            </div>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Transaksi Booking</h1>
                    <p className="text-gray-500 text-sm">Pantau pesanan masuk dan status pembayaran.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Clock size={24}/></div>
                    <div>
                        <div className="text-sm text-gray-500">Menunggu Bayar</div>
                        <div className="text-xl font-bold text-gray-800">
                            {data.filter(i => i.payment_status === 'unpaid').length}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24}/></div>
                    <div>
                        <div className="text-sm text-gray-500">Lunas (Paid)</div>
                        <div className="text-xl font-bold text-gray-800">
                            {data.filter(i => i.payment_status === 'paid').length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onDelete={() => {}} />
            </div>

            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Konfirmasi Pembayaran`}>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                        <div className="flex justify-between font-bold">
                            <span>Sisa Tagihan:</span>
                            <span>{formatMoney(parseFloat(selectedBooking?.total_price || 0) - parseFloat(selectedBooking?.total_paid || 0))}</span>
                        </div>
                    </div>

                    <div>
                        <label className="label">Nominal Pembayaran (Rp)</label>
                        <input 
                            type="number" 
                            className="input-field text-xl font-bold" 
                            value={paymentForm.amount} 
                            onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                            required 
                        />
                    </div>

                    <div>
                        <label className="label">Metode Pembayaran</label>
                        <select className="input-field" value={paymentForm.payment_method} onChange={e => setPaymentForm({...paymentForm, payment_method: e.target.value})}>
                            <option value="transfer">Transfer Bank</option>
                            <option value="cash">Tunai (Cash)</option>
                        </select>
                    </div>

                    {/* FIELD UPLOAD BUKTI */}
                    <div>
                        <label className="label">Bukti Transfer (Struk)</label>
                        <div className="mt-1 flex items-center gap-2">
                            <label className="btn-secondary cursor-pointer flex items-center gap-2">
                                <Upload size={16} /> 
                                {uploading ? "Mengupload..." : "Pilih File"}
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                            </label>
                            {paymentForm.proof_file && (
                                <a href={paymentForm.proof_file} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline flex items-center gap-1">
                                    <FileText size={12}/> Lihat Bukti
                                </a>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">*Format: JPG, PNG, PDF. Max 2MB.</p>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={uploading} className="btn-primary">
                            {uploading ? 'Processing...' : 'Kirim Pembayaran'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Bookings;