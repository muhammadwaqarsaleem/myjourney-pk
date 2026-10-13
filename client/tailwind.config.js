/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: "#004D40", // Pakistan heritage emerald
          mint: "#00BFA5",    // Fresh accent
          sand: "#F4F1EA",    // Warm neutral backdrop
          charcoal: "#1E293B" // Accessible high-contrast typography
        }
      }
    },
  },
  plugins: [],
}