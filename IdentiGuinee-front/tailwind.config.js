/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d631b',
          container: '#2e7d32',
          fixed: '#a3f69c',
          'fixed-dim': '#88d982',
        },
        secondary: {
          DEFAULT: '#835400',
          container: '#fcab28',
          fixed: '#ffddb5',
          'fixed-dim': '#ffb957',
        },
        tertiary: {
          DEFAULT: '#ac0c18',
          container: '#d02d2d',
          fixed: '#ffdad6',
          'fixed-dim': '#ffb3ac',
        },
        background: '#f8faf4',
        surface: {
          DEFAULT: '#f8faf4',
          dim: '#d8dbd5',
          bright: '#f8faf4',
          container: {
            lowest: '#ffffff',
            low: '#f2f4ee',
            DEFAULT: '#edefe9',
            high: '#e7e9e3',
            highest: '#e1e3dd',
          },
          variant: '#e1e3dd',
        },
        on: {
          primary: '#ffffff',
          secondary: '#ffffff',
          tertiary: '#ffffff',
          background: '#191c19',
          surface: {
            DEFAULT: '#191c19',
            variant: '#40493d',
          },
          error: '#ffffff',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        outline: {
          DEFAULT: '#707a6c',
          variant: '#bfcaba',
        },
        brand: {
          red: '#ce1126',
          yellow: '#fcd116',
          green: '#009460',
          deepGreen: '#1B5E20',
        }
      },
      fontFamily: {
        headline: ["Newsreader", "serif"],
        body: ["Public Sans", "sans-serif"],
        label: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
        institutional: ['Cormorant Garamond', 'serif'],
        title: ['Playfair Display', 'serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        'scan-line': 'scan 3s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' }
        }
      }
    },
  },
  plugins: [],
}
