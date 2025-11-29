/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // PERBAIKAN: Menambahkan path agar Tailwind memindai file Anda
    './src/**/*.{js,jsx,ts,tsx}',
    './admin/**/*.php',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Menambahkan font Inter agar konsisten
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}