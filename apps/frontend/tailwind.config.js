/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Cal Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      colors: {
        // CRM Color Palette
        primary: {
          500: '#2563eb', // Blue for primary actions
          600: '#1d4ed8',
          700: '#1e40af',
        },
        crm: {
          bg: '#0A0B0D', // Main dark background
          panel: '#121417', // Secondary panels  
          card: '#1A1C21', // Cards/rows
          hover: '#202329', // Hover states
          border: '#262A30', // Subtle borders
          borderDefault: '#30343C', // Default borders
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.5)',
        'lg': '0 4px 8px rgba(0, 0, 0, 0.6)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        'display-xs': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl': ['3.75rem', { lineHeight: '4.25rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-2xl': ['4.5rem', { lineHeight: '5rem', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
        '1500': '1500ms',
        '2000': '2000ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}