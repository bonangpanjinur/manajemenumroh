import React from 'react';
import { Edit, Trash2, Search, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

const CrudTable = ({ 
  columns, 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  pagination, 
  onPageChange,
  onSearch,
  searchPlaceholder = "Cari data..."
}) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col h-full">
      {/* Header Tools */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50 rounded-t-lg">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area - Relative for loader overlay */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                <span className="text-sm text-gray-500">Memuat data...</span>
            </div>
          </div>
        )}

        {/* RESPONSIVE WRAPPER: Kunci agar tabel bisa di-scroll di HP */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-0">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-sm">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item, rowIdx) => (
                  <tr key={item.id || rowIdx} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof col.accessor === 'function' 
                          ? col.accessor(item) 
                          : item[col.accessor]}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white shadow-sm">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} 
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    {!loading && "Tidak ada data ditemukan."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-auto">
          <div className="flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> sampai <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-medium">{pagination.total}</span> hasil
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Simplifikasi nomor halaman untuk responsif */}
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Halaman {pagination.page} / {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.page >= pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
            {/* Mobile Pagination View */}
            <div className="flex items-center justify-between sm:hidden w-full">
               <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-700">
                  Hal {pagination.page}
                </span>
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudTable;