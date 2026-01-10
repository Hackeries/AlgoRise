/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      /* Codeforces-like Color Palette */
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        'primary-hover': 'hsl(var(--primary-hover))',
        'primary-active': 'hsl(var(--primary-active))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        success: 'hsl(var(--success))',
        'success-foreground': 'hsl(var(--success-foreground))',
        warning: 'hsl(var(--warning))',
        'warning-foreground': 'hsl(var(--warning-foreground))',
        info: 'hsl(var(--info))',
        'info-foreground': 'hsl(var(--info-foreground))',
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
      },
      /* Codeforces-like Spacing Scale */
      spacing: {
        'xs': 'var(--spacing-xs)',     /* 4px */
        'sm': 'var(--spacing-sm)',     /* 8px */
        'md': 'var(--spacing-md)',     /* 12px */
        'lg': 'var(--spacing-lg)',     /* 16px */
        'xl': 'var(--spacing-xl)',     /* 24px */
        '2xl': 'var(--spacing-2xl)',   /* 32px */
      },
      /* Typography - Codeforces Style */
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],      /* 12px - metadata */
        'sm': ['0.875rem', { lineHeight: '1.5' }],     /* 14px - small text */
        'base': ['1rem', { lineHeight: '1.5' }],       /* 16px - body */
        'lg': ['1.125rem', { lineHeight: '1.5' }],     /* 18px - large body */
        'xl': ['1.25rem', { lineHeight: '1.2' }],      /* 20px - subheadings */
        '2xl': ['1.5rem', { lineHeight: '1.2' }],      /* 24px - headings */
      },
      /* Minimal Shadows */
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      /* Border Radius */
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      /* Animation Durations */
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
    },
  },
  plugins: [],
};
