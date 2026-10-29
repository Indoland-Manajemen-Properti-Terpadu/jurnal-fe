/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // (Opsional) Kamu bisa menghubungkan variabel CSS dari globalStyles.css kamu
      // agar bisa dipanggil sebagai utility class Tailwind (misal: text-jurnal-primary)
      colors: {
        jurnal: {
          primary: 'var(--jurnal-color-primary)',
          'primary-subtle': 'var(--jurnal-color-primary-subtle)',
          secondary: 'var(--jurnal-color-secondary)',
          success: 'var(--jurnal-color-success)',
          warning: 'var(--jurnal-color-warning)',
          danger: 'var(--jurnal-color-danger)',
          info: 'var(--jurnal-color-info)',
        },
      },
      fontFamily: {
        // Hubungkan ke font utama aplikasi kamu
        sans: ['Figtree', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
