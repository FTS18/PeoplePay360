import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          foreground: "var(--danger-foreground)",
        },
        "card-glass": "var(--card-glass)",
        "popover-glass": "var(--popover-glass)",
        "border-subtle": "var(--border-subtle)",
        "segmented-track": "var(--segmented-track)",
        "segmented-thumb": "var(--segmented-thumb)",
      },
      boxShadow: {
        "apple-sm": "var(--shadow-apple-sm)",
        "apple-md": "var(--shadow-apple-md)",
        "apple-lg": "var(--shadow-apple-lg)",
        "apple-modal": "var(--shadow-apple-modal)",
      },
      backdropBlur: {
        glass: "20px",
        "glass-lg": "28px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-anton)", "var(--font-oswald)", "sans-serif"],
        anton: ["var(--font-anton)", "sans-serif"],
        oswald: ["var(--font-oswald)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "serif"],
        instrument: ["var(--font-instrument-serif)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
