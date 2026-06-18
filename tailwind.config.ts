import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Identidad de marca GesCuida ──
        // Las escalas conservan sus nombres (marino/salvia/calido/crema) para no tocar
        // las clases existentes, pero ahora mapean a los verdes de marca:
        //  marino = verde profundo/tinta (títulos y texto)   #14533C / #14302A
        //  calido = verde principal (acciones/CTA)            #2E9B72
        //  salvia = verde hoja + menta (acentos y fondos)     #5BBE8E / #E2F1E8
        //  crema  = crema cálida (fondos suaves)              #FAF7EF
        marino: {
          50: "#eef6f2",
          100: "#d6e9df",
          200: "#aed5c4",
          300: "#7fbaa0",
          400: "#4f9880",
          500: "#2f7a61",
          600: "#226b50",
          700: "#1a5b43",
          800: "#14533c", // verde profundo (títulos)
          900: "#14302a", // tinta oscura (texto)
        },
        salvia: {
          50: "#e2f1e8", // menta suave
          100: "#cdead7",
          200: "#a6dabb",
          300: "#79c79c",
          400: "#5bbe8e", // verde hoja
          500: "#45a878",
          600: "#368661",
          700: "#2b6c4e",
          800: "#245742",
          900: "#1e4838",
        },
        crema: {
          50: "#faf7ef", // crema de marca
          100: "#f4eee0",
          200: "#ece1c9",
          300: "#e2d3ad",
          400: "#d4c08f",
        },
        // Acción principal / CTA — verde principal de marca
        calido: {
          50: "#e9f7f0",
          100: "#caecdb",
          200: "#9fddbd",
          300: "#6fca9c",
          400: "#45b482",
          500: "#2e9b72", // verde principal (CTA)
          600: "#25805e",
          700: "#1f6749",
          800: "#1a533c",
          900: "#154030",
        },
        // Tokens de marca con nombre propio (por si se quieren usar explícitamente)
        brand: {
          deep: "#14533C",
          green: "#2E9B72",
          leaf: "#5BBE8E",
          mint: "#E2F1E8",
          cream: "#FAF7EF",
          ink: "#14302A",
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
