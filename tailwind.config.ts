import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'PingFang SC', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f7f5',
          100: '#eeeeea',
          200: '#d6d6ce',
          400: '#8b8b7f',
          600: '#4b4b42',
          900: '#1a1a17',
        },
        accent: {
          DEFAULT: '#ff2c55',
          soft: '#ffe5ec',
        },
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
}

export default config
