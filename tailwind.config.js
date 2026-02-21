/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0c",
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          hover: "rgba(255, 255, 255, 0.06)",
        },
        primary: {
          DEFAULT: "#6366f1", // Indigo
          hover: "#4f46e5",
          muted: "rgba(99, 102, 241, 0.1)",
        },
        secondary: {
          DEFAULT: "#a855f7", // Purple
          hover: "#9333ea",
          muted: "rgba(168, 85, 247, 0.1)",
        },
        accent: {
          DEFAULT: "#06b6d4", // Cyan
          hover: "#0891b2",
          muted: "rgba(6, 182, 212, 0.1)",
        },
        border: "rgba(255, 255, 255, 0.08)",
        conflict: "#ef4444",
        success: "#22c55e",
        warning: "#f59e0b",
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)",
        "primary-gradient": "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        "glow-gradient": "radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
