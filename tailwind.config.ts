import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3157a8",
          dark: "#264985",
          bright: "#1c55c5",
          deep: "#214b9b"
        },
        surface: {
          DEFAULT: "#ffffff",
          tint: "#eef5fc",
          muted: "#dfe9f5",
          page: "#e9eff7"
        },
        brand: {
          teal: "#1b7fa5"
        },
        info: {
          DEFAULT: "#1688f2",
          dark: "#0f72ce"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(31, 41, 55, 0.09)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
