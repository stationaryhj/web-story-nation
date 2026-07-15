// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './views/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'max-sm': { max: '639px' },
      'max-md': { max: '767px' },
      'max-lg': { max: '1023px' },
      'max-xl': { max: '1279px' },
      /* 객체형(max-*) 항목과 혼재하면 min-[...] 임의 변형이 비활성화되므로
         480px 구간은 named 스크린으로 제공한다 */
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'var(--font-noto-sans-kr)', 'sans-serif'],
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
        // ── Semantic 토큰 (CSS 변수 기반, .dark에서 자동 스왑) ──
        // RGB 채널(`R G B`) 변수를 참조하므로 `bg-surface/50` 같은 alpha 유틸이 동작한다.
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          sunken: 'rgb(var(--color-surface-sunken) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
          'elevated-hover': 'rgb(var(--color-surface-elevated-hover) / <alpha-value>)',
        },
        border: {
          default: 'rgb(var(--color-border-default) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          hover: 'rgb(var(--color-brand-hover) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
        },
        overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
        primary: {
          '50': '#EEF2FF',
          '100': '#E0E7FF',
          '200': '#C7D2FE',
          '300': '#A5B4FC',
          '400': '#818CF8',
          '500': '#432df1',
          '600': '#4F46E5',
          '700': '#4338CA',
          '800': '#3730A3',
          '900': '#3730A3',
          DEFAULT: '#432df1',
        },
        secondary: {
          '50': '#F8FAFC',
          '100': '#F1F5F9',
          '200': '#E2E8F0',
          '300': '#CBD5E1',
          '400': '#94A3B8',
          '500': '#64748B',
          '600': '#475569',
          '700': '#334155',
          '800': '#1E293B',
          '900': '#0F172A',
          DEFAULT: '#4b477e',
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
        button: {
          primary: '#432df1',
          primaryHover: '#5a46fa',
          gray: '#e9eaeb',
          grayHover: '#F1F2F2',
        },
        text: {
          black: '#101010',
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
          inverse: 'rgb(var(--color-text-inverse) / <alpha-value>)',
        },
        icons: {
          primary: '#6B7280',
        },
        dark: {
          primary: {
            '50': '#1A1A2E',
            '100': '#16213E',
            '200': '#0F3460',
            '300': '#0A2647',
            '400': '#144272',
            '500': '#205295',
            '600': '#2C74B3',
            '700': '#5DA3FA',
            '800': '#8BBCFF',
            '900': '#C4DDFF',
          },
          secondary: {
            '50': '#0F172A',
            '100': '#1E293B',
            '200': '#334155',
            '300': '#475569',
            '400': '#64748B',
            '500': '#94A3B8',
            '600': '#CBD5E1',
            '700': '#E2E8F0',
            '800': '#F1F5F9',
            '900': '#F8FAFC',
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
        v2: {
          black: {
            Default: '#000000',
            '50': '#292929',
          },
          gray: {
            '50': '#F8F8F8',
            '100': '#F4F5F5',
            '200': '#F1F2F2',
            '300': '#E9EAEB',
            '400': '#E5E7EB',
            '500': '#A6A6A6',
            '600': '#909090',
            '700': '#6B7280',
          },
          red: {
            DEFAULT: '#FF4242',
          },
          purple: {
            DEFAULT: '#7665FF',
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
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};

export default config;
