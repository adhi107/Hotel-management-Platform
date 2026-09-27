/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          bg: 'var(--bg-app)',
          dark: 'var(--bg-surface-subtle)',
          card: 'var(--bg-surface)',
          cardHover: 'var(--bg-surface-hover)',
          border: 'var(--border-subtle)',
          borderStrong: 'var(--border-strong)',
          text: 'var(--text-primary)',
          muted: 'var(--text-muted)',
          secondary: 'var(--text-secondary)',
          black: 'var(--accent-black)',
          blue: 'var(--accent-blue)',
          indigo: '#4F46E5',
          violet: '#7C3AED',
          emerald: 'var(--accent-emerald)',
          amber: 'var(--accent-amber)',
          rose: 'var(--accent-rose)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-elevated': 'var(--shadow-card-elevated)',
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
}
