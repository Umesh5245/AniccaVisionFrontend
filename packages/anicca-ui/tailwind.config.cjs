/** Standalone Tailwind config for the library's own CSS build (design-sync).
 *  The host app has its own config that also applies this preset. */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("./tailwind-preset.cjs")],
  plugins: []
};
