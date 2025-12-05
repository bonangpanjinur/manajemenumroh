import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, BedDouble, Trash2, Plus, FileSpreadsheet, ArrowLeft, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';

// Komponen ini dipanggil oleh Departures.jsx
const RoomingManager = ({ departureId, departureInfo, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [unassigned, setUnassigned] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedPax, setSelectedPax] = useState([]);
    const [hotels, setHotels] = useState([]);
    
    const [form, setForm] = useState({
        hotel_id: '', room_number: '', capacity: 4, gender: 'L', notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`umh/v1/departures/${departureId}/rooming`);
            if (res.data.success) {
                setRooms(res.data.rooms);
                setUnassigned(res.data.unassigned);
            }
            // Load Hotel Info from Package
            if(departureInfo?.package_id) {
                const pkgRes = await api.get(`umh/v1/packages/${departureInfo.package_id}/full`);
                if(pkgRes.data.success) setHotels(pkgRes.data.data.hotels || []);
            }
        } catch (e) { toast.error("Gagal memuat data rooming"); }
        finally { setLoading(false); }
    };

    useEffect(() => { if(departureId) fetchData(); }, [departureId]);

    const togglePax = (paxId) => {
        setSelectedPax(prev => prev.includes(paxId) ? prev.filter(id => id !== paxId) : [...prev, paxId]);
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (selectedPax.length === 0) return toast.error("Pilih jemaah dulu");
        if (selectedPax.length > form.capacity) return toast.error(`Kapasitas cuma ${form.capacity}`);

        try {
            await api.post(`umh/v1/departures/${departureId}/create-room`, { ...form, pax_ids: selectedPax });
            toast.success("Kamar dibuat!");
            setSelectedPax([]); setForm({...form, room_number: ''}); fetchData();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };

    const handleDeleteRoom = async (roomId) => {
        if(!confirm("Bubarkan kamar?")) return;
        try { await api.delete(`umh/v1/rooms/${roomId}`); toast.success("Kamar dibubarkan"); fetchData(); } 
        catch (e) { toast.error("Gagal hapus"); }
    };

    const downloadManifest = async () => {
        try {
            const res = await api.get(`umh/v1/departures/${departureId}/manifest`);
            const data = res.data.data;
            let csv = "No,Nama,Gender,Paspor,Paket,Maskapai\n";
            data.forEach((r, i) => csv += `${i+1},"${r.full_name}",${r.gender},${r.passport_number},"${r.package_name}","${r.airline_name}"\n`);
            const link = document.createElement("a");
            link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
            link.download = "manifest.csv";
            link.click();
        } catch(e) { toast.error("Gagal download"); }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto animate-fade-in">
            <div className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft/></button>
                    <div><h1 className="text-xl font-bold">Rooming & Manifest</h1><p className="text-sm text-gray-500">{departureInfo?.package_name}</p></div>
                </div>
                <button onClick={downloadManifest} className="btn-secondary flex gap-2 text-sm"><FileSpreadsheet size={16}/> Manifest</button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-80px)]">
                {/* Kolom Kiri: Jemaah Belum Dapat Kamar */}
                <div className="bg-white rounded-xl shadow p-4 flex flex-col h-full">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Users size={18}/> Belum Dapat Kamar ({unassigned.length})</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {unassigned.map(p => (
                            <div key={p.pax_id} onClick={() => togglePax(p.pax_id)} className={`p-3 rounded border cursor-pointer flex justify-between ${selectedPax.includes(p.pax_id) ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}>
                                <div><div className="font-bold text-sm">{p.full_name}</div><span className="text-xs bg-gray-100 px-1 rounded">{p.gender}</span></div>
                                {selectedPax.includes(p.pax_id) ? <CheckSquare size={18} className="text-blue-600"/> : <Square size={18} className="text-gray-300"/>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kolom Tengah: Form & List Kamar */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow p-4">
                        <form onSubmit={handleCreateRoom} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                            <div className="md:col-span-2"><label className="label">Hotel</label><select className="input-field" value={form.hotel_id} onChange={e=>setForm({...form, hotel_id:e.target.value})} required><option value="">-- Hotel --</option>{hotels.map(h=><option key={h.id} value={h.hotel_id}>{h.hotel_name}</option>)}</select></div>
                            <div><label className="label">No. Kamar</label><input className="input-field" value={form.room_number} onChange={e=>setForm({...form, room_number:e.target.value})} required/></div>
                            <div><label className="label">Kapasitas</label><select className="input-field" value={form.capacity} onChange={e=>setForm({...form, capacity:parseInt(e.target.value)})}> <option value="4">Quad</option><option value="3">Triple</option><option value="2">Double</option></select></div>
                            <button className="btn-primary flex justify-center items-center gap-2"><Plus size={16}/> Buat</button>
                        </form>
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
                        {rooms.map(room => (
                            <div key={room.id} className="bg-white rounded-lg border shadow-sm relative overflow-hidden">
                                <div className={`h-1 w-full absolute top-0 left-0 ${room.gender==='L'?'bg-blue-500':'bg-pink-500'}`}></div>
                                <div className="p-3 bg-gray-50 border-b flex justify-between">
                                    <div><div className="font-bold flex gap-1"><BedDouble size={14}/> {room.hotel_name}</div><div className="text-xs">No: {room.room_number}</div></div>
                                    <button onClick={() => handleDeleteRoom(room.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                                <div className="p-2 space-y-1">
                                    {room.pax.map((p, i) => <div key={i} className="text-xs p-1 border rounded bg-white">{i+1}. {p.full_name}</div>)}
                                    {[...Array(Math.max(0, room.capacity - room.pax.length))].map((_,i) => <div key={`e-${i}`} className="text-xs p-1 border border-dashed text-center text-gray-300">-- Kosong --</div>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RoomingManager;