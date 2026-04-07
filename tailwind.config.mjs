/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        brand: "#4EC5D4",
        cta: "#FF4D5A",
        highlight: "#F6C445",
        accent: "#FF2F92",
        "deep-cta": "#E03545",
        surface: "#FFF6E8",
        "text-muted": "#555555",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        accent: ["Pacifico", "cursive"],
      },
    },
  },
  plugins: [],
};
