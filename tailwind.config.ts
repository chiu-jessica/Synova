import type { Config } from "tailwindcss";

// Tropical punch. The four brand hexes are the DEFAULT of each colour.
//
// Two rules keep it readable, both checked against WCAG AA:
//   - Text on a `light` tint uses the matching `deep` shade.
//   - Text on a full-strength fill uses `ink`, except teal, which is dark
//     enough to carry white (use `teal-dark`, not `teal`, behind white text —
//     white on #069494 is only 3.7:1).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#069494",
          deep: "#046B6B",
          dark: "#057575",
          light: "#E0F3F3",
        },
        orange: {
          DEFAULT: "#FF8243",
          deep: "#9C4413",
          light: "#FFE7DA",
        },
        pink: {
          DEFAULT: "#FFC0CB",
          deep: "#B54360",
          light: "#FFF0F3",
        },
        yellow: {
          DEFAULT: "#FCE883",
          deep: "#7A5E00",
          light: "#FFFAE6",
        },
        ink: "#1C1C1C",
        muted: "#6B7280",
      },
      borderRadius: {
        card: "18px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
export default config;
