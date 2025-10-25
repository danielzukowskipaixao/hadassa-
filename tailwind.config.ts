import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(180 20% 8%)',
        foreground: 'hsl(165 70% 90%)',
        card: 'hsla(180, 12%, 12%, 0.6)',
        pop: '#a6d4ff',
        mint: '#b9ffea',
        aqua: '#9ad6d2',
        sea: '#6fb0a7',
        ink: '#082524',
        pastel: {
          lilac: '#cabdff',
          blue: '#cfe7ff',
          aqua: '#c9fff4',
        },
      },
      borderRadius: {
        lg: '16px',
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.25)'
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
export default config
