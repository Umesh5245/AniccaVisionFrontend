import type { Config } from "tailwindcss";

// Design tokens live in the shared library preset so the app and the
// standalone @anicca/ui build stay in lockstep.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/anicca-ui/src/**/*.{ts,tsx}"
  ],
  presets: [require("./packages/anicca-ui/tailwind-preset.cjs")],
  plugins: []
};

export default config;
