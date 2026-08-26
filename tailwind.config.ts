import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        whereist: ["var(--font-whereist)", "sans-serif"],
        avignon: ["var(--font-avignon)", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
