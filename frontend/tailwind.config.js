/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // ── Backgrounds
        ink:     '#FAFAFA',
        surface: '#F1F5F9',
        panel:   '#FFFFFF',

        // ── Borders
        border: '#E2E8F0',
        'border-md': '#CBD5E1',

        // ── Primary — Soft Indigo
        accent:        '#4F46E5',
        'accent-dim':  '#4338CA',
        'accent-glow': 'rgba(79,70,229,0.08)',
        'accent-light':'#EEF2FF',

        // ── Signal — Calm Green
        signal:       '#22C55E',
        'signal-dim': '#16A34A',
        'signal-bg':  '#F0FDF4',
        'signal-border':'#BBF7D0',

        // ── Info Blue
        info:     '#0EA5E9',
        'info-bg':'#F0F9FF',

        // ── Warning Orange
        warn:     '#F59E0B',
        'warn-bg':'#FFFBEB',

        // ── Danger Red
        danger:         '#EF4444',
        'danger-bg':    '#FEF2F2',
        'danger-border':'#FECACA',

        // ── Typography
        text:       '#1E293B',
        'text-dim': '#64748B',
        muted:      '#94A3B8',
      },

      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'slide-in':   'slideIn 0.35s ease-out forwards',
        'glow':       'glowPulse 2s ease-in-out infinite alternate',
        'scan':       'scan 2s linear infinite',
      },

      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%':   { boxShadow: '0 0 0px rgba(79,70,229,0.0)' },
          '100%': { boxShadow: '0 0 20px rgba(79,70,229,0.28)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },

      boxShadow: {
        accent: '0 4px 20px rgba(79,70,229,0.25)',
        panel:  '0 2px 12px rgba(0,0,0,0.06)',
        card:   '0 1px 4px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
