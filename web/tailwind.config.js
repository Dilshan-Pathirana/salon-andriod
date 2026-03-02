
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: "#F0FDFA", // Teal-50 (Light Background)
          green: "#CCFBF1", // Teal-100 (Light Accent)
          champagne: "#0D9488", // Teal-600 (Primary Text/Icon)
          gold: "#10B981", // Emerald-500 (Primary Action)
          brown: "#E2E8F0", // Slate-200 (Borders/Separators)
          white: "#0F172A", // Slate-900 (Main Text)
          muted: "#64748B", // Slate-500 (Muted Text)
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.15em',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}

