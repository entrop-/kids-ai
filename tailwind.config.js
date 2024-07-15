/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.{html,js,vue,ts}"],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}

