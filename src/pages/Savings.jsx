import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    BanknotesIcon, 
    CalendarIcon, 
    TagIcon, 
    DocumentTextIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

export default function Savings() {
    const [activeTab, setActiveTab] = useState('verification'); // verification, accounts, packages
    const [alert, setAlert] = useState(null);

    return (
        <Layout title="Tabungan Umroh">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
            
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex">
                        <TabButton 
                            active={activeTab === 'verification'} 
                            onClick={() => setActiveTab('verification')}
                            label="Verifikasi Setoran"
                            count={null} // Nanti bisa dikonekkan dengan count pending
                        />
                        <TabButton 
                            active={activeTab === 'accounts'} 
                            onClick={() => setActiveTab('accounts')}
                            label="Rekening Jamaah"
                        />
                        <TabButton 
                            active={activeTab === 'packages'} 
                            onClick={() => setActiveTab('packages')}
                            label="Master Paket"
                        />
                    </nav>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 min-h-[500px]">
                {activeTab === 'verification' && <VerificationTab setAlert={setAlert} />}
                {activeTab === 'accounts' && <AccountsTab setAlert={setAlert} />}
                {activeTab === 'packages' && <PackagesTab setAlert={setAlert} />}
            </div>
        </Layout>
    );
}

function TabButton({ active, onClick, label, count }) {
    return (
        <button
            onClick={onClick}
            className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                active
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
        >
            {label}
            {count > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {count}
                </span>
            )}
        </button>
    );
}

// --- SUB COMPONENTS ---

