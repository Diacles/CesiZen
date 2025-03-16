/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00BE62",
        secondary: "#00E074",
        accent: "#FFDE59",
      },
    },
  },
  plugins: [],
}