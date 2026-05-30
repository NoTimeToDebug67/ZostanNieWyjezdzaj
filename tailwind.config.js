/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nature-inspired palette
        'forest': '#1B4332',
        'forest-mid': '#2D6A4F',
        'forest-light': '#40916C',
        'mint': '#52B788',
        'mint-light': '#95D5B2',
        'cream': '#FEFAE0',
        'warm-orange': '#F97316',
        'warm-amber': '#F59E0B',
        'graphite': '#1a1a1a',
        'graphite-light': '#6b7280',
        'soft-bg': '#F8FAF9',
        'card-border': '#E8F0EC',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'fab': '0 8px 28px rgba(27, 67, 50, 0.35)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
    },
  },
  plugins: [],
}
