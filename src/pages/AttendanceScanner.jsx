import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useCRUD from '../hooks/useCRUD'; // Untuk ambil data user simulasi
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const AttendanceScanner = () => {
  // Ambil data karyawan untuk simulasi login (karena kita belum buat sistem login full)
  const { data: employees } = useCRUD('/employees');
  const [currentUser, setCurrentUser] = useState(null);

  const [scanResult, setScanResult] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // State Manual
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualReason, setManualReason] = useState('');

  // 1. Ambil Lokasi
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
        (err) => { setError("Gagal mengambil lokasi GPS."); }
      );
    }
  }, []);

  // Set default user (simulasi)
  useEffect(() => {
      if(employees.length > 0 && !currentUser) {
          setCurrentUser(employees[0]); // Default login sebagai user pertama
      }
  }, [employees]);

  const handleScan = async (data) => {
    if (data) { setScanResult(data); setCameraActive(false); submitAttendance(data, 'QR'); }
  };

  const submitAttendance = async (data, method) => {
    setLoading(true); setError(null);
    if (method === 'QR' && data !== 'UMROH-OFFICE-HQ') {
        setLoading(false); setError("QR Code salah!"); return;
    }
    try {
        // Simulasi submit
        setTimeout(() => {
            setSuccessMsg(method === 'QR' ? 'Absensi QR Berhasil!' : `Absensi Tugas Luar Berhasil! (${data})`);
            setIsManualMode(false);
        }, 1000);
    } catch (err) { setError("Gagal kirim data."); } 
    finally { setLoading(false); }
  };

  const handleManualSubmit = (e) => {
      e.preventDefault();
      if(!manualReason) return setError("Isi alasan tugas.");
      submitAttendance(manualReason, 'Manual');
  };

  const simulateScan = () => handleScan('UMROH-OFFICE-HQ');

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md min-h-[80vh] flex flex-col items-center justify-center text-center">
      
      {/* --- SIMULASI USER LOGIN (UNTUK DEMO PERMISSION) --- */}
      <div className="w-full mb-6 p-2 bg-gray-50 border border-gray-200 rounded text-left">
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Simulasi Login Sebagai:</label>
          <select 
            className="w-full text-sm border-gray-300 rounded"
            onChange={(e) => {
                const user = employees.find(emp => emp.id == e.target.value);
                setCurrentUser(user);
                setIsManualMode(false); // Reset mode saat ganti user
            }}
          >
              {employees.length === 0 && <option>Loading users...</option>}
              {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                      {emp.name} {emp.allow_remote ? '✅ (Boleh Remote)' : '❌ (Wajib Kantor)'}
                  </option>
              ))}
          </select>
      </div>
      {/* --------------------------------------------------- */}

      <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isManualMode ? 'Absensi Tugas Luar' : 'Scan Kehadiran'}
      </h1>
      
      {successMsg ? (
          <div className="py-10">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-4">
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-medium">Berhasil!</h3>
              <button onClick={() => { setSuccessMsg(null); setManualReason(''); }} className="mt-6 text-blue-600 font-medium">Kembali</button>
          </div>
      ) : (
          <div className="w-full space-y-4">
              {!isManualMode ? (
                  <>
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                        {cameraActive ? <div className="text-white animate-pulse">📷 Kamera Aktif...</div> : <div className="text-gray-400">Kamera Non-Aktif</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setCameraActive(!cameraActive)} className={`w-full py-3 text-white rounded-lg font-semibold ${cameraActive ? 'bg-red-500' : 'bg-blue-600'}`}>
                            {cameraActive ? 'Tutup' : 'Buka Kamera'}
                        </button>
                        <button onClick={simulateScan} className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold border">Simulasi QR</button>
                    </div>

                    {/* LOGIC PERMISSION CHECK */}
                    <div className="pt-4 border-t border-gray-100">
                        {currentUser?.allow_remote ? (
                            <button onClick={() => setIsManualMode(true)} className="text-sm text-blue-600 hover:text-blue-800 font-medium underline">
                                Saya sedang Tugas Luar (Manual)
                            </button>
                        ) : (
                            <div className="text-xs text-red-400 italic bg-red-50 p-2 rounded">
                                🔒 Fitur Tugas Luar dikunci. <br/>Anda wajib absen QR di kantor.
                            </div>
                        )}
                    </div>
                  </>
              ) : (
                  <form onSubmit={handleManualSubmit} className="text-left space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-sm text-yellow-800 mb-4">
                            <strong>Mode Tugas Luar Aktif</strong> <br/>
                            Halo {currentUser?.name}, lokasi GPS Anda akan direkam sebagai bukti kehadiran.
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi / Keterangan</label>
                            <textarea value={manualReason} onChange={(e) => setManualReason(e.target.value)} className="w-full border p-2 rounded" rows="3" required></textarea>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsManualMode(false)} className="w-1/2 py-2 bg-gray-100 rounded border">Batal</button>
                            <button type="submit" className="w-1/2 py-2 bg-blue-600 text-white rounded">Kirim</button>
                        </div>
                  </form>
              )}
          </div>
      )}
    </div>
  );
};

export default AttendanceScanner;