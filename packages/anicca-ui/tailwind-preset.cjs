/** Shared Anicca design tokens — consumed by the app's tailwind.config and by
 *  the library's own standalone CSS build (for design-sync). */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#3157a8", dark: "#264985", bright: "#1c55c5", deep: "#214b9b" },
        surface: { DEFAULT: "#ffffff", tint: "#eef5fc", muted: "#dfe9f5", page: "#e9eff7" },
        brand: { teal: "#1b7fa5" },
        info: { DEFAULT: "#1688f2", dark: "#0f72ce" }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(31, 41, 55, 0.09)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  }
};
