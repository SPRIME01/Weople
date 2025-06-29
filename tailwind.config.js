/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './apps/**/src/**/*.{html,js,svelte,ts}',
    './libs/**/src/**/*.{html,js,svelte,ts}',
    './apps/**/index.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
