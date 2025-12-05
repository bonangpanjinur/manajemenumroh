import React from 'react';
import { Save, Settings as SettingsIcon, Bell, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    
    const handleSave = (e) => {
        e.preventDefault();
        toast.success("Pengaturan disimpan (Simulasi)");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <SettingsIcon className="text-gray-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
                        <p className="text-gray-500 text-sm">Konfigurasi umum aplikasi travel umroh.</p>
                    </div>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save size={18} /> Simpan Perubahan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 space-y-2">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-3 px-2">Menu Pengaturan</h3>
                        <nav className="space-y-1">
                            <button className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium flex items-center gap-2">
                                <Globe size={16}/> Umum
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-2">
                                <Lock size={16}/> Keamanan
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-2">
                                <Bell size={16}/> Notifikasi
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Informasi Travel</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Nama Perusahaan</label>
                                    <input type="text" className="input-field" defaultValue="Travel Umroh Berkah" />
                                </div>
                                <div>
                                    <label className="label">Nomor Izin PPIU</label>
                                    <input type="text" className="input-field" defaultValue="PPIU/2024/001" />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Alamat Kantor</label>
                                    <textarea className="input-field" rows="3" defaultValue="Jl. Sudirman No. 1, Jakarta"></textarea>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Keuangan & Mata Uang</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Mata Uang Default</label>
                                    <select className="input-field">
                                        <option>IDR (Rupiah)</option>
                                        <option>USD (US Dollar)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Kurs Default (USD ke IDR)</label>
                                    <input type="number" className="input-field" defaultValue="15500" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;