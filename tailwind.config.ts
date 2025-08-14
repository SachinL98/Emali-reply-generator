import type { Config } from 'tailwindcss'

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#b8d9ff",
          300: "#8ec1ff",
          400: "#5ea4ff",
          500: "#3e8cff",
          600: "#246ef2",
          700: "#1b54c2",
          800: "#17459a",
          900: "#143b7f"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.07)"
      }
    },
  },
  plugins: [],
} satisfies Config