function VerificationTab({ setAlert }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState(null);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/savings/transactions?status=pending');
            setTransactions(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleVerify = async (id, status) => {
        if(!confirm(`Apakah anda yakin ingin mengubah status menjadi ${status}?`)) return;
        try {
            await api.post(`/savings/transactions/${id}/verify`, { status });
            setAlert({ type: 'success', message: `Transaksi berhasil di-${status}` });
            fetchTransactions();
        } catch (error) {
            setAlert({ type: 'error', message: 'Gagal memproses transaksi' });
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Antrian Verifikasi</h3>
                    <p className="mt-1 text-sm text-gray-500">Daftar setoran masuk yang perlu dicek bukti transfernya.</p>
                </div>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Semua Beres</h3>
                    <p className="mt-1 text-sm text-gray-500">Tidak ada transaksi tertunda saat ini.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jamaah</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((trx) => (
                                <tr key={trx.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(trx.transaction_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{trx.jamaah_name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{trx.account_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(trx.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedProof(trx.proof_url)}>
                                        Lihat Bukti
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleVerify(trx.id, 'verified')} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                            <CheckCircleIcon className="mr-1 h-4 w-4"/> Terima
                                        </button>
                                        <button onClick={() => handleVerify(trx.id, 'rejected')} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                            <XCircleIcon className="mr-1 h-4 w-4"/> Tolak
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             {selectedProof && (
                <Modal title="Bukti Pembayaran" onClose={() => setSelectedProof(null)}>
                    <div className="text-center">
                        <img src={selectedProof} alt="Bukti Transfer" className="max-w-full max-h-[70vh] mx-auto rounded shadow-lg border" />
                        <div className="mt-4">
                            <a href={selectedProof} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm">Buka Gambar Asli (Full Size)</a>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function AccountsTab({ setAlert }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [packages, setPackages] = useState([]);
    const [jamaahList, setJamaahList] = useState([]);
    
    // Form State
    const [formData, setFormData] = useState({ jamaah_id: '', package_id: '' });

    // Adjust Price State
    const [adjustModal, setAdjustModal] = useState({ open: false, id: null, current: 0 });
    const [adjustAmount, setAdjustAmount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accRes, pkgRes, jamRes] = await Promise.all([
                api.get('/savings/accounts'),
                api.get('/savings/packages'),
                api.get('/jamaah') 
            ]);
            setAccounts(accRes);
            setPackages(pkgRes);
            setJamaahList(jamRes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        const selectedPkg = packages.find(p => p.id == formData.package_id);
        if (!selectedPkg) return;

        try {
            await api.post('/savings/accounts', {
                ...formData,
                target_amount: selectedPkg.target_amount,
                duration_months: selectedPkg.duration_months
            });
            setAlert({ type: 'success', message: 'Rekening berhasil dibuka' });
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            setAlert({ type: 'error', message: 'Gagal membuka rekening' });
        }
    };

    const handleAdjustPrice = async () => {
        try {
            await api.post(`/savings/accounts/${adjustModal.id}/adjust-target`, { new_amount: adjustAmount });
            setAlert({ type: 'success', message: 'Harga paket berhasil disesuaikan' });
            setAdjustModal({ open: false, id: null, current: 0 });
            fetchData();
        } catch (error) {
            setAlert({ type: 'error', message: 'Gagal menyesuaikan harga' });
        }
    }

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Rekening Jamaah</h3>
                    <p className="mt-1 text-sm text-gray-500">Monitor saldo tabungan jamaah secara real-time.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Buka Rekening Baru
                </button>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info Akun</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terkumpul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {accounts.map((acc) => {
                            const progress = (acc.current_balance / acc.target_amount) * 100;
                            return (
                                <tr key={acc.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{acc.jamaah_name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{acc.account_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{acc.package_name}</div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize`}>
                                            {acc.package_type || 'regular'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 group relative">
                                        {formatCurrency(acc.target_amount)}
                                        <button 
                                            className="ml-2 text-indigo-600 hover:text-indigo-900 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                setAdjustAmount(acc.target_amount);
                                                setAdjustModal({ open: true, id: acc.id, current: acc.target_amount });
                                            }}
                                            title="Sesuaikan Harga"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">{formatCurrency(acc.current_balance)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-48">
                                        <div className="flex items-center">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                                <div 
                                                    className={`h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-indigo-600'}`} 
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium w-8">{progress.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal Buka Rekening */}
            {isModalOpen && (
                <Modal title="Buka Rekening Baru" onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleCreateAccount} className="space-y-5">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        Pastikan Jamaah sudah terdaftar di menu "Jamaah" sebelum membuka rekening tabungan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pilih Jamaah</label>
                            <select 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={formData.jamaah_id}
                                onChange={(e) => setFormData({...formData, jamaah_id: e.target.value})}
                                required
                            >
                                <option value="">-- Cari Nama Jamaah --</option>
                                {jamaahList.map(j => <option key={j.id} value={j.id}>{j.name} - {j.passport_number || 'Tanpa Paspor'}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pilih Paket Tabungan</label>
                            <select 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={formData.package_id}
                                onChange={(e) => setFormData({...formData, package_id: e.target.value})}
                                required
                            >
                                <option value="">-- Pilih Paket --</option>
                                {packages.map(p => <option key={p.id} value={p.id}>{p.name} ({p.package_type}) - {formatCurrency(p.target_amount)}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end pt-4 border-t mt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">Batal</button>
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow-sm text-sm font-medium">Buka Rekening</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal Adjust Harga */}
            {adjustModal.open && (
                <Modal title="Penyesuaian Harga Paket" onClose={() => setAdjustModal({ open: false, id: null, current: 0 })}>
                    <div className="space-y-4">
                         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Perubahan harga ini hanya berlaku untuk rekening ini saja, tidak mengubah harga paket induk.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Saat Ini</label>
                            <div className="text-xl font-bold text-gray-900">{formatCurrency(adjustModal.current)}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Baru (Penyesuaian)</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                </div>
                                <input 
                                    type="number" 
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                    value={adjustAmount}
                                    onChange={(e) => setAdjustAmount(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={handleAdjustPrice} className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 shadow-sm text-sm font-medium">Simpan Perubahan</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function PackagesTab({ setAlert }) {
    const [packages, setPackages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({ 
        name: '', 
        package_type: 'regular', 
        description: '', 
        target_amount: '', 
        duration_months: '' 
    });

    // Helper for visual color
    const getTypeColor = (type) => {
        switch(type) {
            case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'haji': return 'bg-green-100 text-green-800 border-green-200';
            case 'plus_turki': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'plus_aqsa': return 'bg-teal-100 text-teal-800 border-teal-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'regular': return 'Umroh Reguler';
            case 'vip': return 'Umroh VIP';
            case 'haji': return 'Tabungan Haji';
            case 'plus_turki': return 'Umroh Plus Turki';
            case 'plus_aqsa': return 'Umroh Plus Aqsa';
            default: return type;
        }
    };

    const fetchPackages = async () => {
        try {
            const res = await api.get('/savings/packages');
            setPackages(res);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchPackages(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/savings/packages', formData);
            setAlert({ type: 'success', message: 'Paket berhasil dibuat' });
            setIsModalOpen(false);
            fetchPackages();
            setFormData({ name: '', package_type: 'regular', description: '', target_amount: '', duration_months: '' });
        } catch (error) {
            setAlert({ type: 'error', message: 'Gagal membuat paket' });
        }
    };

    // Quick set duration
    const setDuration = (months) => {
        setFormData(prev => ({ ...prev, duration_months: months }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Master Paket Tabungan</h3>
                    <p className="mt-1 text-sm text-gray-500">Buat variasi paket tabungan yang tersedia untuk jamaah.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Buat Paket Baru
                </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map(pkg => (
                    <div key={pkg.id} className="relative bg-white border rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full">
                        <div className={`h-2 w-full ${pkg.package_type === 'haji' ? 'bg-green-500' : pkg.package_type === 'vip' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(pkg.package_type)}`}>
                                    {getTypeLabel(pkg.package_type)}
                                </span>
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 mb-2">{pkg.name}</h4>
                            <div className="flex items-baseline mb-4">
                                <span className="text-2xl font-extrabold text-gray-900">{formatCurrency(pkg.target_amount)}</span>
                            </div>
                            
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center text-sm text-gray-500">
                                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    <span>Tenor: <span className="font-semibold text-gray-700">{pkg.duration_months} Bulan</span> ({(pkg.duration_months/12).toFixed(1)} Thn)</span>
                                </div>
                                <div className="flex items-start text-sm text-gray-500">
                                    <DocumentTextIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    <span className="line-clamp-2">{pkg.description || 'Tidak ada deskripsi'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                            <div className="text-xs text-center text-gray-500">
                                Estimasi cicilan: ~{formatCurrency(pkg.target_amount / pkg.duration_months)} / bulan
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <Modal title="Buat Paket Tabungan Baru" onClose={() => setIsModalOpen(false)}>
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Kolom Kiri: Form Input */}
                        <div className="flex-1 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <TagIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})} 
                                        required 
                                        placeholder="Contoh: Paket Hemat 3 Tahun" 
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Nama yang akan muncul di aplikasi jamaah.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jenis Paket</label>
                                <select 
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    value={formData.package_type}
                                    onChange={e => setFormData({...formData, package_type: e.target.value})}
                                >
                                    <option value="regular">Reguler (Standar)</option>
                                    <option value="plus_turki">Umroh Plus Turki</option>
                                    <option value="plus_aqsa">Umroh Plus Aqsa</option>
                                    <option value="haji">Tabungan Haji</option>
                                    <option value="vip">Umroh VIP</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Harga (Total)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Rp</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md" 
                                        value={formData.target_amount} 
                                        onChange={e => setFormData({...formData, target_amount: e.target.value})} 
                                        required 
                                        placeholder="0"
                                    />
                                </div>
                                {formData.target_amount && (
                                    <p className="mt-1 text-xs font-bold text-indigo-600">
                                        {formatCurrency(formData.target_amount)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Durasi Menabung</label>
                                <div className="mt-2 flex space-x-2 mb-2">
                                    <button type="button" onClick={() => setDuration(12)} className={`px-3 py-1 text-xs rounded-full border ${formData.duration_months == 12 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>1 Tahun</button>
                                    <button type="button" onClick={() => setDuration(24)} className={`px-3 py-1 text-xs rounded-full border ${formData.duration_months == 24 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>2 Tahun</button>
                                    <button type="button" onClick={() => setDuration(36)} className={`px-3 py-1 text-xs rounded-full border ${formData.duration_months == 36 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>3 Tahun</button>
                                    <button type="button" onClick={() => setDuration(60)} className={`px-3 py-1 text-xs rounded-full border ${formData.duration_months == 60 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>5 Tahun</button>
                                </div>
                                <div className="relative rounded-md shadow-sm">
                                    <input 
                                        type="number" 
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md" 
                                        value={formData.duration_months} 
                                        onChange={e => setFormData({...formData, duration_months: e.target.value})} 
                                        required 
                                        placeholder="Jumlah Bulan" 
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Bulan</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Keterangan / Fasilitas</label>
                                <textarea 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                                    rows={3}
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    placeholder="Contoh: Termasuk tiket PP, Hotel Bintang 4..."
                                />
                            </div>
                        </div>

                        {/* Kolom Kanan: Live Preview */}
                        <div className="w-full lg:w-72 flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-500 mb-3 text-center">Preview Tampilan</label>
                            
                            <div className="bg-white border rounded-xl shadow-lg overflow-hidden flex flex-col h-auto transform scale-100 origin-top">
                                <div className={`h-2 w-full ${formData.package_type === 'haji' ? 'bg-green-500' : formData.package_type === 'vip' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(formData.package_type)}`}>
                                            {getTypeLabel(formData.package_type)}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2 break-words">
                                        {formData.name || 'Nama Paket...'}
                                    </h4>
                                    <div className="flex items-baseline mb-4">
                                        <span className="text-2xl font-extrabold text-gray-900">
                                            {formData.target_amount ? formatCurrency(formData.target_amount) : 'Rp 0'}
                                        </span>
                                    </div>
                                    
                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                            <span>Tenor: <span className="font-semibold text-gray-700">{formData.duration_months || 0} Bln</span></span>
                                        </div>
                                        <div className="flex items-start text-sm text-gray-500">
                                            <DocumentTextIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                            <span className="line-clamp-3 text-xs">
                                                {formData.description || 'Keterangan paket akan muncul disini...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                                    <div className="text-xs text-center text-gray-500">
                                        Cicilan: ~{formatCurrency(formData.target_amount > 0 && formData.duration_months > 0 ? formData.target_amount / formData.duration_months : 0)}/bln
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3 w-full">Batal</button>
                            </div>
                             <div className="mt-2 flex justify-end">
                                <button onClick={handleSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow-sm text-sm font-medium w-full">Simpan Paket</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}