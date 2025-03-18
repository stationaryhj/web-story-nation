// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 다크모드 클래스 기반으로 설정
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'], //
      },
      width: {
        '1/10': '10%',
        '2/10': '20%',
        '3/10': '30%',
        '4/10': '40%',
        '5/10': '50%',
        '6/10': '60%',
        '7/10': '70%',
        '8/10': '80%',
        '9/10': '90%',
      },
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // 메인 컬러
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        accent: {
          light: '#FF6B6B',
          DEFAULT: '#FF5252',
          dark: '#FF4242',
        },
        background: {
          light: '#FFFFFF',
          DEFAULT: '#F9FAFB',
          dark: '#F3F4F6',
        },
        // 다크모드 컬러 추가
        dark: {
          primary: {
            50: '#1A1A2E',
            100: '#16213E',
            200: '#0F3460',
            300: '#0A2647',
            400: '#144272',
            500: '#205295', // 다크모드 메인 컬러
            600: '#2C74B3',
            700: '#5DA3FA',
            800: '#8BBCFF',
            900: '#C4DDFF',
          },
          secondary: {
            50: '#0F172A',
            100: '#1E293B',
            200: '#334155',
            300: '#475569',
            400: '#64748B',
            500: '#94A3B8',
            600: '#CBD5E1',
            700: '#E2E8F0',
            800: '#F1F5F9',
            900: '#F8FAFC',
          },
          background: {
            light: '#1E1E2E',
            DEFAULT: '#13111C',
            dark: '#0F0E17',
          },
          accent: {
            light: '#FF6B6B',
            DEFAULT: '#FF5252',
            dark: '#FF4242',
          },
        },
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1152px',
          '2xl': '1280px',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, #13111C, #1E1E2E)',
      },
    },
  },
  plugins: [],
}

export default config