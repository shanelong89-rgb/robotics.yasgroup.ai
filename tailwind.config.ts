import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "yas-black": "#020203",
        "yas-base": "#0A0E1A",
        "yas-surface": "#0F1628",
        "yas-panel": "#131929",
        "yas-blue": "#3B82F6",
        "yas-teal": "#14B8A6",
        "yas-amber": "#F59E0B",
        "yas-red": "#EF4444",
        "yas-green": "#22C55E",
        "yas-muted": "#64748B",
        "yas-text": "#F1F5F9",
        "yas-subtext": "#94A3B8",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      borderColor: {
        "yas-border": "rgba(255,255,255,0.08)",
      },
      backdropBlur: {
        glass: "20px",
      },
      backdropSaturate: {
        glass: "180%",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-subtle": "bounce 2s ease-in-out infinite",
      },
      keyframes: {
        "ping-slow": {
          "75%, 100%": {
            transform: "scale(2)",
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
