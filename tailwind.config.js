/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          50: '#fdf7f4', // very light atomic orange
          100: '#fbece5', // light atomic orange
          500: '#f08a4f', // lighter orange
          600: '#E9631A', // Atomic Orange (Primary)
          700: '#c85213', // hover dark
          900: '#752d07', // darkest for text
        }
      }
    },
  },
  plugins: [],
}
