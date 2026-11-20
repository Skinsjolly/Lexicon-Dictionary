/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        canvas: '#f7f7f4',
        surface: '#ffffff',
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c8',
          400: '#8591a8',
          500: '#65728c',
          600: '#505b73',
          700: '#424a5d',
          800: '#39404f',
          900: '#202632',
          950: '#12161e',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        mint: {
          50: '#ecfdf8',
          100: '#d1fae8',
          200: '#a7f3d6',
          300: '#6ee7c4',
          400: '#34d3ad',
          500: '#10b994',
          600: '#059477',
          700: '#047760',
          800: '#065f4e',
          900: '#064e41',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.06)',
        lift: '0 18px 50px rgba(16, 24, 40, 0.12)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
