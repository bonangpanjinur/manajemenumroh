import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Save, Globe, Bell, CreditCard, Database, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    
    // State untuk semua setting
    const [settings, setSettings] = useState({
        company_name: 'Berkah Tours & Travel',
        license_number: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo_url: '',
        
        // WhatsApp Gateway (Misal: Fonnte/Wablas)
        wa_api_url: '',
        wa_api_key: '',
        
        // Payment Gateway (Misal: Midtrans/Xendit)
        payment_gateway: 'manual', // manual, midtrans, xendit
        midtrans_server_key: '',
        midtrans_client_key: '',
        
        // System
        currency: 'IDR',
        timezone: 'Asia/Jakarta'
    });

    // Load Settings saat pertama kali buka
    useEffect(() => {
        // Simulasi fetch setting dari API (Nanti backend perlu endpoint GET /settings)
        // api.get('umh/v1/settings').then(res => setSettings(res.data));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulasi simpan ke API (Backend perlu endpoint POST /settings)
            // await api.post('umh/v1/settings', settings);
            
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Pengaturan berhasil disimpan!");
        } catch (err) {
            toast.error("Gagal menyimpan pengaturan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Konfigurasi Sistem">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Sidebar Nav Settings */}
                <div className="md:col-span-1 space-y-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <NavButton id="general" label="Info Perusahaan" icon={Globe} active={activeTab} set={setActiveTab} />
                        <NavButton id="whatsapp" label="Notifikasi WA" icon={Bell} active={activeTab} set={setActiveTab} />
                        <NavButton id="payment" label="Integrasi Pembayaran" icon={CreditCard} active={activeTab} set={setActiveTab} />
                        <NavButton id="system" label="Backup & System" icon={Database} active={activeTab} set={setActiveTab} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
                        
                        {/* TAB 1: GENERAL INFO */}
                        {activeTab === 'general' && (
                            <div className="space-y-5 animate-fade-in">
                                <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Profil Travel Agent</h3>
                                
                                <div className="flex gap-6">
                                    <div className="w-1/3">
                                        <label className="label">Logo Perusahaan</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition">
                                            {settings.logo_url ? (
                                                <img src={settings.logo_url} alt="Logo" className="h-full object-contain" />
                                            ) : (
                                                <>
                                                    <Upload size={24} />
                                                    <span className="text-xs mt-2">Upload Logo</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-2/3 space-y-4">
                                        <div><label className="label">Nama Travel</label><input name="company_name" className="input-field" value={settings.company_name} onChange={handleChange} /></div>
                                        <div><label className="label">Nomor Izin PPIU/PIHK</label><input name="license_number" className="input-field" value={settings.license_number} onChange={handleChange} placeholder="SK Kemenag No..." /></div>
                                    </div>
                                </div>

                                <div><label className="label">Alamat Kantor Pusat</label><textarea name="address" className="input-field h-24" value={settings.address} onChange={handleChange}></textarea></div>
                                
                                <div className="grid grid-cols-3 gap-5">
                                    <div><label className="label">Email Resmi</label><input name="email" className="input-field" value={settings.email} onChange={handleChange} /></div>
                                    <div><label className="label">No. Telepon</label><input name="phone" className="input-field" value={settings.phone} onChange={handleChange} /></div>
                                    <div><label className="label">Website</label><input name="website" className="input-field" value={settings.website} onChange={handleChange} /></div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: WHATSAPP GATEWAY */}
                        {activeTab === 'whatsapp' && (
                            <div className="space-y-5 animate-fade-in">
                                <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Integrasi WhatsApp Gateway</h3>
                                <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800 border border-green-200 mb-4">
                                    Sistem menggunakan API pihak ketiga (seperti Fonnte/Wablas) untuk mengirim notifikasi otomatis ke jemaah.
                                </div>
                                
                                <div><label className="label">API URL Endpoint</label><input name="wa_api_url" className="input-field" value={settings.wa_api_url} onChange={handleChange} placeholder="https://api.whatsapp-gateway.com/send" /></div>
                                <div><label className="label">API Key / Token</label><input name="wa_api_key" type="password" className="input-field" value={settings.wa_api_key} onChange={handleChange} /></div>
                                
                                <div className="pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm text-gray-700">Kirim notifikasi otomatis saat Booking dibuat</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm text-gray-700">Kirim notifikasi pengingat pembayaran H-3</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PAYMENT GATEWAY */}
                        {activeTab === 'payment' && (
                            <div className="space-y-5 animate-fade-in">
                                <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Metode Pembayaran Online</h3>
                                
                                <div>
                                    <label className="label">Pilih Provider</label>
                                    <select name="payment_gateway" className="input-field" value={settings.payment_gateway} onChange={handleChange}>
                                        <option value="manual">Transfer Manual (Cek Mutasi Sendiri)</option>
                                        <option value="midtrans">Midtrans</option>
                                        <option value="xendit">Xendit</option>
                                        <option value="duitku">Duitku</option>
                                    </select>
                                </div>

                                {settings.payment_gateway !== 'manual' && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <div><label className="label">Server Key</label><input name="midtrans_server_key" className="input-field" value={settings.midtrans_server_key} onChange={handleChange} /></div>
                                        <div><label className="label">Client Key</label><input name="midtrans_client_key" className="input-field" value={settings.midtrans_client_key} onChange={handleChange} /></div>
                                        <div className="text-xs text-gray-500">* Dapatkan key dari dashboard provider pembayaran Anda.</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: SYSTEM & BACKUP */}
                        {activeTab === 'system' && (
                            <div className="space-y-5 animate-fade-in">
                                <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Pemeliharaan Sistem</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="label">Mata Uang Default</label><select name="currency" className="input-field" value={settings.currency} onChange={handleChange}><option value="IDR">IDR (Rupiah)</option><option value="USD">USD (Dolar)</option></select></div>
                                    <div><label className="label">Zona Waktu</label><select name="timezone" className="input-field" value={settings.timezone} onChange={handleChange}><option value="Asia/Jakarta">WIB (Jakarta)</option><option value="Asia/Makassar">WITA (Makassar)</option><option value="Asia/Jayapura">WIT (Jayapura)</option></select></div>
                                </div>

                                <div className="border-t pt-4 mt-6">
                                    <h4 className="font-bold text-red-600 mb-2">Danger Zone</h4>
                                    <div className="flex gap-3">
                                        <button type="button" className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Backup Database (SQL)</button>
                                        <button type="button" className="px-4 py-2 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50">Reset Semua Data</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t mt-8 flex justify-end">
                            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-blue-100">
                                {loading ? 'Menyimpan...' : <><Save size={18}/> Simpan Perubahan</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

const NavButton = ({ id, label, icon: Icon, active, set }) => (
    <button 
        type="button"
        onClick={() => set(id)} 
        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${active === id ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'}`}
    >
        <Icon size={18} /> {label}
    </button>
);

export default Settings;