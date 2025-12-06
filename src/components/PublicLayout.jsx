import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function PublicLayout({ children }) {
    const { user } = useData();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navbar */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
                    <div className="w-full py-4 flex items-center justify-between border-b border-indigo-500 lg:border-none">
                        <div className="flex items-center">
                            <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tighter">
                                AMANAH<span className="text-gray-900">TRAVEL</span>
                            </Link>
                            <div className="hidden ml-10 space-x-8 lg:block">
                                <Link to="/" className="text-base font-medium text-gray-500 hover:text-indigo-600">Beranda</Link>
                                <Link to="/catalog" className="text-base font-medium text-gray-500 hover:text-indigo-600">Paket Umroh</Link>
                                <Link to="/check-status" className="text-base font-medium text-gray-500 hover:text-indigo-600">Cek Porsi/Visa</Link>
                                {/* Link Halaman Statis */}
                                <Link to="/page/tentang-kami" className="text-base font-medium text-gray-500 hover:text-indigo-600">Tentang Kami</Link>
                            </div>
                        </div>
                        <div className="ml-10 space-x-4 flex items-center">
                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                >
                                    <UserCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                                    Dashboard Saya
                                </button>
                            ) : (
                                <>
                                    <Link to="/login" className="inline-block bg-white py-2 px-4 border border-indigo-600 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50">
                                        Masuk
                                    </Link>
                                    <Link to="/register" className="inline-block bg-indigo-600 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-indigo-700">
                                        Daftar
                                    </Link>
                                </>
                            )}
                            {/* Mobile menu button */}
                            <div className="lg:hidden ml-2">
                                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400 hover:text-gray-500">
                                    {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="py-4 flex flex-col space-y-4 lg:hidden">
                            <Link to="/" className="text-base font-medium text-gray-900 hover:text-indigo-600">Beranda</Link>
                            <Link to="/catalog" className="text-base font-medium text-gray-900 hover:text-indigo-600">Paket Umroh</Link>
                            <Link to="/check-status" className="text-base font-medium text-gray-900 hover:text-indigo-600">Cek Status</Link>
                            <Link to="/page/tentang-kami" className="text-base font-medium text-gray-900 hover:text-indigo-600">Tentang Kami</Link>
                            <Link to="/page/kontak" className="text-base font-medium text-gray-900 hover:text-indigo-600">Hubungi Kami</Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-xl font-bold mb-4">PT. Amanah Travel</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Melayani perjalanan ibadah Umroh dan Haji Khusus dengan pelayanan prima sesuai sunnah.
                                Izin Kemenag No. 123/2024.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Perusahaan</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/page/tentang-kami" className="hover:text-white">Tentang Kami</Link></li>
                                <li><Link to="/page/karir" className="hover:text-white">Karir</Link></li>
                                <li><Link to="/page/legalitas" className="hover:text-white">Legalitas</Link></li>
                                <li><Link to="/page/galeri" className="hover:text-white">Galeri Kegiatan</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Bantuan</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/page/faq" className="hover:text-white">FAQ</Link></li>
                                <li><Link to="/page/syarat-ketentuan" className="hover:text-white">Syarat & Ketentuan</Link></li>
                                <li><Link to="/page/kebijakan-privasi" className="hover:text-white">Kebijakan Privasi</Link></li>
                                <li><Link to="/page/kontak" className="hover:text-white">Hubungi Kami</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} PT Amanah Travel Umroh. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}