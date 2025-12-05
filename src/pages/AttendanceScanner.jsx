import React, { useState } from 'react';
import { QrCode, Search, CheckCircle, XCircle, User } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AttendanceScanner = () => {
    const [manualId, setManualId] = useState('');
    const [scanResult, setScanResult] = useState(null); // { status: 'success' | 'error', message: '', data: {} }
    const [isScanning, setIsScanning] = useState(true);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        processAttendance(manualId);
    };

    const processAttendance = async (code) => {
        setScanResult(null); // Reset
        try {
            // Simulasi API call attendance
            // const res = await api.post('umh/v1/attendance/scan', { code });
            
            // Mock Response sukses untuk demo
            setTimeout(() => {
                setScanResult({
                    status: 'success',
                    message: 'Absensi Berhasil Dicatat',
                    data: {
                        name: 'Budi Santoso',
                        role: 'Jamaah',
                        time: new Date().toLocaleTimeString(),
                        event: 'Manasik Haji 2025'
                    }
                });
                toast.success("Scan Berhasil: Budi Santoso");
                setManualId('');
            }, 800);

        } catch (error) {
            setScanResult({
                status: 'error',
                message: 'Data tidak ditemukan atau sudah absen.',
                data: null
            });
            toast.error("Gagal Scan");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <QrCode size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Scanner Kehadiran</h1>
                        <p className="text-gray-500 text-sm">Scan QR Code Jamaah atau Karyawan untuk absensi.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Area Scanner */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Simulated Camera View */}
                    <div className="bg-black rounded-2xl overflow-hidden shadow-lg relative aspect-video flex flex-col items-center justify-center">
                        {isScanning ? (
                            <>
                                <div className="absolute inset-0 opacity-50 bg-[url('https://media.istockphoto.com/id/1149026388/vector/qr-code-scan-phone-screen.jpg?s=612x612&w=0&k=20&c=d3mJ1d6d8vX2aZ5h8d5m_w1y6vX9o1q3u5t7s9r0')] bg-cover bg-center"></div>
                                <div className="z-10 w-64 h-64 border-2 border-white/50 rounded-lg relative">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1"></div>
                                    <div className="w-full h-0.5 bg-green-500 absolute top-1/2 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                                </div>
                                <p className="z-10 text-white mt-4 font-medium bg-black/50 px-4 py-1 rounded-full">Arahkan kamera ke QR Code</p>
                            </>
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <XCircle size={48} className="mb-2"/>
                                <p>Kamera Nonaktif</p>
                            </div>
                        )}
                        
                        {/* Toggle Camera Button */}
                        <button 
                            onClick={() => setIsScanning(!isScanning)}
                            className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm"
                        >
                            {isScanning ? 'Matikan Kamera' : 'Hidupkan Kamera'}
                        </button>
                    </div>

                    {/* Manual Input Fallback */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-3">Input Manual</h3>
                        <form onSubmit={handleManualSubmit} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input 
                                    type="text" 
                                    className="input-field pl-10" 
                                    placeholder="Masukkan ID / NIK / Kode Booking..." 
                                    value={manualId}
                                    onChange={(e) => setManualId(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-primary">Check In</button>
                        </form>
                    </div>
                </div>

                {/* Kolom Kanan: Hasil Scan */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                        <div className="p-4 border-b font-bold text-gray-800">Hasil Pemindaian</div>
                        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                            {!scanResult && (
                                <div className="text-gray-400">
                                    <QrCode size={64} className="mx-auto mb-4 opacity-20"/>
                                    <p>Belum ada data discan.</p>
                                </div>
                            )}

                            {scanResult?.status === 'success' && (
                                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                        <CheckCircle size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{scanResult.data.name}</h3>
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase mt-2 inline-block">
                                            {scanResult.data.role}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2 border">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Waktu:</span>
                                            <span className="font-medium">{scanResult.data.time}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Kegiatan:</span>
                                            <span className="font-medium">{scanResult.data.event}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {scanResult?.status === 'error' && (
                                <div className="space-y-4 text-red-600">
                                    <XCircle size={64} className="mx-auto"/>
                                    <h3 className="text-lg font-bold">Gagal!</h3>
                                    <p className="text-sm text-gray-600">{scanResult.message}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceScanner;