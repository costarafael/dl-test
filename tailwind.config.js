/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Corrija o array 'content'
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // Este é o caminho correto e oficial para as versões modernas do flowbite-react
    "./node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      }
    },
  },
  // 2. Simplifique os plugins, usando apenas o plugin principal do Flowbite
  plugins: [
    require('flowbite/plugin'),
  ],
};