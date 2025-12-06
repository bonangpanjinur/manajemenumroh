import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import Spinner from '../components/Spinner';
import { useNavigate } from 'react-router-dom';
import { 
    CalendarIcon, 
    MapPinIcon, 
    StarIcon, 
    ArrowRightIcon,
    CheckIcon 
} from '@heroicons/react/24/solid';

export default function Storefront() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, umrah, private, haji
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            try {
                // Panggil API Public yang sudah kita siapkan
                // Tambahkan param 'public=true' jika perlu filtering khusus di backend
                const res = await api.get('/packages');
                setPackages(res);
            } catch (error) {
                console.error("Gagal memuat paket", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const filteredPackages = filter === 'all' 
        ? packages 
        : packages.filter(p => p.type === filter);

    const handleBookNow = (pkgId) => {
        // Arahkan ke login (atau register) dengan state paket yang dipilih
        // Nanti setelah login, redirect ke form booking
        navigate('/login', { state: { returnTo: `/booking/create/${pkgId}` } });
    };

    return (
        <PublicLayout>
            {/* Hero Section */}
            <div className="bg-indigo-700 text-white py-20 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        Wujudkan Niat Suci ke Baitullah
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                        Pilihan paket Umroh Reguler, Private, dan Haji Khusus dengan pelayanan amanah dan fasilitas terbaik.
                    </p>
                    <button 
                        onClick={() => document.getElementById('katalog').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:-translate-y-1"
                    >
                        Lihat Paket Tersedia
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-center space-x-4 mb-10 overflow-x-auto pb-4">
                    {['all', 'umrah', 'private', 'haji'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-6 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                                filter === type 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {type === 'all' ? 'Semua Paket' : type === 'umrah' ? 'Umroh Reguler' : type === 'private' ? 'Umroh Private' : 'Haji Khusus'}
                        </button>
                    ))}
                </div>

                {/* Package Grid */}
                {loading ? (
                    <div className="flex justify-center py-20"><Spinner /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPackages.map((pkg) => (
                            <div key={pkg.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow flex flex-col h-full">
                                {/* Card Header Image Placeholder (Bisa diganti image real nanti) */}
                                <div className={`h-40 bg-gradient-to-r ${pkg.type === 'private' ? 'from-purple-500 to-indigo-600' : 'from-blue-500 to-cyan-500'} p-6 flex items-end relative`}>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        {pkg.type}
                                    </div>
                                    <div>
                                        <h3 className="text-white text-2xl font-bold leading-tight">{pkg.name}</h3>
                                        <p className="text-white/90 text-sm mt-1 flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-1"/> {pkg.duration_days} Hari Perjalanan
                                        </p>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <div className="flex items-baseline mb-2">
                                            <span className="text-gray-500 text-sm mr-2">Mulai</span>
                                            <span className="text-2xl font-extrabold text-indigo-600">{formatCurrency(pkg.down_payment_amount)}</span>
                                            <span className="text-gray-400 text-xs ml-1">(DP)</span>
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                            {pkg.description || 'Fasilitas lengkap termasuk tiket pesawat, hotel bintang 4/5, makan fullboard, dan mutawif berpengalaman.'}
                                        </p>
                                        
                                        {/* Fasilitas Highlights (Hardcoded simulasi jika data belum lengkap) */}
                                        <ul className="space-y-2 mb-6">
                                            <li className="flex items-center text-sm text-gray-600">
                                                <CheckIcon className="h-4 w-4 text-green-500 mr-2" /> Hotel Setaraf Bintang 4/5
                                            </li>
                                            <li className="flex items-center text-sm text-gray-600">
                                                <CheckIcon className="h-4 w-4 text-green-500 mr-2" /> Pesawat Direct (Tanpa Transit)
                                            </li>
                                            <li className="flex items-center text-sm text-gray-600">
                                                <CheckIcon className="h-4 w-4 text-green-500 mr-2" /> Visa & Handling Termasuk
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <button 
                                            onClick={() => handleBookNow(pkg.id)}
                                            className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition flex items-center justify-center group"
                                        >
                                            Pesan Sekarang
                                            <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
} 