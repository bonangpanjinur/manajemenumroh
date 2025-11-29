import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// PERBAIKAN: Mengganti prop 'show' menjadi 'isOpen' agar sesuai dengan panggilan di Pages
const Modal = ({ isOpen, onClose, title, children, size = 'max-w-2xl', footer }) => {
    
    // Efek untuk menutup modal saat menekan tombol Escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Jika tidak open, jangan render apa-apa
    if (!isOpen) {
        return null;
    }

    // Klik di luar modal (overlay) akan menutup modal
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10"
            onClick={handleOverlayClick}
        >
            <div className={`bg-white rounded-lg shadow-xl w-full ${size} m-4 flex flex-col max-h-[90vh]`}>
                {/* Header Modal */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Konten Modal (scrollable) */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
                
                {/* Footer Modal (jika ada) */}
                {footer && (
                    <div className="flex justify-end items-center p-4 border-t space-x-2 bg-gray-50 rounded-b-lg">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;