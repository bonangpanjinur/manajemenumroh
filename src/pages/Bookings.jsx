import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { 
    PlusIcon, 
    PrinterIcon, 
    DocumentTextIcon, 
    CurrencyDollarIcon,
    BriefcaseIcon,
    UserIcon
} from '@heroicons/react/24/outline';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings');
            setBookings(res);
        } catch (error) {
            console.error(error);
            setAlert({ type: 'error', message: 'Gagal memuat data booking' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handlePrintClick = (booking) => {
        setSelectedBooking(booking);
        setIsPrintModalOpen(true);
    };

    const handleGenerateDocument = async (type) => {
        if (!selectedBooking) return;
        
        // Membuka jendela baru untuk proses cetak
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><body><h3 style="text-align:center;">Memproses Dokumen... Mohon Tunggu.</h3></body></html>');

        try {
            const res = await api.get(`/documents/generate?type=${type}&id=${selectedBooking.id}`);
            if (res.html) {
                printWindow.document.open();
                printWindow.document.write(res.html);
                printWindow.document.close();
            } else {
                printWindow.close();
                setAlert({ type: 'error', message: 'Gagal menghasilkan dokumen' });
            }
        } catch (error) {
            printWindow.close();
            console.error(error);
            setAlert({ type: 'error', message: 'Terjadi kesalahan saat mencetak' });
        }
    };

    return (
        <Layout title="Manajemen Booking & Transaksi">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Data Booking</h2>
                    <p className="text-sm text-gray-500">Kelola pendaftaran jamaah dan status pembayaran.</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Booking Baru
                </button>
            </div>

            {/* Table Content */}
            {loading ? (
                <Spinner />
            ) : bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">Belum ada data booking.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jamaah (Kontak)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keberangkatan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Harga</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-600 font-bold">
                                        {booking.booking_code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="font-medium">{booking.contact_person_name || booking.contact_name}</div>
                                        <div className="text-xs text-gray-500">{booking.contact_phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.package_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(booking.departure_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                        {formatCurrency(booking.total_price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handlePrintClick(booking)}
                                            className="text-gray-600 hover:text-indigo-900 flex items-center justify-end w-full"
                                            title="Cetak Dokumen"
                                        >
                                            <PrinterIcon className="h-5 w-5 mr-1" /> Cetak
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Cetak Dokumen */}
            {isPrintModalOpen && selectedBooking && (
                <Modal title={`Cetak Dokumen: ${selectedBooking.booking_code}`} onClose={() => setIsPrintModalOpen(false)}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <button
                            onClick={() => handleGenerateDocument('receipt')}
                            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition border-indigo-200 bg-indigo-50"
                        >
                            <CurrencyDollarIcon className="h-8 w-8 text-indigo-600 mr-3" />
                            <div className="text-left">
                                <h4 className="font-bold text-gray-900">Kwitansi Pembayaran</h4>
                                <p className="text-xs text-gray-500">Cetak bukti pembayaran terakhir atau total.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleGenerateDocument('payment_history')}
                            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <DocumentTextIcon className="h-8 w-8 text-gray-600 mr-3" />
                            <div className="text-left">
                                <h4 className="font-bold text-gray-900">Riwayat Mutasi</h4>
                                <p className="text-xs text-gray-500">Laporan detail semua transaksi masuk.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleGenerateDocument('passport_rec')}
                            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <UserIcon className="h-8 w-8 text-green-600 mr-3" />
                            <div className="text-left">
                                <h4 className="font-bold text-gray-900">Rekomendasi Paspor</h4>
                                <p className="text-xs text-gray-500">Surat pengantar ke Kantor Imigrasi.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleGenerateDocument('leave_permit')}
                            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <BriefcaseIcon className="h-8 w-8 text-orange-600 mr-3" />
                            <div className="text-left">
                                <h4 className="font-bold text-gray-900">Surat Izin Cuti</h4>
                                <p className="text-xs text-gray-500">Surat permohonan cuti kerja untuk jamaah.</p>
                            </div>
                        </button>
                    </div>
                    <div className="mt-6 text-center text-xs text-gray-400">
                        Dokumen akan terbuka di tab baru dan otomatis memunculkan dialog print.
                    </div>
                </Modal>
            )}
        </Layout>
    );
}