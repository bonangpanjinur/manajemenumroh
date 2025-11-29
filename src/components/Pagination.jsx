import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
    const { current_page, total_pages, total_items } = pagination;

    if (total_pages <= 1) {
        return <div className="text-sm text-gray-600 mt-4">Total {total_items} items</div>;
    }

    const pages = [];
    const maxPagesToShow = 5; // Jumlah tombol halaman (misal: 3, 4, 5, 6, 7)
    let startPage = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(total_pages, startPage + maxPagesToShow - 1);

    // Adjusment jika di akhir halaman
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
                Menampilkan halaman {current_page} dari {total_pages} (Total {total_items} item)
            </span>
            <div className="flex items-center space-x-1">
                {/* Tombol Ke Halaman Pertama */}
                {current_page > 1 && (
                     <button
                        onClick={() => onPageChange(1)}
                        className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Awal
                    </button>
                )}
                
                {/* Tombol Mundur */}
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronLeft size={16} />
                </button>
                
                {/* Tombol ... di awal */}
                {startPage > 1 && (
                    <>
                        <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">1</button>
                        <span className="px-3 py-1 text-sm">...</span>
                    </>
                )}
                
                {/* Tombol Halaman */}
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                            page === current_page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Tombol ... di akhir */}
                {endPage < total_pages && (
                    <>
                        <span className="px-3 py-1 text-sm">...</span>
                        <button onClick={() => onPageChange(total_pages)} className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">{total_pages}</button>
                    </>
                )}

                {/* Tombol Maju */}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === total_pages}
                    className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronRight size={16} />
                </button>
                
                {/* Tombol Ke Halaman Terakhir */}
                 {current_page < total_pages && (
                     <button
                        onClick={() => onPageChange(total_pages)}
                        className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Akhir
                    </button>
                )}
            </div>
        </div>
    );
};

export default Pagination;