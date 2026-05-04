import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139, 92, 246, 0.18), 0 24px 80px rgba(0, 0, 0, 0.42)"
      }
    }
  },
  plugins: []
} satisfies Config;
