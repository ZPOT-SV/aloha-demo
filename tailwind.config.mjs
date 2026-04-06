/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: '#800080',
        cta: '#FF00FF',
        highlight: '#FFD700',
        accent: '#00FFFF',
        'deep-cta': '#FF1493',
        surface: '#F5F5F5',
        'text-muted': '#6B7280'
      }
    }
  },
  plugins: []
};
