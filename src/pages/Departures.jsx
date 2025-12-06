import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { formatDate } from '../utils/formatters';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { 
    CalendarIcon, 
    UsersIcon, 
    ClipboardDocumentCheckIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export default function Departures() {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDep, setSelectedDep] = useState(null); // Untuk Modal Manifest
    const [manifest, setManifest] = useState([]);
    const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
    const [alert, setAlert] = useState(null);

    // Fetch List Keberangkatan
    const fetchDepartures = async () => {
        setLoading(true);
        try {
            const res = await api.get('/departures');
            setDepartures(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartures(); }, []);

    // Buka Modal Manifest
    const handleOpenManifest = async (dep) => {
        setSelectedDep(dep);
        setIsManifestModalOpen(true);
        try {
            const res = await api.get(`/departures/${dep.id}/manifest`);
            setManifest(res);
        } catch (error) {
            console.error(error);
            setAlert({ type: 'error', message: 'Gagal memuat manifest' });
        }
    };

    // Handle Edit Data di Tabel Manifest (Local State)
    const handleManifestChange = (index, field, value) => {
        const updated = [...manifest];
        updated[index][field] = value;
        setManifest(updated);
    };

    // Simpan Perubahan ke Server
    const saveManifest = async () => {
        try {
            const payload = manifest.map(p => ({
                pax_id: p.id,
                jamaah_id: p.jamaah_id,
                visa_number: p.visa_number,
                visa_status: p.visa_status,
                passport_number: p.passport_number,
                passport_expiry_date: p.passport_expiry_date
            }));

            await api.put(`/departures/${selectedDep.id}/manifest`, { passengers: payload });
            setAlert({ type: 'success', message: 'Data Manifest & Visa berhasil disimpan!' });
            setIsManifestModalOpen(false);
        } catch (error) {
            setAlert({ type: 'error', message: 'Gagal menyimpan data' });
        }
    };

    return (
        <Layout title="Jadwal Keberangkatan">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {departures.map((dep) => (
                        <div key={dep.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CalendarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">{dep.package_name}</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{formatDate(dep.departure_date)}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3">
                                <div className="text-sm flex justify-between items-center">
                                    <span className="font-medium text-gray-500">
                                        {dep.confirmed_pax} / {dep.quota} Pax
                                    </span>
                                    <button 
                                        onClick={() => handleOpenManifest(dep)}
                                        className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center"
                                    >
                                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1"/>
                                        Kelola Manifest & Visa
                                    </button>
                                </div>
                                {/* Progress Bar Kuota */}
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div 
                                        className="bg-indigo-600 h-1.5 rounded-full" 
                                        style={{ width: `${Math.min((dep.confirmed_pax / dep.quota) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL MANIFEST & VISA HANDLING */}
            {isManifestModalOpen && selectedDep && (
                <Modal title={`Manifest: ${selectedDep.package_name} (${formatDate(selectedDep.departure_date)})`} onClose={() => setIsManifestModalOpen(false)} maxWidth="max-w-6xl">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Jamaah</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Paspor</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expired Paspor</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Visa</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Visa</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agen</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {manifest.map((pax, idx) => (
                                    <tr key={pax.id}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {pax.full_name} <br/>
                                            <span className="text-xs text-gray-500">{pax.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <input 
                                                type="text" 
                                                className="block w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                value={pax.passport_number || ''}
                                                onChange={(e) => handleManifestChange(idx, 'passport_number', e.target.value)}
                                                placeholder="X123456"
                                            />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <input 
                                                type="date" 
                                                className={`block w-full border-gray-300 rounded-md shadow-sm text-sm ${
                                                    // Highlight merah jika expired < 6 bulan dari keberangkatan
                                                    new Date(pax.passport_expiry_date) < new Date(selectedDep.departure_date) ? 'border-red-500 text-red-600' : ''
                                                }`}
                                                value={pax.passport_expiry_date || ''}
                                                onChange={(e) => handleManifestChange(idx, 'passport_expiry_date', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <select
                                                className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                value={pax.visa_status || 'pending'}
                                                onChange={(e) => handleManifestChange(idx, 'visa_status', e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="process">Proses MOFA</option>
                                                <option value="issued">Issued (Terbit)</option>
                                                <option value="rejected">Ditolak</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <input 
                                                type="text" 
                                                className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                value={pax.visa_number || ''}
                                                onChange={(e) => handleManifestChange(idx, 'visa_number', e.target.value)}
                                                placeholder="Nomor Visa"
                                                disabled={pax.visa_status !== 'issued'}
                                            />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                            {pax.agent_name || 'Pusat'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end pt-4 space-x-3 border-t mt-4">
                        <button 
                            className="bg-white text-gray-700 px-4 py-2 border rounded-md hover:bg-gray-50"
                            onClick={() => setIsManifestModalOpen(false)}
                        >
                            Tutup
                        </button>
                        <button 
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                            onClick={saveManifest}
                        >
                            <PaperAirplaneIcon className="h-4 w-4 mr-2"/>
                            Simpan Perubahan
                        </button>
                    </div>
                </Modal>
            )}
        </Layout>
    );
}