import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Save, Building, Mail, Phone, Globe, Shield } from 'lucide-react';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        company_address: '',
        company_phone: '',
        company_email: '',
        company_website: '',
        currency_symbol: 'Rp',
        logo_url: ''
    });

    useEffect(() => {
        // Fetch existing settings
        const fetchSettings = async () => {
            try {
                const res = await api.get('umh/v1/settings');
                // Asumsi response format key-value object
                if (res) setFormData(prev => ({ ...prev, ...res }));
            } catch (err) {
                console.log("Belum ada setting tersimpan, menggunakan default.");
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Menyimpan pengaturan...');
        try {
            await api.post('umh/v1/settings', formData);
            toast.success('Pengaturan berhasil disimpan!', { id: toastId });
        } catch (err) {
            toast.error('Gagal menyimpan pengaturan.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Pengaturan Sistem">
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Card Profil Perusahaan */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Building className="text-blue-600"/> Profil Perusahaan Travel
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="label">Nama Perusahaan / Travel</label>
                                <input name="company_name" className="input-field font-bold" value={formData.company_name} onChange={handleChange} placeholder="PT. Berkah Safar" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="label">Alamat Kantor</label>
                                <textarea name="company_address" className="input-field" rows="3" value={formData.company_address} onChange={handleChange} placeholder="Jl. Raya No. 1..."></textarea>
                            </div>
                            <div>
                                <label className="label flex items-center gap-2"><Phone size={14}/> No. Telepon Resmi</label>
                                <input name="company_phone" className="input-field" value={formData.company_phone} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label flex items-center gap-2"><Mail size={14}/> Email Resmi</label>
                                <input name="company_email" className="input-field" value={formData.company_email} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label flex items-center gap-2"><Globe size={14}/> Website</label>
                                <input name="company_website" className="input-field" value={formData.company_website} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">Mata Uang Default</label>
                                <select name="currency_symbol" className="input-field" value={formData.currency_symbol} onChange={handleChange}>
                                    <option value="Rp">Rupiah (Rp)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="SAR">Saudi Riyal (SAR)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Card API & Keamanan (Opsional) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 opacity-70">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield className="text-gray-600"/> Konfigurasi API (Advanced)
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Area ini untuk pengaturan teknis integrasi WhatsApp Gateway atau Payment Gateway (Coming Soon).</p>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center text-gray-400 text-sm">
                            Fitur Integrasi Pihak Ketiga akan segera hadir.
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn-primary w-40 flex items-center justify-center gap-2" disabled={loading}>
                            <Save size={18}/> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Settings;