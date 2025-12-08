import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';

const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
    {[
      { id: 'company', label: 'Profil Perusahaan' },
      { id: 'finance', label: 'Konfigurasi Keuangan' },
      { id: 'templates', label: 'Template Notifikasi' },
      { id: 'system', label: 'System & API' }
    ].map((tab) => (
      <button
        key={tab.id}
        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
          activeTab === tab.id 
            ? 'border-blue-600 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const SettingsForm = ({ fields, initialData, onSubmit }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await onSubmit(formData);
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } finally {
      setLoading(false);
    }
  };

  // PERBAIKAN: Pastikan fields adalah array
  const safeFields = Array.isArray(fields) ? fields : [];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-4xl">
      {message && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safeFields.map((field) => (
          <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <input
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            )}
            {field.help && <p className="text-xs text-gray-500 mt-1">{field.help}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [settingsData, setSettingsData] = useState({});

  useEffect(() => {
    // Mock data fetching
    setSettingsData({
      company_name: 'Berkah Travel Indonesia',
      company_address: 'Jl. Sudirman No. 123, Jakarta',
      company_phone: '081234567890',
      company_email: 'info@berkahtravel.com',
      currency: 'IDR',
      tax_rate: '11',
      wa_api_key: '*************',
    });
  }, []);

  const handleSaveSettings = async (data) => {
    console.log("Saving settings:", data);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
    setSettingsData(data);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Pengaturan Sistem</h1>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'company' && (
        <SettingsForm
          initialData={settingsData}
          onSubmit={handleSaveSettings}
          fields={[
            { name: 'company_name', label: 'Nama Perusahaan Travel', fullWidth: true },
            { name: 'company_phone', label: 'No. Telepon Kantor' },
            { name: 'company_email', label: 'Email Resmi' },
            { name: 'company_address', label: 'Alamat Lengkap', type: 'textarea', fullWidth: true },
            { name: 'company_logo', label: 'URL Logo Perusahaan', fullWidth: true, help: 'Masukkan URL gambar logo (rekomendasi: PNG transparan)' },
            { name: 'license_number', label: 'Nomor Izin PPIU/PIHK', fullWidth: true }
          ]}
        />
      )}

      {activeTab === 'finance' && (
        <SettingsForm
          initialData={settingsData}
          onSubmit={handleSaveSettings}
          fields={[
            { name: 'currency', label: 'Mata Uang Default', help: 'Contoh: IDR, USD' },
            { name: 'tax_rate', label: 'Persentase Pajak (%)', type: 'number' },
            { name: 'invoice_footer', label: 'Catatan Kaki Invoice', type: 'textarea', fullWidth: true, help: 'Teks ini akan muncul di bagian bawah setiap invoice yang dicetak.' }
          ]}
        />
      )}

      {activeTab === 'templates' && (
        <CrudTable
          title="Template Pesan Otomatis"
          endpoint="/utils/templates"
          columns={[
            { key: 'name', label: 'Nama Template' },
            { key: 'channel', label: 'Channel', render: (val) => val === 'whatsapp' ? '📱 WhatsApp' : '✉️ Email' },
            { key: 'slug', label: 'Kode Slug' },
            { key: 'updated_at', label: 'Terakhir Update' }
          ]}
          formFields={[
            { name: 'name', label: 'Nama Template (Deskriptif)', type: 'text', required: true, width: 'full' },
            { name: 'slug', label: 'Slug (Unik, huruf kecil)', type: 'text', required: true, width: 'half', placeholder: 'payment_success' },
            { name: 'channel', label: 'Saluran', type: 'select', options: [{value: 'whatsapp', label: 'WhatsApp'}, {value: 'email', label: 'Email'}], width: 'half' },
            { name: 'subject', label: 'Subjek Email (Opsional)', type: 'text', width: 'full' },
            { name: 'content', label: 'Isi Pesan', type: 'textarea', required: true, width: 'full', placeholder: 'Halo {name}, pembayaran sebesar {amount} telah diterima...' },
            { name: 'is_active', label: 'Status', type: 'select', options: [{value: '1', label: 'Aktif'}, {value: '0', label: 'Nonaktif'}], width: 'full' }
          ]}
          searchPlaceholder="Cari template..."
        />
      )}

      {activeTab === 'system' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Konfigurasi Lanjutan</h3>
            <p className="text-gray-500 mb-6">
              Pengaturan teknis seperti API Key WhatsApp Gateway, SMTP Email, dan Integrasi Payment Gateway dikelola melalui menu WordPress klasik untuk keamanan.
            </p>
            <a href="/wp-admin/admin.php?page=umroh-manager-settings" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Buka Halaman Pengaturan WP
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;