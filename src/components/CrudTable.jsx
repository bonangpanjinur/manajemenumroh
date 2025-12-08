import React, { useState } from 'react';
import { Edit, Trash2, Plus, RefreshCw, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Spinner from './Spinner';

// Komponen Modal Form Internal
const CrudModal = ({ isOpen, onClose, title, fields, initialData, onSubmit }) => {
    const [formData, setFormData] = useState(initialData || {});

    // Reset form saat modal dibuka dengan data baru
    React.useEffect(() => {
        setFormData(initialData || {});
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex flex-wrap -mx-2">
                        {fields.map((field, idx) => {
                            // Render Section Header
                            if (field.section) {
                                return (
                                    <div key={`sec-${idx}`} className="w-full px-2 mt-4 mb-2 pb-1 border-b border-gray-100">
                                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">{field.section}</h4>
                                    </div>
                                );
                            }

                            // Tentukan Lebar Kolom
                            let widthClass = 'w-full';
                            if (field.width === 'half') widthClass = 'w-1/2';
                            if (field.width === 'third') widthClass = 'w-1/3';
                            if (field.width === 'quarter') widthClass = 'w-1/4';
                            if (field.width === 'two-thirds') widthClass = 'w-2/3';

                            return (
                                <div key={field.name} className={`${widthClass} px-2 mb-4`}>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    
                                    {field.type === 'select' ? (
                                        <div className="relative">
                                            <select
                                                name={field.name}
                                                value={formData[field.name] || field.defaultValue || ''}
                                                onChange={handleChange}
                                                required={field.required}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                            >
                                                <option value="" disabled>-- Pilih {field.label} --</option>
                                                {(field.options || []).map((opt, i) => (
                                                    <option key={i} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            required={field.required}
                                            rows={3}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                    ) : (
                                        <input
                                            type={field.type || 'text'}
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                    )}
                                    {field.help && <p className="text-[10px] text-gray-400 mt-1">{field.help}</p>}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end pt-4 gap-3 border-t border-gray-100 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                            Simpan Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CrudTable = ({
    title = "Data Table",
    columns = [],
    data = [],
    loading = false,
    onRefresh,
    searchPlaceholder = "Cari data...",
    formFields = [],
    onCreate, // Jika null, tombol create disembunyikan
    onEdit,   // Jika null, tombol edit disembunyikan
    onDelete  // Jika null, tombol delete disembunyikan
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editData, setEditData] = useState(null);

    // Filter Data (Client Side Search)
    const safeData = Array.isArray(data) ? data : [];
    const filteredData = safeData.filter(item => 
        Object.values(item).some(val => 
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleCreate = () => {
        setModalMode('create');
        setEditData({});
        setIsModalOpen(true);
        if (onCreate) onCreate(); // Optional custom handler
    };

    const handleEdit = (item) => {
        setModalMode('edit');
        setEditData(item);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData) => {
        console.log("Form Submitted:", modalMode, formData);
        // Disini nanti integrasi API POST/PUT
        // if (modalMode === 'create') api.post(endpoint, formData)...
        // if (modalMode === 'edit') api.put(endpoint + '/' + formData.id, formData)...
        setIsModalOpen(false);
        if (onRefresh) onRefresh(); // Refresh data setelah submit
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full animate-fadeIn">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder={searchPlaceholder} 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {onRefresh && (
                        <button onClick={onRefresh} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    )}
                    {/* Default Create Button logic: if formFields exist, show modal trigger */}
                    {(formFields.length > 0) && (
                        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
                            <Plus size={18} />
                            <span>Tambah</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-grow custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            {(formFields.length > 0 || onEdit || onDelete) && (
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading && filteredData.length === 0 ? (
                            <tr><td colSpan="100%" className="p-8 text-center text-gray-400">Memuat data...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan="100%" className="p-8 text-center text-gray-400">Data tidak ditemukan.</td></tr>
                        ) : (
                            filteredData.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-gray-50 transition-colors group">
                                    {columns.map((col, cIdx) => (
                                        <td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                                        </td>
                                    ))}
                                    {(formFields.length > 0 || onEdit || onDelete) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                {onDelete && (
                                                    <button onClick={() => onDelete(row)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Static for now) */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
                <span className="text-xs text-gray-500">Menampilkan {filteredData.length} data</span>
                <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
                    <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled><ChevronRight size={16} /></button>
                </div>
            </div>

            {/* Modal Form */}
            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`${modalMode === 'create' ? 'Tambah' : 'Edit'} ${title}`}
                fields={formFields}
                initialData={editData}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
};

export default CrudTable;