import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e1a",
        card: {
          DEFAULT: "#1a2332",
          dark: "#0f1419",
        },
        primary: {
          DEFAULT: "#10b981",
          hover: "#059669",
        },
        danger: {
          DEFAULT: "#ef4444",
          hover: "#dc2626",
        },
        text: {
          primary: "#ffffff",
          secondary: "#9ca3af",
          muted: "#6b7280",
        },
        border: "#2d3748",
        input: {
          bg: "#1a2332",
        },
        status: {
          done: "#10b981",
          progress: "#f59e0b",
          mr: "#3b82f6",
          dt: "#8b5cf6",
          completed: "#059669",
          replied: "#6b7280",
        },
      },
      borderRadius: {
        card: "12px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
