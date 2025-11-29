import React from 'react';
import { Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Spinner from './Spinner.jsx'; 

const CrudTable = ({
    columns,
    data = [],
    loading,
    sortBy,
    onSort,
    onEdit,
    onDelete,
    renderRowActions,
    userCapabilities = [],
    editCapability,
    deleteCapability
}) => {

    // PERBAIKAN: Double protection agar tidak map() pada null/undefined/object
    const safeData = Array.isArray(data) ? data : [];

    const canPerformAction = (capability) => {
        if (!capability) return true;
        if (!userCapabilities) return false;
        if (userCapabilities === 'super_admin' || (Array.isArray(userCapabilities) && userCapabilities.includes('manage_options'))) return true;
        return Array.isArray(userCapabilities) && userCapabilities.includes(capability);
    };
    
    const canEdit = canPerformAction(editCapability);
    const canDelete = canPerformAction(deleteCapability);

    if (loading && safeData.length === 0) {
        return (
            <div className="flex justify-center items-center p-12 bg-white rounded-lg shadow">
                <Spinner text="Sedang memuat data..." />
            </div>
        );
    }

    if (safeData.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-lg shadow border border-gray-100">
                <p className="text-gray-500">Tidak ada data ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.accessor || col.header} 
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => col.sortable && onSort && onSort(col.accessor)}
                            >
                                <div className="flex items-center gap-1">
                                    {col.Header || col.header}
                                    {col.sortable && sortBy && (
                                        <span className="inline-block">
                                            {sortBy.field === col.accessor ? (
                                                sortBy.order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            ) : (
                                                <ArrowUp size={14} className="text-gray-300" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                        {(onEdit || onDelete || renderRowActions) && (
                            <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading && (
                        <tr>
                            <td colSpan={columns.length + 1} className="p-2 bg-blue-50">
                                <div className="flex justify-center items-center text-blue-600 text-xs">
                                    <Spinner size={16} text="Memperbarui data..." />
                                </div>
                            </td>
                        </tr>
                    )}
                    {safeData.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                            {columns.map((col) => (
                                <td key={col.accessor || index} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${col.className || ''}`}>
                                    {/* PERBAIKAN: Safe render untuk nilai null/undefined */}
                                    {col.render 
                                        ? col.render(item, index) // Pass full item to render
                                        : (item[col.accessor] !== undefined && item[col.accessor] !== null ? item[col.accessor] : '-')}
                                </td>
                            ))}
                            {(onEdit || onDelete || renderRowActions) && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    {renderRowActions && renderRowActions(item)}
                                    
                                    {onEdit && canEdit && (
                                        <button 
                                            onClick={() => onEdit(item)} 
                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    )}
                                    
                                    {onDelete && canDelete && (
                                        <button 
                                            onClick={() => onDelete(item)} 
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CrudTable;