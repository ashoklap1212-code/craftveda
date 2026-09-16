/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5F0E8',
          200: '#EBE2D3',
          DEFAULT: '#FDFBF7',
        },
        sand: {
          50: '#FBF9F4',
          100: '#F4EFE6',
          200: '#E6DC9D',
          DEFAULT: '#F4EFE6',
        },
        terracotta: {
          50: '#FDF5F2',
          100: '#F9E5DD',
          200: '#F2C9B9',
          300: '#EAAB94',
          400: '#DC7351',
          500: '#C85A32',
          600: '#B84A22',
          700: '#963919',
          800: '#7B2E15',
          900: '#642613',
          DEFAULT: '#C85A32',
        },
        clay: {
          light: '#F7ECE7',
          DEFAULT: '#D98A6C',
          dark: '#B06448',
        },
        earth: {
          50: '#F7F5F4',
          100: '#ECE7E4',
          200: '#D5CCC6',
          300: '#B9A9A0',
          400: '#978278',
          500: '#7C6860',
          600: '#63514A',
          700: '#4A352F',
          800: '#382621',
          900: '#2A1A16',
          DEFAULT: '#4A352F',
        },
        sage: {
          50: '#F4F6F3',
          100: '#E4EAE1',
          200: '#C9D6C3',
          300: '#A4B99B',
          500: '#5E7053',
          700: '#3D4C35',
          DEFAULT: '#5E7053',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(74, 53, 47, 0.08), 0 2px 6px -1px rgba(74, 53, 47, 0.04)',
        'warm-hover': '0 12px 30px -4px rgba(200, 90, 50, 0.15), 0 4px 12px -2px rgba(74, 53, 47, 0.08)',
        'card': '0 2px 12px 0 rgba(74, 53, 47, 0.05)',
      }
    },
  },
  plugins: [],
}
