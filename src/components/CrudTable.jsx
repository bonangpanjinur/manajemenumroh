import React from 'react';
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';
import Spinner from './Spinner'; // Pastikan file Spinner ada

const CrudTable = ({
    title = "Data Table",
    columns = [],         // Default array kosong
    data = [],            // Default array kosong
    loading = false,
    onCreate,
    onEdit,
    onDelete,
    onRefresh,
    searchPlaceholder = "Cari data...",
    formFields = []       // Default array kosong
}) => {
    // 1. Validasi Props (Super Defensive)
    const safeColumns = Array.isArray(columns) ? columns : [];
    const safeData = Array.isArray(data) ? data : [];
    
    // 2. Render Loading State
    if (loading && safeData.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <Spinner text="Memuat data..." />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            {/* Header Section */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                
                <div className="flex gap-2">
                    {onRefresh && (
                        <button 
                            onClick={onRefresh} 
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                    )}
                    
                    {onCreate && (
                        <button 
                            onClick={onCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <Plus size={16} />
                            <span>Tambah Baru</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Render Columns - AMAN DARI CRASH */}
                            {safeColumns.map((col, idx) => (
                                <th 
                                    key={col.key || idx}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {col.label || col.header || '-'}
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Jika Data Kosong */}
                        {safeData.length === 0 ? (
                            <tr>
                                <td colSpan={safeColumns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                                    {loading ? 'Sedang memuat ulang...' : 'Tidak ada data ditemukan.'}
                                </td>
                            </tr>
                        ) : (
                            // Render Rows - AMAN DARI CRASH
                            safeData.map((row, rowIdx) => (
                                <tr key={row.id || rowIdx} className="hover:bg-gray-50 transition-colors">
                                    {safeColumns.map((col, colIdx) => (
                                        <td key={`${rowIdx}-${colIdx}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {/* Render Cell Logic */}
                                            {col.render 
                                                ? col.render(row[col.key], row) // Custom render
                                                : (row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-') // Default render
                                            }
                                        </td>
                                    ))}
                                    
                                    {(onEdit || onDelete) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {onEdit && (
                                                    <button 
                                                        onClick={() => onEdit(row)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button 
                                                        onClick={() => onDelete(row)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={18} />
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
        </div>
    );
};

export default CrudTable;