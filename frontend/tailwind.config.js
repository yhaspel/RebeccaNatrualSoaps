/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5EFE6',
        ivory: '#FBF7F1',
        // Sage darkened from #8A9A7B to #6F8063 to clear WCAG AA on cream/ivory.
        // The old base lives on as `sage.light2` for decorative-only uses (illustrations, hover/idle borders);
        // never use it for text or as a fill behind text.
        sage: { DEFAULT: '#6F8063', dark: '#566248', light: '#B6C2A5', light2: '#8A9A7B' },
        clay: { DEFAULT: '#C58B5F', dark: '#9A6943' },
        ink: { DEFAULT: '#2E2A26', soft: '#5B544C' },
        line: '#E4DDD0',
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Heebo"', 'system-ui', 'sans-serif'],
        he: ['"Heebo"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        soft: '0.875rem',
      },
      boxShadow: {
        soft: '0 8px 28px rgba(46, 42, 38, 0.08)',
      },
    },
  },
  plugins: [],
};
