import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { formatCurrency } from '../utils/formatters';
import { 
    BriefcaseIcon, 
    PlusIcon, 
    UserGroupIcon, 
    StarIcon, 
    GlobeAsiaAustraliaIcon, 
    CheckBadgeIcon,
    TruckIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';

export default function Packages() {
    const [packages, setPackages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    
    // State Tab & Filter
    const [activeTab, setActiveTab] = useState('umrah'); // umrah, private, haji, tour

    // Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'umrah',
        category_id: '',
        duration_days: 9,
        down_payment_amount: 0,
        description: '',
        // Field tambahan untuk Private (disimpan di description sbg JSON text sementara atau field terpisah jika DB mendukung)
        facilities_include: '', 
        facilities_exclude: '',
        vehicle_type: 'Bus AC Executive' // Default reguler
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const pkgRes = await api.get(`/packages?type=${activeTab}`);
            const catRes = await api.get('/package-categories');
            setPackages(pkgRes);
            setCategories(catRes);
        } catch (error) {
            console.error(error);
            setAlert({ type: 'error', message: 'Gagal memuat data paket' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setFormData(prev => ({ 
            ...prev, 
            type: activeTab,
            vehicle_type: activeTab === 'private' ? 'GMC / Toyota Hiace' : 'Bus AC Executive' 
        }));
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Logic menggabungkan fasilitas ke description agar tersimpan di DB (karena kita belum tambah kolom khusus)
        let finalDescription = formData.description;
        if (activeTab === 'private') {
            finalDescription += `\n\n[KENDARAAN]: ${formData.vehicle_type}`;
            finalDescription += `\n\n[TERMASUK]:\n${formData.facilities_include}`;
            finalDescription += `\n\n[TIDAK TERMASUK]:\n${formData.facilities_exclude}`;
        }

        const payload = { ...formData, description: finalDescription };

        try {
            await api.post('/packages', payload);
            setAlert({ type: 'success', message: 'Paket berhasil dibuat' });
            setIsModalOpen(false);
            fetchData();
            // Reset Simple
            setFormData({ 
                name: '', type: activeTab, category_id: '', 
                duration_days: 9, down_payment_amount: 0, description: '',
                facilities_include: '', facilities_exclude: '', vehicle_type: ''
            });
        } catch (error) {
            setAlert({ type: 'error', message: 'Gagal membuat paket' });
        }
    };

    const getTabIcon = (type) => {
        switch(type) {
            case 'umrah': return UserGroupIcon;
            case 'private': return StarIcon;
            case 'haji': return CheckBadgeIcon;
            case 'tour': return GlobeAsiaAustraliaIcon;
            default: return BriefcaseIcon;
        }
    };

    return (
        <Layout title="Manajemen Produk & Paket">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            {/* Tab Navigasi */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {[
                        { id: 'umrah', name: 'Umroh Reguler' },
                        { id: 'private', name: 'Umroh Private' },
                        { id: 'haji', name: 'Haji Khusus' },
                        { id: 'tour', name: 'Wisata Halal' },
                    ].map((tab) => {
                        const Icon = getTabIcon(tab.id);
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap`}
                            >
                                <Icon className={`${
                                    activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                                } -ml-0.5 mr-2 h-5 w-5`} aria-hidden="true" />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 capitalize">
                        Daftar {activeTab === 'umrah' ? 'Paket Reguler' : activeTab === 'private' ? 'Paket Private' : activeTab}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {activeTab === 'private' 
                            ? 'Paket eksklusif dengan jadwal fleksibel dan fasilitas custom.' 
                            : 'Paket keberangkatan grup terjadwal (Seat & Kuota).'}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Buat Paket {activeTab === 'private' ? 'Private' : ''} Baru
                </button>
            </div>

            {/* Content Grid */}
            {loading ? (
                <Spinner />
            ) : packages.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada paket</h3>
                    <p className="mt-1 text-sm text-gray-500">Mulai dengan membuat paket baru untuk kategori ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                            {/* Card Header Color */}
                            <div className={`h-2 w-full ${pkg.type === 'private' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                            
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        pkg.type === 'private' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {pkg.type.toUpperCase()}
                                    </span>
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <GlobeAsiaAustraliaIcon className="h-4 w-4 mr-1"/> {pkg.duration_days} Hari
                                    </span>
                                </div>
                                
                                <h3 className="text-lg leading-snug font-bold text-gray-900 mb-2 min-h-[3rem]">{pkg.name}</h3>
                                
                                <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-md min-h-[5rem]">
                                    <p className="line-clamp-3 text-xs whitespace-pre-line">{pkg.description || 'Tidak ada deskripsi'}</p>
                                </div>
                                
                                <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Mulai Dari (DP)</p>
                                        <p className="text-lg font-extrabold text-indigo-600">{formatCurrency(pkg.down_payment_amount)}</p>
                                    </div>
                                    <button className="text-sm text-gray-500 hover:text-indigo-600 font-medium">
                                        Edit Detail &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Create */}
            {isModalOpen && (
                <Modal title={`Buat Paket ${activeTab.toUpperCase()}`} onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Nama & Kategori */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder={activeTab === 'private' ? "Contoh: Private Umrah VIP Family 9 Hari" : "Contoh: Umrah Reguler Syawal"}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori Paket</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">-- Pilih Kategori (Opsional) --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Durasi & Harga */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Durasi (Hari)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                                        value={formData.duration_days}
                                        onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Hari</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {activeTab === 'private' ? 'Harga Mulai Dari (DP)' : 'Uang Muka (DP)'}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                        value={formData.down_payment_amount}
                                        onChange={(e) => setFormData({ ...formData, down_payment_amount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* KHUSUS PRIVATE: Kendaraan */}
                        {activeTab === 'private' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jenis Kendaraan</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <TruckIcon className="h-4 w-4" />
                                    </span>
                                    <select
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                                        value={formData.vehicle_type}
                                        onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                                    >
                                        <option value="GMC / Yukon">GMC / Yukon (VIP 2-4 Pax)</option>
                                        <option value="Toyota Hiace">Toyota Hiace (Family 5-10 Pax)</option>
                                        <option value="Coaster">Coaster (Group Kecil 15-20 Pax)</option>
                                        <option value="Private Sedan">Private Sedan (Couple)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Deskripsi Umum */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Deskripsi Singkat / Itinerary Highlight</label>
                            <textarea
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                rows="3"
                                placeholder="Hotel Makkah, Hotel Madinah, Maskapai..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* KHUSUS PRIVATE: Includes & Excludes */}
                        {activeTab === 'private' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-green-700">Fasilitas Termasuk (Include)</label>
                                    <textarea
                                        className="mt-1 block w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-green-50"
                                        rows="4"
                                        placeholder="- Visa Umroh&#10;- Transportasi Private&#10;- Mutawif Khusus"
                                        value={formData.facilities_include}
                                        onChange={(e) => setFormData({ ...formData, facilities_include: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-red-700">Tidak Termasuk (Exclude)</label>
                                    <textarea
                                        className="mt-1 block w-full border border-red-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-red-50"
                                        rows="4"
                                        placeholder="- Tiket Pesawat (Opsional)&#10;- Keperluan Pribadi&#10;- Laundry"
                                        value={formData.facilities_exclude}
                                        onChange={(e) => setFormData({ ...formData, facilities_exclude: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* Hidden input for type */}
                        <input type="hidden" value={formData.type} />

                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Simpan Paket
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </Layout>
    );
}