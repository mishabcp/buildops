import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', ...defaultTheme.fontFamily.sans],
        // Numbers, codes, and amount inputs use `font-mono`; map it to Outfit
        // so all figures render in the same family as the rest of the UI.
        mono: ['Outfit', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Brand navy — derived from the Buildops logo. Primary surfaces & actions.
        brand: {
          50: '#eef5fb',
          100: '#d6e6f4',
          200: '#aecde8',
          300: '#7eacd6',
          400: '#4d86bf',
          500: '#2c69a6',
          600: '#1f5288',
          700: '#1b4470',
          800: '#143a61',
          900: '#0f2f50',
          950: '#0a1f37',
        },
        // Accent orange — the hex bolt in the logo. Highlights, CTAs, active states.
        accent: {
          50: '#fff6ed',
          100: '#ffe9d2',
          200: '#ffcfa6',
          300: '#ffac6b',
          400: '#ff7a00',
          500: '#f76707',
          600: '#e24e00',
          700: '#bb3a02',
          800: '#942f0b',
          900: '#78290c',
          950: '#411304',
        },
      },
      boxShadow: {
        brand: '0 10px 30px -10px rgba(15, 47, 80, 0.35)',
        accent: '0 10px 25px -8px rgba(255, 122, 0, 0.45)',
      },
    },
  },
  plugins: [],
};
