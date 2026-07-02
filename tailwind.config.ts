import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF6EC",
        ink: "#20301F",
        "shop-green": "#2F5233",
        "shop-green-dark": "#1E3922",
        turmeric: "#E3A008",
        brick: "#B5432E",
        line: "#D9CFB8",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 1px 1px, rgba(32,48,31,0.06) 1px, transparent 0)",
      },
      backgroundSize: {
        grain: "18px 18px",
      },
    },
  },
  plugins: [],
};
export default config;
