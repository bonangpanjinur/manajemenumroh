import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import api from '../utils/api';
import { Bed, Users, Calendar, ArrowRight, Male, Female, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const RoomingManager = () => {
    const [departures, setDepartures] = useState([]);
    const [selectedDep, setSelectedDep] = useState(null);
    const [roomingData, setRoomingData] = useState(null); // { unassigned_pax, rooms }
    const [loading, setLoading] = useState(false);
    const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
    const [newRoomForm, setNewRoomForm] = useState({ room_number: '', capacity: 4, gender: 'Family', notes: '' });

    // 1. Load Master Data (Departures)
    useEffect(() => {
        api.get('umh/v1/departures/full').then(res => {
            const deps = res.data.data || res.data;
            setDepartures(deps);
            if (deps.length > 0) setSelectedDep(deps[0]);
        });
    }, []);

    // 2. Load Rooming Data berdasarkan Departure ID
    const fetchRoomingData = async (depId) => {
        if (!depId) return;
        setLoading(true);
        try {
            const res = await api.get(`umh/v1/rooming/departure/${depId}`);
            setRoomingData(res.data.data);
        } catch (e) {
            toast.error("Gagal memuat data rooming");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDep) fetchRoomingData(selectedDep.id);
    }, [selectedDep]);

    // 3. Logic Assign/Unassign Jemaah (Drag & Drop Sim)
    const assignJamaah = async (paxId, roomId) => {
        if (!paxId) return;

        try {
            await api.post('umh/v1/rooming/assign', { pax_id: paxId, room_id: roomId });
            toast.success(roomId ? "Jemaah ditempatkan!" : "Jemaah dikeluarkan!");
            fetchRoomingData(selectedDep.id); // Refresh data
        } catch (e) {
            toast.error("Gagal assign: " + e.message);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/rooming_list', { ...newRoomForm, departure_id: selectedDep.id });
            toast.success("Kamar berhasil dibuat");
            setIsCreateRoomModalOpen(false);
            fetchRoomingData(selectedDep.id); // Refresh data
        } catch (e) {
            toast.error("Gagal buat kamar: " + e.message);
        }
    };

    const RoomCard = ({ room }) => {
        const isFull = room.current_occupancy >= room.capacity;
        const remaining = room.capacity - room.current_occupancy;
        const color = isFull ? 'bg-red-50' : (remaining <= 1 ? 'bg-yellow-50' : 'bg-green-50');

        return (
            <div className={`border p-3 rounded-xl shadow-sm ${color} min-h-[150px]`}>
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1">
                        <Bed size={16} className="text-blue-600"/> Kamar {room.room_number || 'TBA'}
                    </h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                        {room.current_occupancy} / {room.capacity}
                    </span>
                </div>
                
                {/* Pax List in Room */}
                <div className="space-y-1">
                    {room.pax_in_room.map(pax => (
                        <div key={pax.pax_id} className="text-xs flex items-center justify-between bg-white p-2 rounded shadow-sm">
                            <span className="font-medium text-gray-700">{pax.full_name} ({pax.package_type[0]})</span>
                            <button onClick={() => assignJamaah(pax.pax_id, null)} className="text-red-500 hover:text-red-700 p-0.5" title="Keluarkan">
                                <X size={12}/>
                            </button>
                        </div>
                    ))}
                    {remaining > 0 && <div className="text-center text-gray-400 text-xs italic pt-1">Sisa {remaining} kursi kosong</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3"><Bed size={24}/> Rooming Manager</h1>
            
            {/* Departure Selector */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border">
                <Calendar size={20} className="text-blue-600 flex-shrink-0"/>
                <select 
                    className="input-field w-full md:w-1/3 font-bold" 
                    value={selectedDep?.id || ''} 
                    onChange={e => setSelectedDep(departures.find(d => d.id == e.target.value))}
                >
                    {departures.map(d => (
                        <option key={d.id} value={d.id}>
                            {new Date(d.departure_date).toLocaleDateString()} - {d.package_name} ({d.available_seats} Sisa)
                        </option>
                    ))}
                </select>
                {selectedDep && <button onClick={()=>setIsCreateRoomModalOpen(true)} className="btn-secondary flex items-center gap-1 text-sm"><Plus size={16}/> Buat Kamar Baru</button>}
            </div>

            {loading ? <Spinner /> : roomingData && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                    
                    {/* Column 1: UNASSIGNED PAX LIST (Need Drag & Drop UX) */}
                    <div className="col-span-1 bg-white p-4 rounded-xl shadow-md border overflow-y-auto max-h-[80vh]">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <Users size={20}/> Belum Ditempatkan ({roomingData.unassigned_pax.length})
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Total jemaah confirmed yang belum punya kamar.</p>
                        
                        <div className="space-y-3">
                            {roomingData.unassigned_pax.map(pax => (
                                <div key={pax.pax_id} className="bg-gray-100 p-3 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="font-bold text-gray-800 text-sm">{pax.full_name}</div>
                                    <div className="text-xs text-gray-600 mt-1 flex justify-between">
                                        <span>Tipe: {pax.package_type}</span>
                                        <span className="font-medium text-blue-600">{pax.booking_code}</span>
                                    </div>
                                    {/* Action to assign to first available room (Simplified UX) */}
                                    <div className="mt-2 pt-2 border-t text-right">
                                        <select 
                                            className="input-field text-xs py-1"
                                            onChange={e => assignJamaah(pax.pax_id, e.target.value)}
                                        >
                                            <option value="">-- Assign Ke Kamar --</option>
                                            {roomingData.rooms.filter(r => r.current_occupancy < r.capacity).map(r => (
                                                <option key={r.id} value={r.id}>
                                                    Kamar {r.room_number} ({r.current_occupancy}/{r.capacity})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: ROOMS */}
                    <div className="lg:col-span-3 space-y-4 overflow-y-auto max-h-[80vh]">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <Bed size={20}/> Daftar Kamar ({roomingData.rooms.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {roomingData.rooms.map(room => (
                                <RoomCard key={room.id} room={room} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Create Room */}
            <Modal isOpen={isCreateRoomModalOpen} onClose={() => setIsCreateRoomModalOpen(false)} title="Buat Kamar Baru" size="max-w-md">
                <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div><label className="label">Nomor / Nama Kamar</label><input className="input-field" value={newRoomForm.room_number} onChange={e=>setNewRoomForm({...newRoomForm, room_number:e.target.value})} required/></div>
                    <div><label className="label">Kapasitas Maksimal</label><input type="number" min="2" max="4" className="input-field" value={newRoomForm.capacity} onChange={e=>setNewRoomForm({...newRoomForm, capacity:e.target.value})} required/></div>
                    <div><label className="label">Gender (Pengelompokan)</label><select className="input-field" value={newRoomForm.gender} onChange={e=>setNewRoomForm({...newRoomForm, gender:e.target.value})}><option value="L">Laki-laki</option><option value="P">Perempuan</option><option value="Family">Keluarga</option></select></div>
                    <div className="flex justify-end pt-4 border-t"><button type="submit" className="btn-primary">Buat Kamar</button></div>
                </form>
            </Modal>
        </div>
    );
};

export default RoomingManager;