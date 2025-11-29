import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; 
import { Plus, Wallet, CheckCircle, Clock, DollarSign, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Finance = () => {
    const { data, loading, fetchData, createItem, deleteItem } = useCRUD('umh/v1/payments');
    const [jamaahList, setJamaahList] = useState([]);
    const [stats, setStats] = useState({ income: 0, outstanding: 0 });

    // Initial Load
    useEffect(() => { 
        fetchData(); 
        // Load Data Jamaah untuk Dropdown (Hanya nama & id)
        api.get('umh/v1/jamaah').then(res => setJamaahList(res.data || res)).catch(()=>[]);
    }, [fetchData]);

    // Hitung statistik sederhana di client (bisa dipindah ke backend nanti)
    useEffect(() => {
        if(data) {
            const income = data.reduce((acc, curr) => curr.status === 'verified' ? acc + parseFloat(curr.amount) : acc, 0);
            setStats({ income, outstanding: 0 }); // Outstanding butuh data tagihan paket, nanti diimplementasi
        }
    }, [data]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const initialForm = {
        jamaah_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'transfer',
        status: 'verified',
        notes: ''
    };
    const [formData, setFormData] = useState(initialForm);
    const [selectedJamaahDetail, setSelectedJamaahDetail] = useState(null);

    const handleSelectJamaah = (e) => {
        const id = e.target.value;
        setFormData({...formData, jamaah_id: id});
        const detail = jamaahList.find(j => String(j.id) === String(id));
        setSelectedJamaahDetail(detail);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (await createItem(formData)) {
            setIsModalOpen(false);
            setFormData(initialForm);
            setSelectedJamaahDetail(null);
        }
    };

    const handlePrintReceipt = (id) => {
        // Membuka tab baru ke endpoint cetak PHP (api-print.php)
        const url = `${window.umhData.siteUrl}/wp-json/umh/v1/print/receipt?ids=${id}`;
        window.open(url, '_blank');
    };

    const columns = [
        { header: 'Tanggal', accessor: 'payment_date', render: r => <span className="text-gray-600 text-sm">{formatDate(r.payment_date)}</span> },
        { header: 'Jemaah', accessor: 'jamaah_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.jamaah_name}</div>
                <div className="text-xs text-gray-500">Paket: {r.package_name || '-'}</div>
            </div>
        )},
        { header: 'Jumlah', accessor: 'amount', render: r => <span className="font-bold text-green-700 text-base">{formatCurrency(r.amount)}</span> },
        { header: 'Metode', accessor: 'payment_method', render: r => <span className="uppercase text-xs font-semibold bg-gray-100 px-2 py-1 rounded border border-gray-200">{r.payment_method}</span> },
        { header: 'Status', accessor: 'status', render: r => (
            r.status === 'verified' 
            ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full w-fit"><CheckCircle size={12}/> Diterima</span> 
            : <span className="flex items-center gap-1 text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full w-fit"><Clock size={12}/> Menunggu</span>
        )},
        { header: 'Cetak', accessor: 'id', render: r => (
            <button onClick={() => handlePrintReceipt(r.id)} className="text-gray-500 hover:text-blue-600" title="Cetak Kwitansi">
                <Printer size={18} />
            </button>
        )}
    ];

    return (
        <Layout title="Keuangan & Kasir">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center justify-between">
                    <div>
                        <div className="text-gray-500 text-sm mb-1">Total Pemasukan (Terverifikasi)</div>
                        <div className="text-2xl font-bold text-blue-700">{formatCurrency(stats.income)}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600"><DollarSign size={24}/></div>
                </div>
                {/* Placeholder untuk fitur lanjutan */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-70">
                    <div className="text-gray-500 text-sm mb-1">Piutang / Belum Lunas</div>
                    <div className="text-2xl font-bold text-gray-800">Coming Soon</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2"><Wallet size={20}/> Riwayat Transaksi</h3>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex gap-2 shadow-md">
                        <Plus size={18}/> Catat Pembayaran
                    </button>
                </div>
                
                <CrudTable columns={columns} data={data} loading={loading} onDelete={deleteItem} />
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catat Pembayaran Jemaah" size="max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="label">Cari Jemaah</label>
                        <select className="input-field" value={formData.jamaah_id} onChange={handleSelectJamaah} required>
                            <option value="">-- Pilih Jemaah --</option>
                            {jamaahList.map(j => (
                                <option key={j.id} value={j.id}>{j.full_name} - {j.package_name || 'Tanpa Paket'}</option>
                            ))}
                        </select>
                    </div>

                    {selectedJamaahDetail && (
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900 border border-blue-200">
                            <div className="flex justify-between mb-1"><span>Paket:</span> <span className="font-semibold">{selectedJamaahDetail.package_name || '-'}</span></div>
                            <div className="flex justify-between"><span>Total Tagihan Paket:</span> <span className="font-bold">{formatCurrency(selectedJamaahDetail.package_price || 0)}</span></div>
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
                                <option value="edc">Kartu Debit/Kredit</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Jumlah Pembayaran (Rp)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">Rp</span>
                            <input type="number" className="input-field pl-10 text-lg font-bold text-green-700" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" required />
                        </div>
                    </div>

                    <div>
                        <label className="label">Catatan / No. Referensi</label>
                        <textarea className="input-field" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Contoh: Pelunasan tahap 1, atau No Ref Bank..."></textarea>
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