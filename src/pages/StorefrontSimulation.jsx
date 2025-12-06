import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, MapPin, Calendar, ArrowRight, Info } from 'lucide-react';
import Spinner from '../components/Spinner';

const StorefrontSimulation = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await api.get('umh/v1/packages?per_page=20');
                if (res.data.success) {
                    // Pastikan data berupa array
                    const allPackages = Array.isArray(res.data.data) ? res.data.data : [];
                    setPackages(allPackages.filter(p => p.status === 'active'));
                }
            } catch (error) {
                console.error("Error fetching packages", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const filteredPackages = packages.filter(pkg => {
        const matchSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === 'all' || pkg.type === filterType;
        return matchSearch && matchType;
    });

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="text-center space-y-2 pt-4">
                <h1 className="text-3xl font-bold text-gray-900">Temukan Paket Ibadah Terbaik</h1>
                <p className="text-gray-500">Simulasi tampilan depan website untuk calon jemaah.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Cari paket umroh, haji, atau wisata..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['all', 'umrah', 'haji', 'tour'].map(type => (
                        <button 
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${filterType === type ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {type === 'all' ? 'Semua' : type}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <Spinner text="Memuat paket terbaik..." /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPackages.length > 0 ? (
                        filteredPackages.map((pkg) => (
                            <div key={pkg.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                    <img 
                                        src="[https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1000&auto=format&fit=crop](https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1000&auto=format&fit=crop)" 
                                        alt="Mekkah" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 z-20">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${pkg.type === 'haji' ? 'bg-purple-600' : pkg.type === 'tour' ? 'bg-green-600' : 'bg-blue-600'}`}>
                                            {pkg.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 z-20 text-white">
                                        <div className="flex items-center gap-1 text-xs font-medium mb-1">
                                            <Calendar size={12} /> {pkg.duration_days} Hari Perjalanan
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight line-clamp-2">{pkg.name}</h3>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="space-y-3 mb-4">
                                        {pkg.hotel_summary ? (
                                            <div className="text-xs text-gray-600 flex gap-2 items-start">
                                                <MapPin size={14} className="shrink-0 mt-0.5 text-gray-400"/>
                                                <span className="line-clamp-2">{pkg.hotel_summary}</span>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400 italic flex gap-2">
                                                <Info size={14}/> Hotel belum ditentukan
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Mulai dari</p>
                                        <div className="flex justify-between items-end">
                                            <div className="text-xl font-bold text-blue-700">
                                                {/* Tampilkan harga base jika prices array kosong */}
                                                {formatPrice(pkg.base_price_quad || 0)}
                                            </div>
                                            <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1 text-right">Per pax</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Search size={32}/>
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">Tidak ada paket ditemukan</h3>
                            <p className="text-gray-500">Coba ubah kata kunci pencarian atau status paket belum aktif.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StorefrontSimulation;