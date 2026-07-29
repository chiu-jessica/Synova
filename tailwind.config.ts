import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: "#069494", dark: "#057575", light: "#E0F3F3" },
        orange: { DEFAULT: "#FF8243", light: "#FFE7DA" },
        pink: { DEFAULT: "#FFC0CB", light: "#FFF0F3" },
        yellow: { DEFAULT: "#FCE883", light: "#FFFAE6" },
        ink: "#1C1C1C",
        muted: "#6B7280",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
