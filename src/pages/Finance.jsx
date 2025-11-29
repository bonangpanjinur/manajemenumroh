import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; // Pastikan utils/api.js ada
import { Plus, Wallet, FileText, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Finance = () => {
    // Menggunakan endpoint 'payments'
    const { data, loading, fetchData, createItem, deleteItem } = useCRUD('umh/v1/payments');
    const [jamaahList, setJamaahList] = useState([]);
    const [searchJamaah, setSearchJamaah] = useState('');

    useEffect(() => { 
        fetchData(); 
        // Load jamaah ringkas untuk dropdown
        api.get('umh/v1/jamaah?status=registered').then(res => setJamaahList(res.data || res)).catch(()=>[]);
    }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form Pembayaran
    const initialForm = {
        jamaah_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'transfer', // transfer, cash, qris
        status: 'verified', // verified, pending
        notes: ''
    };
    const [formData, setFormData] = useState(initialForm);
    const [selectedJamaahDetail, setSelectedJamaahDetail] = useState(null);

    // Saat memilih jemaah, kita ambil detail tagihannya (simulasi)
    const handleSelectJamaah = (e) => {
        const id = e.target.value;
        setFormData({...formData, jamaah_id: id});
        const detail = jamaahList.find(j => String(j.id) === String(id));
        setSelectedJamaahDetail(detail);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData(initialForm);
            setSelectedJamaahDetail(null);
            toast.success("Pembayaran berhasil dicatat");
        }
    };

    const columns = [
        { header: 'Tanggal', accessor: 'payment_date', render: r => <span className="text-gray-600 text-sm">{formatDate(r.payment_date)}</span> },
        { header: 'Jemaah', accessor: 'jamaah_name', render: r => (
            <div>
                <div className="font-bold">{r.jamaah_name}</div>
                <div className="text-xs text-gray-500">ID: {r.jamaah_id}</div>
            </div>
        )},
        { header: 'Jumlah', accessor: 'amount', render: r => <span className="font-bold text-green-700">{formatCurrency(r.amount)}</span> },
        { header: 'Metode', accessor: 'payment_method', render: r => <span className="uppercase text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{r.payment_method}</span> },
        { header: 'Status', accessor: 'status', render: r => (
            r.status === 'verified' 
            ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle size={12}/> Diterima</span> 
            : <span className="flex items-center gap-1 text-orange-600 text-xs font-bold"><Clock size={12}/> Menunggu</span>
        )}
    ];

    return (
        <Layout title="Keuangan & Pembayaran">
            {/* Summary Cards (Dummy Data for UI) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-gray-500 text-sm mb-1">Total Pemasukan (Bulan Ini)</div>
                    <div className="text-2xl font-bold text-blue-700">Rp 1.250.000.000</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                    <div className="text-gray-500 text-sm mb-1">Tagihan Belum Lunas</div>
                    <div className="text-2xl font-bold text-orange-600">Rp 450.000.000</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                    <div className="text-gray-500 text-sm mb-1">Transaksi Berhasil</div>
                    <div className="text-2xl font-bold text-green-700">142 Transaksi</div>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center bg-white p-3 rounded-lg border">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Wallet size={20}/> Riwayat Transaksi</h3>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex gap-2">
                    <Plus size={18}/> Catat Pembayaran
                </button>
            </div>
            
            <CrudTable columns={columns} data={data} loading={loading} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catat Pembayaran Jemaah" size="max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Pilih Jemaah */}
                    <div>
                        <label className="label">Cari Jemaah</label>
                        <select className="input-field" value={formData.jamaah_id} onChange={handleSelectJamaah} required>
                            <option value="">-- Pilih Jemaah --</option>
                            {jamaahList.map(j => (
                                <option key={j.id} value={j.id}>{j.full_name} - {j.package_name || 'Tanpa Paket'}</option>
                            ))}
                        </select>
                    </div>

                    {/* Detail Tagihan (Jika Jemaah dipilih) */}
                    {selectedJamaahDetail && (
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
                            <div><strong>Paket:</strong> {selectedJamaahDetail.package_name}</div>
                            <div><strong>Total Tagihan:</strong> {formatCurrency(selectedJamaahDetail.package_price || 0)}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tanggal Bayar</label>
                            <input type="date" className="input-field" value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="label">Metode Pembayaran</label>
                            <select className="input-field" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                                <option value="transfer">Transfer Bank</option>
                                <option value="cash">Tunai / Cash</option>
                                <option value="qris">QRIS</option>
                                <option value="edc">Kartu Debit/Kredit (EDC)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Jumlah Pembayaran (Rp)</label>
                        <input type="number" className="input-field text-lg font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" required />
                    </div>

                    <div>
                        <label className="label">Catatan / Referensi</label>
                        <textarea className="input-field" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="No. Referensi Transfer / Keterangan"></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-full md:w-auto">Simpan Transaksi</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Finance;