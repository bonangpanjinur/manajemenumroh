import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const [form, setForm] = useState({
        company_name: '',
        company_address: '',
        company_phone: '',
        currency_symbol: 'Rp',
        logo_url: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('umh/v1/settings').then(res => {
            if(res.data.success) setForm(res.data.data);
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/settings', form);
            toast.success("Pengaturan disimpan!");
        } catch (e) {
            toast.error("Gagal simpan");
        }
    };

    if(loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gray-100 rounded-full"><SettingsIcon size={24}/></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h1>
                    <p className="text-gray-500">Konfigurasi profil perusahaan dan aplikasi.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Nama Perusahaan Travel</label>
                            <input className="input-field" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">No. Telepon Kantor</label>
                            <input className="input-field" value={form.company_phone} onChange={e => setForm({...form, company_phone: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="label">Alamat Lengkap</label>
                        <textarea className="input-field" rows="3" value={form.company_address} onChange={e => setForm({...form, company_address: e.target.value})}></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Mata Uang (Simbol)</label>
                            <input className="input-field" value={form.currency_symbol} onChange={e => setForm({...form, currency_symbol: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">URL Logo Perusahaan</label>
                            <input className="input-field" value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})} placeholder="https://..." />
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <button type="submit" className="btn-primary flex items-center gap-2 px-6">
                            <Save size={18}/> Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;