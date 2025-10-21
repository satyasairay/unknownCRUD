/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2D6F8F",
          dark: "#1F4D63",
          light: "#4493B3",
        },
      },
    },
  },
  plugins: [],
};
