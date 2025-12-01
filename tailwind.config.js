/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#262626", // dunkler App-Hintergrund
        surface: "#FFF6EB",    // Header-Bar (TIME / KUNDE / …)
        jobRow: "#4A7EC2",     // blau (Projekte / Aufträge – kannst du tauschen)
        projectRow: "#705CD6", // lila
      },
      fontFamily: {
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;

