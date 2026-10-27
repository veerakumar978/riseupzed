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
        midnight: {
          DEFAULT: 'var(--bg-midnight)',
          dark: '#080817',
        },
        panel: {
          primary: 'var(--bg-panel-primary)',
          secondary: 'var(--bg-panel-secondary)',
          elevated: 'var(--bg-panel-elevated)',
          strong: 'var(--bg-surface-strong)',
        },
        brand: {
          'royal-purple': 'var(--brand-royal-purple)',
          'electric-violet': 'var(--brand-electric-violet)',
          'bright-violet': 'var(--brand-bright-violet)',
          'soft-lavender': 'var(--brand-soft-lavender)',
          'cyber-cyan': 'var(--brand-cyber-cyan)',
          'cyan-hover': 'var(--brand-cyan-hover)',
          'luxury-gold': 'var(--brand-luxury-gold)',
        },
        themeText: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        themeBorder: {
          DEFAULT: 'var(--border-dark)',
          subtle: 'var(--border-subtle)',
        },
        semantic: {
          success: 'var(--semantic-success)',
          warning: 'var(--semantic-warning)',
          error: 'var(--semantic-error)',
          info: 'var(--semantic-info)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        control: '8px',
        standard: '12px',
        card: '16px',
        featured: '20px',
        hero: '24px',
      },
      boxShadow: {
        'card-depth': '0 12px 36px -8px rgba(0, 0, 0, 0.45)',
        'card-hover': '0 20px 48px -10px rgba(85, 32, 168, 0.25), 0 0 20px -2px rgba(34, 211, 238, 0.15)',
        'glow-purple': '0 0 24px -4px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 24px -4px rgba(34, 211, 238, 0.35)',
        'glow-gold': '0 0 24px -4px rgba(245, 196, 81, 0.35)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}
