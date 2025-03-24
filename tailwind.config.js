/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './views/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c3aed', // violet-600
          50: '#f5f3ff', // violet-50
          100: '#ede9fe', // violet-100
          200: '#ddd6fe', // violet-200
          300: '#c4b5fd', // violet-300
          400: '#a78bfa', // violet-400
          500: '#8b5cf6', // violet-500
          600: '#7c3aed', // violet-600
          700: '#6d28d9', // violet-700
          800: '#5b21b6', // violet-800
          900: '#4c1d95', // violet-900
          950: '#2e1065', // violet-950
        },
        background: {
          DEFAULT: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
        },
        secondary: {
          DEFAULT: '#94a3b8', // slate-400
          50: '#f8fafc', // slate-50
          100: '#f1f5f9', // slate-100
          200: '#e2e8f0', // slate-200
          300: '#cbd5e1', // slate-300
          400: '#94a3b8', // slate-400
          500: '#64748b', // slate-500
          600: '#475569', // slate-600
          700: '#334155', // slate-700
          800: '#1e293b', // slate-800
          900: '#0f172a', // slate-900
          950: '#020617', // slate-950
        },
        'dark-secondary': {
          DEFAULT: '#94a3b8', // slate-400
          100: '#f1f5f9', // slate-100
          200: '#e2e8f0', // slate-200
          300: '#cbd5e1', // slate-300
          400: '#94a3b8', // slate-400
          500: '#64748b', // slate-500
          600: '#475569', // slate-600
          700: '#cbd5e1', // slate-300 (역방향)
          800: '#e2e8f0', // slate-200 (역방향)
          900: '#f1f5f9', // slate-100 (역방향)
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
