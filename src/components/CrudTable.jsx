import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Spinner from './Spinner';

const CrudTable = ({ columns, data, loading, onEdit, onDelete }) => {
    
    // 1. Tampilkan Loading
    if (loading) {
        return <div className="p-8 flex justify-center"><Spinner /></div>;
    }

    // 2. Proteksi Data Kosong/Undefined (Penyebab Crash Utama)
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 border border-dashed rounded-lg">
                Tidak ada data yang ditemukan.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3 w-10">#</th>
                        {columns.map((col, index) => (
                            <th key={index} className="px-6 py-3">
                                {col.header}
                            </th>
                        ))}
                        {(onEdit || onDelete) && <th className="px-6 py-3 text-right">Aksi</th>}
                    </tr>
                </thead>
                <tbody>
                    {/* Disini error .map terjadi sebelumnya. Sekarang sudah aman karena ada proteksi di atas */}
                    {data.map((item, rowIndex) => (
                        <tr key={item.id || item.uuid || rowIndex} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">{rowIndex + 1}</td>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className="px-6 py-4">
                                    {col.render ? col.render(item) : item[col.accessor]}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {onEdit && (
                                        <button 
                                            onClick={() => onEdit(item)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button 
                                            onClick={() => onDelete(item)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
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