/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          main: '#1E293B',
          muted: '#64748B',
          light: '#94A3B8',
        },
        primary: {
          DEFAULT: '#2E6F65',
          50: '#F0F7F5',
          100: '#D9ECE8',
          200: '#B5DDD4',
          300: '#8AC7BC',
          400: '#54A89A',
          500: '#2E6F65', // Main Sage
          600: '#255A52',
          700: '#1D453F',
          800: '#15332E',
          900: '#0E221F',
        },
        accent: {
          DEFAULT: '#E07A5F',
          50: '#FDF4F2',
          100: '#FBE6E1',
          200: '#F6CEC4',
          300: '#EEAC9C',
          400: '#E68770',
          500: '#E07A5F', // Main Coral
          600: '#C95F44',
          700: '#A44A32',
          800: '#7F3926',
          900: '#5C291B',
        },
        status: {
          pending: '#F59E0B',
          confirmed: '#10B981',
          completed: '#2E6F65',
          cancelled: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(46, 111, 101, 0.08)',
        'card': '0 2px 12px -1px rgba(30, 41, 59, 0.06)',
        'floating': '0 10px 30px -5px rgba(30, 41, 59, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
