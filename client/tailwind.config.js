/** @type {import('tailwindcss').Config} */
export default {
  // Scan semua file React untuk class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Mode gelap menggunakan class (toggle manual + prefers-color-scheme)
  darkMode: 'class',
  theme: {
    extend: {
      // Palet warna utama aplikasi
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // Warna utama
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        success: {
          50:  '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        danger: {
          50:  '#fff1f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          50:  '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Warna surface untuk dark mode
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      // Font keluarga
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      // Radius yang digunakan secara konsisten
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      // Animasi kustom
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'skeleton': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.2s ease-out',
        'slide-up':      'slide-up 0.3s ease-out',
        'slide-in-right':'slide-in-right 0.3s ease-out',
        'skeleton':      'skeleton 1.5s ease-in-out infinite',
        'spin-slow':     'spin 3s linear infinite',
      },
      // Safe area untuk iOS notch
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
      // Ukuran layar
      screens: {
        'xs': '360px',  // Smartphone kecil
        'sm': '480px',
        'md': '768px',  // Tablet
        'lg': '1024px', // Desktop
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
