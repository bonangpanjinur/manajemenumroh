import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Minus, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const Finance = () => {
    // CRUD untuk Transaksi Keuangan
    const { data, loading, fetchData, createItem, deleteItem } = useCRUD('umh/v1/finance'); 
    
    // State untuk data relasi (Dropdown)
    const [jamaahList, setJamaahList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);

    // Fetch data transaksi & relasi saat load
    useEffect(() => { 
        fetchData(); 
        
        // Ambil data jemaah untuk dropdown pembayaran
        api.get('umh/v1/jamaah')
            .then(res => setJamaahList(Array.isArray(res) ? res : res.items || []))
            .catch(err => console.error("Gagal load jemaah", err));

        // Ambil data karyawan untuk dropdown gaji
        api.get('umh/v1/hr')
            .then(res => setEmployeeList(Array.isArray(res) ? res : res.items || []))
            .catch(err => console.error("Gagal load karyawan", err));

    }, [fetchData]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trxType, setTrxType] = useState('income'); // 'income' (Pemasukan) atau 'expense' (Pengeluaran)
    
    // Form State
    const initialForm = {
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        jamaah_id: '',
        employee_id: ''
    };
    const [formData, setFormData] = useState(initialForm);

    // Buka Modal
    const handleOpenModal = (type) => {
        setTrxType(type);
        setFormData({ 
            ...initialForm,
            category: type === 'income' ? 'Pembayaran Jemaah' : 'Operasional', // Default category
        });
        setIsModalOpen(true);
    };

    // Submit Transaksi
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Persiapkan payload sesuai struktur DB
        const payload = {
            transaction_type: trxType,
            amount: formData.amount,
            transaction_date: formData.date,
            category: formData.category,
            description: formData.description,
            // Kirim ID relasi hanya jika relevan
            jamaah_id: formData.category === 'Pembayaran Jemaah' ? formData.jamaah_id : null,
            employee_id: formData.category === 'Gaji Karyawan' ? formData.employee_id : null,
        };

        const success = await createItem(payload);
        if(success) {
            setIsModalOpen(false);
        }
    };

    // Hitung Total
    const totalIncome = data.reduce((acc, curr) => curr.transaction_type === 'income' ? acc + parseFloat(curr.amount || 0) : acc, 0);
    const totalExpense = data.reduce((acc, curr) => curr.transaction_type === 'expense' ? acc + parseFloat(curr.amount || 0) : acc, 0);
    const balance = totalIncome - totalExpense;

    // Kolom Tabel
    const columns = [
        { 
            header: 'Tanggal', 
            accessor: 'transaction_date', 
            render: r => <span className="text-gray-600 text-sm">{formatDate(r.transaction_date)}</span> 
        },
        { 
            header: 'Tipe', 
            accessor: 'transaction_type', 
            render: r => (
                <span className={`flex items-center gap-1 font-bold text-xs uppercase px-2 py-1 rounded ${
                    r.transaction_type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {r.transaction_type === 'income' ? <ArrowUpRight size={12}/> : <ArrowDownLeft size={12}/>}
                    {r.transaction_type === 'income' ? 'Masuk' : 'Keluar'}
                </span>
            )
        },
        { 
            header: 'Kategori & Ket.', 
            accessor: 'category', 
            render: r => (
                <div>
                    <div className="font-bold text-gray-800">{r.category}</div>
                    <div className="text-xs text-gray-500 italic">{r.description || '-'}</div>
                </div>
            )
        },
        { 
            header: 'Relasi', 
            accessor: 'relation', 
            render: r => {
                if (r.jamaah_name) return <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">Jemaah: {r.jamaah_name}</span>;
                if (r.employee_name) return <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded border border-purple-100">Karyawan: {r.employee_name}</span>;
                return <span className="text-gray-400">-</span>;
            }
        },
        { 
            header: 'Nominal', 
            accessor: 'amount', 
            render: r => (
                <span className={`font-mono font-bold ${r.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {r.transaction_type === 'income' ? '+' : '-'} {formatCurrency(r.amount)}
                </span>
            )
        },
    ];

    return (
        <Layout title="Keuangan & Kasir" subtitle="Pencatatan Arus Kas, Pembayaran Jemaah, dan Gaji">
            
            {/* Kartu Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Pemasukan</p>
                        <h3 className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalIncome)}</h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full text-green-500"><TrendingUp size={24}/></div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalExpense)}</h3>
                    </div>
                    <div className="bg-red-50 p-3 rounded-full text-red-500"><TrendingDown size={24}/></div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Saldo Kas</p>
                        <h3 className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(balance)}
                        </h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full text-blue-500"><Wallet size={24}/></div>
                </div>
            </div>

            {/* Kontainer Tabel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <Wallet size={18}/> Riwayat Transaksi
                    </h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => handleOpenModal('income')} className="flex-1 md:flex-none btn-primary bg-green-600 hover:bg-green-700 border-green-700 text-white flex gap-2 items-center justify-center text-sm px-4 py-2 rounded-lg transition-colors">
                            <Plus size={16}/> Catat Pemasukan
                        </button>
                        <button onClick={() => handleOpenModal('expense')} className="flex-1 md:flex-none btn-primary bg-red-600 hover:bg-red-700 border-red-700 text-white flex gap-2 items-center justify-center text-sm px-4 py-2 rounded-lg transition-colors">
                            <Minus size={16}/> Catat Pengeluaran
                        </button>
                    </div>
                </div>
                
                <CrudTable columns={columns} data={data} loading={loading} onDelete={deleteItem} />
            </div>

            {/* Modal Form */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={trxType === 'income' ? "Catat Pemasukan (Kas Masuk)" : "Catat Pengeluaran (Kas Keluar)"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Baris 1: Tanggal & Nominal */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tanggal Transaksi</label>
                            <input 
                                type="date" 
                                className="input-field" 
                                value={formData.date} 
                                onChange={e => setFormData({...formData, date: e.target.value})} 
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Nominal (Rp)</label>
                            <input 
                                type="number" 
                                className="input-field font-mono" 
                                value={formData.amount} 
                                onChange={e => setFormData({...formData, amount: e.target.value})} 
                                required 
                                placeholder="0"
                            />
                        </div>
                    </div>
                    
                    {/* Kategori */}
                    <div>
                        <label className="label">Kategori Transaksi</label>
                        <select 
                            className="input-field" 
                            value={formData.category} 
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            required
                        >
                            <option value="">-- Pilih Kategori --</option>
                            {trxType === 'income' ? (
                                <>
                                    <option value="Pembayaran Jemaah">Pembayaran Paket Jemaah</option>
                                    <option value="Penjualan Perlengkapan">Penjualan Perlengkapan</option>
                                    <option value="Tambahan">Pemasukan Lainnya</option>
                                </>
                            ) : (
                                <>
                                    <option value="Operasional">Biaya Operasional Kantor</option>
                                    <option value="Gaji Karyawan">Gaji Karyawan (Payroll)</option>
                                    <option value="Vendor">Pembayaran Vendor (Hotel/Pesawat)</option>
                                    <option value="Marketing">Biaya Iklan & Marketing</option>
                                    <option value="Lainnya">Pengeluaran Lainnya</option>
                                </>
                            )}
                        </select>
                    </div>

                    {/* Form Dinamis: Relasi */}
                    
                    {/* Jika Kategori = Pembayaran Jemaah -> Tampilkan Dropdown Jemaah */}
                    {formData.category === 'Pembayaran Jemaah' && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <label className="label text-blue-800">Pilih Jemaah</label>
                            <select 
                                className="input-field border-blue-300 focus:ring-blue-200" 
                                value={formData.jamaah_id}
                                onChange={e => setFormData({...formData, jamaah_id: e.target.value})}
                                required
                            >
                                <option value="">-- Cari Nama Jemaah --</option>
                                {jamaahList.map(j => (
                                    <option key={j.id} value={j.id}>{j.full_name} - {j.passport_number || 'No Passport'}</option>
                                ))}
                            </select>
                            <p className="text-xs text-blue-600 mt-1">*Transaksi ini akan tercatat di riwayat jemaah.</p>
                        </div>
                    )}

                    {/* Jika Kategori = Gaji Karyawan -> Tampilkan Dropdown Karyawan */}
                    {formData.category === 'Gaji Karyawan' && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <label className="label text-purple-800">Pilih Karyawan</label>
                            <select 
                                className="input-field border-purple-300 focus:ring-purple-200" 
                                value={formData.employee_id}
                                onChange={e => setFormData({...formData, employee_id: e.target.value})}
                                required
                            >
                                <option value="">-- Cari Nama Karyawan --</option>
                                {employeeList.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                                ))}
                            </select>
                            <p className="text-xs text-purple-600 mt-1">*Transaksi ini akan tercatat sebagai slip gaji.</p>
                        </div>
                    )}

                    <div>
                        <label className="label">Keterangan / Catatan</label>
                        <textarea 
                            className="input-field" 
                            rows="2" 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Contoh: Pembayaran DP Paket Umroh..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className={`btn-primary ${trxType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            Simpan Transaksi
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Finance;