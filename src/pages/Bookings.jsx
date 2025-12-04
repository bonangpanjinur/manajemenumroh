import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Trash, Calendar, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Bookings = () => {
    // Menggunakan endpoint bookings
    const { data, loading, fetchData } = useCRUD('umh/v1/bookings');
    
    // --- STATE UNTUK MODAL BOOKING BARU ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Pilih Paket, 2: Input Jemaah, 3: Konfirmasi
    
    // Data Master
    const [departures, setDepartures] = useState([]);
    const [agents, setAgents] = useState([]);
    
    // Form State
    const [selectedDeparture, setSelectedDeparture] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [passengers, setPassengers] = useState([]); 
    const [contactInfo, setContactInfo] = useState({ name: '', phone: '', email: '' });

    // Search Jamaah
    const [jamaahSearch, setJamaahSearch] = useState('');
    const [jamaahResults, setJamaahResults] = useState([]);
    const [isSearchingJamaah, setIsSearchingJamaah] = useState(false);

    useEffect(() => {
        fetchData();
        // Load Departures yang 'open'
        const loadInitData = async () => {
            try {
                const [deptRes, agentRes] = await Promise.all([
                    api.get('umh/v1/departures', { params: { status: 'open' } }),
                    api.get('umh/v1/agents', { params: { status: 'active' } })
                ]);
                setDepartures(deptRes.data || deptRes || []);
                setAgents(agentRes.data || agentRes || []);
            } catch (e) { console.error(e); }
        };
        loadInitData();
    }, []);

    // --- LOGIC TAMBAH PENUMPANG ---
    const searchJamaah = async (query) => {
        if (!query) return;
        setIsSearchingJamaah(true);
        try {
            const res = await api.get('umh/v1/jamaah', { params: { search: query } });
            setJamaahResults(res.data || res || []);
        } catch (e) { console.error(e); }
        setIsSearchingJamaah(false);
    };

    const addPassenger = (jamaah) => {
        // Cek duplikat di list sementara
        if (passengers.find(p => p.jamaah_id === jamaah.id)) {
            toast.error("Jemaah ini sudah ada di list");
            return;
        }
        
        // Harga default dari paket
        let defaultPrice = 0;
        if (selectedDeparture) {
            defaultPrice = parseFloat(selectedDeparture.price_quad || selectedDeparture.base_price || 0);
        }

        setPassengers(prev => [...prev, {
            jamaah_id: jamaah.id,
            full_name: jamaah.full_name,
            nik: jamaah.nik,
            passport: jamaah.passport_number,
            package_type: 'Quad', // Default
            price: defaultPrice
        }]);
        setJamaahResults([]); // Reset pencarian
        setJamaahSearch('');
    };

    const updatePassenger = (idx, field, val) => {
        const newPax = [...passengers];
        newPax[idx][field] = val;
        
        // Update harga otomatis jika tipe kamar berubah
        if (field === 'package_type' && selectedDeparture) {
            let price = 0;
            if (val === 'Quad') price = parseFloat(selectedDeparture.price_quad);
            else if (val === 'Triple') price = parseFloat(selectedDeparture.price_triple);
            else if (val === 'Double') price = parseFloat(selectedDeparture.price_double);
            newPax[idx].price = price || newPax[idx].price;
        }
        setPassengers(newPax);
    };

    const removePassenger = (idx) => {
        setPassengers(prev => prev.filter((_, i) => i !== idx));
    };

    // --- SUBMIT BOOKING ---
    const handleSubmitBooking = async () => {
        if (!selectedDeparture) return toast.error("Pilih jadwal keberangkatan");
        if (passengers.length === 0) return toast.error("Minimal 1 penumpang");
        if (!contactInfo.name || !contactInfo.phone) return toast.error("Lengkapi data kontak");

        try {
            const payload = {
                departure_id: selectedDeparture.id,
                agent_id: selectedAgent,
                passengers: passengers.map(p => ({
                    jamaah_id: p.jamaah_id,
                    package_type: p.package_type,
                    price: p.price
                })),
                contact_name: contactInfo.name,
                contact_phone: contactInfo.phone,
                contact_email: contactInfo.email
            };

            await api.post('umh/v1/bookings', payload);
            toast.success("Booking berhasil dibuat!");
            setIsModalOpen(false);
            fetchData();
            // Reset
            setPassengers([]);
            setStep(1);
            setSelectedDeparture(null);
        } catch (err) {
            toast.error("Gagal membuat booking: " + err.message);
        }
    };

    const columns = [
        { header: 'Kode Booking', accessor: 'booking_code', render: r => (
            <div>
                <div className="font-bold text-blue-600">{r.booking_code}</div>
                <div className="text-xs text-gray-500">{formatDate(r.created_at)}</div>
            </div>
        )},
        { header: 'Paket', accessor: 'package_name', render: r => (
            <div>
                <div className="font-medium">{r.package_name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={10}/> {formatDate(r.departure_date)}
                </div>
            </div>
        )},
        { header: 'Kontak', accessor: 'contact_name', render: r => (
            <div>
                <div className="text-sm font-medium">{r.contact_name}</div>
                <div className="text-xs text-gray-500">{r.contact_phone}</div>
            </div>
        )},
        { header: 'Jemaah', accessor: 'total_pax', render: r => (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{r.total_pax} Pax</span>
        )},
        { header: 'Tagihan', accessor: 'total_price', render: r => (
            <div>
                <div className="font-bold">{formatCurrency(r.total_price)}</div>
                <div className={`text-[10px] uppercase font-bold ${r.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {r.payment_status === 'unpaid' ? 'Belum Bayar' : r.payment_status}
                </div>
            </div>
        )},
    ];

    return (
        <Layout title="Transaksi Booking">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
                <SearchInput placeholder="Cari kode booking..." />
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Booking Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} actionLabel="Detail" />
            </div>

            {/* MODAL WIZARD */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Booking Baru" size="max-w-5xl">
                {/* WIZARD HEADER */}
                <div className="flex items-center justify-center mb-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step>=1 ? 'bg-blue-600 text-white':'bg-gray-200'}`}>1</div>
                    <div className="w-16 h-1 bg-gray-200 mx-2"><div className={`h-full bg-blue-600 transition-all ${step>=2?'w-full':'w-0'}`}></div></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step>=2 ? 'bg-blue-600 text-white':'bg-gray-200'}`}>2</div>
                    <div className="w-16 h-1 bg-gray-200 mx-2"><div className={`h-full bg-blue-600 transition-all ${step>=3?'w-full':'w-0'}`}></div></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step>=3 ? 'bg-blue-600 text-white':'bg-gray-200'}`}>3</div>
                </div>

                <div className="min-h-[300px]">
                    {/* STEP 1: PILIH PAKET */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg mb-4">Pilih Jadwal Keberangkatan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto custom-scrollbar p-1">
                                {departures.map(dept => (
                                    <div key={dept.id} 
                                        onClick={() => setSelectedDeparture(dept)}
                                        className={`border p-4 rounded-xl cursor-pointer hover:border-blue-500 transition ${selectedDeparture?.id === dept.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'bg-white'}`}>
                                        <div className="font-bold text-gray-800">{dept.package_name}</div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                            <Calendar size={14}/> {formatDate(dept.departure_date)}
                                        </div>
                                        <div className="mt-2 flex justify-between items-end">
                                            <div className="text-xs bg-gray-200 px-2 py-1 rounded">Sisa Seat: {dept.available_seats}</div>
                                            <div className="font-bold text-blue-700">{formatCurrency(dept.price_quad || dept.base_price)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: INPUT JEMAAH */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg mb-4">Data Jemaah</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <div className="flex gap-2">
                                    <input 
                                        className="input-field" 
                                        placeholder="Cari nama / NIK / Paspor..." 
                                        value={jamaahSearch}
                                        onChange={e => setJamaahSearch(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && searchJamaah(jamaahSearch)}
                                    />
                                    <button onClick={() => searchJamaah(jamaahSearch)} className="btn-secondary"><Search size={18}/></button>
                                </div>
                                {jamaahResults.length > 0 && (
                                    <div className="mt-2 bg-white border rounded shadow-sm max-h-40 overflow-y-auto">
                                        {jamaahResults.map(j => (
                                            <div key={j.id} onClick={() => addPassenger(j)} className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b">
                                                <div className="text-sm font-bold">{j.full_name}</div>
                                                <Plus size={16} className="text-blue-600"/>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 max-h-[30vh] overflow-y-auto custom-scrollbar">
                                {passengers.map((pax, idx) => (
                                    <div key={idx} className="flex gap-3 items-center border p-3 rounded-lg bg-white">
                                        <div className="flex-1 font-bold text-sm">{pax.full_name}</div>
                                        <select 
                                            className="input-field w-24 text-xs py-1" 
                                            value={pax.package_type} 
                                            onChange={e => updatePassenger(idx, 'package_type', e.target.value)}
                                        >
                                            <option value="Quad">Quad</option>
                                            <option value="Triple">Triple</option>
                                            <option value="Double">Double</option>
                                        </select>
                                        <div className="w-32 font-bold text-sm text-right">{formatCurrency(pax.price)}</div>
                                        <button onClick={() => removePassenger(idx)} className="text-red-500 p-1"><Trash size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: KONFIRMASI */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg mb-4">Konfirmasi</h3>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                <div className="flex justify-between text-lg font-bold text-blue-900">
                                    <span>Total Tagihan:</span>
                                    <span>{formatCurrency(passengers.reduce((acc, curr) => acc + curr.price, 0))}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="label">Nama Kontak</label><input className="input-field" value={contactInfo.name} onChange={e => setContactInfo({...contactInfo, name: e.target.value})} placeholder="Misal: Budi Santoso" /></div>
                                <div><label className="label">No. WhatsApp</label><input className="input-field" value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} placeholder="0812..." /></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t">
                    <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="btn-secondary">Kembali</button>
                    {step < 3 ? (
                        <button onClick={() => setStep(s => s + 1)} className="btn-primary">Lanjut</button>
                    ) : (
                        <button onClick={handleSubmitBooking} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">Buat Booking</button>
                    )}
                </div>
            </Modal>
        </Layout>
    );
};

export default Bookings;