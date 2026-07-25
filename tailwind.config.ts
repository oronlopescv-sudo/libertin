import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FDF1F6',
          100: '#FBE1EB',
          300: '#F5B8CC',
          400: '#EC88A3',
          500: '#D4145A',
          600: '#B80D4F',
          700: '#A00E44',
          900: '#6B0C2D',
        },
        secondary: {
          50: '#F5F1F9',
          500: '#593E60',
          700: '#3D2940',
          900: '#2C1B3D',
        },
      },
    },
  },
  plugins: [],
}
export default config
