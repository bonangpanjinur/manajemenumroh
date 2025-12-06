import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Asumsi pakai router
import api from '../utils/api';
import { Calendar, MapPin, Star, Users, CheckCircle, Info, Plane, ArrowRight } from 'lucide-react';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

// Ini adalah simulasi halaman Detail Produk di Frontend
const StorefrontSimulation = () => {
    // Di real app, id didapat dari URL slug. Di sini kita hardcode atau buat selector simple.
    // Untuk demo, kita buat selector paket dulu di atas.
    const [allPackages, setAllPackages] = useState([]);
    const [selectedPkgId, setSelectedPkgId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [pkgData, setPkgData] = useState(null);
    
    // State Form Order
    const [selectedDeparture, setSelectedDeparture] = useState(null);
    const [roomType, setRoomType] = useState('Quad'); // Quad, Triple, Double
    const [pax, setPax] = useState(1);

    // 1. Load List Paket (Untuk Demo Dropdown)
    useEffect(() => {
        api.get('umh/v1/packages').then(res => {
            const list = res.data.data || res.data;
            setAllPackages(list);
            if(list.length > 0) setSelectedPkgId(list[0].id);
        });
    }, []);

    // 2. Load Detail Paket saat ID berubah
    useEffect(() => {
        if(!selectedPkgId) return;
        setLoading(true);
        // Reset Selection
        setSelectedDeparture(null);
        
        api.get(`umh/v1/storefront/package/${selectedPkgId}`)
           .then(res => {
               setPkgData(res.data.data);
           })
           .catch(err => toast.error("Gagal memuat detail paket"))
           .finally(() => setLoading(false));
    }, [selectedPkgId]);

    // Format Mata Uang
    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    // Hitung Total Harga Real-time
    const getActivePrice = () => {
        if (!selectedDeparture) return 0;
        // Prioritas: Harga di Departure -> Kalau 0, ambil harga default Paket
        // Tapi di sistem V10 kita, departure selalu punya harga final (dicopy saat create).
        const priceKey = `price_${roomType.toLowerCase()}`;
        return parseFloat(selectedDeparture[priceKey]) || 0;
    };

    const totalPrice = getActivePrice() * pax;

    if (!selectedPkgId) return <div className="p-10 text-center">Memuat Paket...</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* Header Demo Selector */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-yellow-800">Mode Simulasi Frontend</h3>
                    <p className="text-xs text-yellow-700">Ini tampilan yang akan dilihat Jemaah saat memilih paket.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Pilih Paket:</span>
                    <select className="input-field py-1" value={selectedPkgId} onChange={e => setSelectedPkgId(e.target.value)}>
                        {allPackages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            {loading || !pkgData ? <Spinner /> : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* KOLOM KIRI: Detail Konten (Statis) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Image */}
                        <div className="bg-gray-200 rounded-2xl h-64 w-full relative overflow-hidden group">
                            <img src="https://source.unsplash.com/800x400/?mecca,umrah" alt="Umrah" className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-800 uppercase tracking-wide">
                                {pkgData.info.type.replace('_', ' ')}
                            </div>
                        </div>

                        {/* Title & Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pkgData.info.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                <span className="flex items-center gap-1"><MapPin size={16}/> {pkgData.hotels[0]?.city_name || 'Makkah'}</span>
                                <span className="flex items-center gap-1"><Info size={16}/> {pkgData.info.duration_days} Hari Perjalanan</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{pkgData.info.description}</p>
                        </div>

                        {/* Hotel List */}
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Star className="text-yellow-400" fill="currentColor"/> Akomodasi Hotel</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pkgData.hotels.map((h, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="bg-white p-2 rounded shadow-sm"><MapPin size={20} className="text-blue-500"/></div>
                                        <div>
                                            <div className="font-bold text-gray-800">{h.hotel_name}</div>
                                            <div className="text-xs text-gray-500">{h.city_name} • {h.rating} Bintang</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Itinerary Accordion (Simplified) */}
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="font-bold text-lg mb-4">Rencana Perjalanan</h3>
                            <div className="space-y-4 border-l-2 border-blue-100 pl-4 ml-2">
                                {pkgData.itinerary.map((it, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                                        <h4 className="font-bold text-gray-800 text-sm">Hari ke-{it.day_number}: {it.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{it.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN: Booking Form (Dinamis) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
                            <h3 className="font-bold text-xl mb-4 text-gray-800">Mulai Pemesanan</h3>
                            
                            {/* 1. Pilih Tanggal (Departure) */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pilih Tanggal Keberangkatan</label>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {pkgData.available_departures.length === 0 ? (
                                        <div className="text-red-500 text-sm p-3 bg-red-50 rounded">Maaf, belum ada jadwal tersedia.</div>
                                    ) : (
                                        pkgData.available_departures.map(d => (
                                            <div 
                                                key={d.id} 
                                                onClick={() => setSelectedDeparture(d)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center group
                                                    ${selectedDeparture?.id === d.id 
                                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                                            >
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm">
                                                        {new Date(d.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Plane size={10}/> {d.flight_number_depart || 'Direct'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold ${selectedDeparture?.id === d.id ? 'text-blue-700' : 'text-gray-600'}`}>
                                                        {formatIDR(d.price_quad)}
                                                    </div>
                                                    <div className="text-[10px] text-green-600 font-medium">
                                                        Sisa {d.available_seats} Seat
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Form Input hanya muncul jika tanggal dipilih */}
                            {selectedDeparture && (
                                <div className="space-y-5 animate-fade-in-up">
                                    
                                    {/* 2. Pilih Tipe Kamar */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pilih Tipe Kamar</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Quad', 'Triple', 'Double'].map(type => (
                                                <button 
                                                    key={type}
                                                    onClick={() => setRoomType(type)}
                                                    className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all
                                                        ${roomType === type 
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                                >
                                                    {type}
                                                    <div className="text-[10px] opacity-80 font-normal">
                                                        {formatIDR(selectedDeparture[`price_${type.toLowerCase()}`])}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Jumlah Pax */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Jumlah Jemaah</label>
                                        <div className="flex items-center border rounded-lg w-fit">
                                            <button onClick={() => setPax(Math.max(1, pax-1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
                                            <input className="w-12 text-center font-bold border-none focus:ring-0 py-2" readOnly value={pax} />
                                            <button onClick={() => setPax(Math.min(selectedDeparture.available_seats, pax+1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
                                        </div>
                                    </div>

                                    <hr className="border-dashed"/>

                                    {/* Total & Action */}
                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <div className="text-sm text-gray-500">Total Estimasi</div>
                                            <div className="text-2xl font-bold text-blue-700">{formatIDR(totalPrice)}</div>
                                        </div>
                                        <button 
                                            onClick={() => toast.success("Masuk ke proses Checkout (Seat Locked)")}
                                            className="w-full btn-primary py-3 text-lg shadow-lg shadow-blue-200 flex justify-center items-center gap-2 group"
                                        >
                                            Pesan Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition"/>
                                        </button>
                                        <p className="text-center text-xs text-gray-400 mt-3">Pembayaran aman & terverifikasi.</p>
                                    </div>
                                </div>
                            )}

                            {!selectedDeparture && (
                                <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-500 italic">
                                    Silakan pilih tanggal keberangkatan untuk melihat harga final.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StorefrontSimulation;