/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          900: '#050b18',
          800: '#0b1a30',
          700: '#0f2547',
          600: '#13315c',
        },
        brand: {
          navy: '#0B2545',
          navyDeep: '#05101f',
          orange: '#F77F00',
          orangeDeep: '#d96c00',
          amber: '#fbbf24',
          ember: '#ff5a1f',
        },
        neon: {
          cyan: '#F77F00',
          blue: '#ff9a3c',
          violet: '#fbbf24',
          pink: '#1a3a6e',
        },
      },
      animation: {
        'gradient': 'gradient 18s ease infinite',
        'gradient-fast': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'scan': 'scan 4s linear infinite',
        'pulse-ring': 'pulseRing 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 18s linear infinite',
        'tilt': 'tilt 10s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-24px) translateX(8px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 24px rgba(59, 130, 246, 0.45), 0 0 60px rgba(168, 85, 247, 0.25)' },
          '50%': { boxShadow: '0 0 36px rgba(34, 211, 238, 0.65), 0 0 90px rgba(168, 85, 247, 0.45)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        },
      },
      backgroundSize: {
        '200': '200% 200%',
        '300': '300% 300%',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
