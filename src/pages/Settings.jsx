import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Save, Globe, DollarSign, Bell, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
    // Mock settings data
    const [settings, setSettings] = useState({
        company_name: 'Travel Umroh Berkah',
        currency_symbol: 'Rp',
        currency_code: 'IDR',
        email_notifications: true,
        whatsapp_notifications: true,
        default_departure_city: 'Jakarta',
        maintenance_mode: false
    });

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // Logika simpan ke API placeholder
        toast.success('Pengaturan berhasil disimpan!');
        // api.post('umh/v1/settings', settings)...
    };

    return (
        <Layout title="Pengaturan Sistem">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <Globe className="text-blue-600" size={20} />
                        <h3 className="font-bold text-gray-800">Umum</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan Travel</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-md" value={settings.company_name} onChange={e => handleChange('company_name', e.target.value)} />
                            <p className="text-xs text-gray-400 mt-1">Akan muncul di invoice dan header laporan.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kota Keberangkatan Default</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-md" value={settings.default_departure_city} onChange={e => handleChange('default_departure_city', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <DollarSign className="text-green-600" size={20} />
                        <h3 className="font-bold text-gray-800">Keuangan</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Simbol Mata Uang</label>
                            <input type="text" className="w-24 px-3 py-2 border rounded-md" value={settings.currency_symbol} onChange={e => handleChange('currency_symbol', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Mata Uang (ISO)</label>
                            <input type="text" className="w-24 px-3 py-2 border rounded-md" value={settings.currency_code} onChange={e => handleChange('currency_code', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <Bell className="text-orange-600" size={20} />
                        <h3 className="font-bold text-gray-800">Notifikasi</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-700">Notifikasi Email</h4>
                                <p className="text-xs text-gray-500">Kirim email saat ada pendaftaran jamaah baru.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={settings.email_notifications} onChange={e => handleChange('email_notifications', e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <hr />
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Smartphone size={14}/> Notifikasi WhatsApp</h4>
                                <p className="text-xs text-gray-500">Integrasi WA Gateway untuk notifikasi tagihan.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={settings.whatsapp_notifications} onChange={e => handleChange('whatsapp_notifications', e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pb-10">
                    <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2 transform hover:-translate-y-1 transition-all">
                        <Save size={20} /> Simpan Semua Pengaturan
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;