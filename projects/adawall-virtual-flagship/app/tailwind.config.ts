import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        adawall: {
          charcoal: '#171412',
          bronze: '#b48a5a',
          stone: '#d8cdbd',
          cream: '#f4eee4'
        }
      }
    }
  },
  plugins: []
};

export default config;
