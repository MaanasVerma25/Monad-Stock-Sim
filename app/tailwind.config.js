/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#080C14",
        surface: "#0F172A",
        "terminal-border": "#1E293B",
        bright: "#F8FAFC",
        subtle: "#94A3B8",
        "accent-green": "#22C55E",
        "accent-cyan": "#38BDF8",
        "accent-red": "#EF4444",

        border: "#1E293B",
        input: "#1E293B",
        ring: "#38BDF8",
        background: "#080C14",
        foreground: "#F8FAFC",
        primary: {
          DEFAULT: "#22C55E",
          foreground: "#080C14",
        },
        secondary: {
          DEFAULT: "#0F172A",
          foreground: "#F8FAFC",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#F8FAFC",
        },
        muted: {
          DEFAULT: "#1E293B",
          foreground: "#94A3B8",
        },
        accent: {
          DEFAULT: "#38BDF8",
          foreground: "#080C14",
        },
        popover: {
          DEFAULT: "#0F172A",
          foreground: "#F8FAFC",
        },
        card: {
          DEFAULT: "#0F172A",
          foreground: "#F8FAFC",
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
}