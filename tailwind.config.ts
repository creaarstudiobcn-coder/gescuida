import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Verdes marinos / salvia (guiño a Mataró, ciudad de mar)
        marino: {
          50: "#eef5f4",
          100: "#d4e6e3",
          200: "#a9cdc7",
          300: "#7bb0a8",
          400: "#54928a",
          500: "#3a7770",
          600: "#2d5f59",
          700: "#264c48",
          800: "#1f3d3a",
          900: "#1a3230",
        },
        salvia: {
          50: "#f3f6f1",
          100: "#e3ebdd",
          200: "#c8d8bd",
          300: "#a6bf95",
          400: "#86a572",
          500: "#6a8a57",
          600: "#526d43",
          700: "#415636",
          800: "#36462e",
          900: "#2e3b28",
        },
        crema: {
          50: "#fdfcf8",
          100: "#faf6ec",
          200: "#f4ecd6",
          300: "#ecddb8",
          400: "#e0c891",
        },
        // Acento naranja cálido para acciones principales
        calido: {
          50: "#fff5ed",
          100: "#ffe8d4",
          200: "#fecca8",
          300: "#fda871",
          400: "#fb7c38",
          500: "#f9591a",
          600: "#ea3f0f",
          700: "#c22e10",
          800: "#9a2615",
          900: "#7c2214",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
