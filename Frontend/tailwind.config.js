/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'greenCustom': 'var(--green-color)',
        'customLightText': '#FFFFFF',
        'bgCustom': '#E5E5E5',
        'customDarkText': '#222222',
        'card': '#1B5C58',
      },
      fontFamily: {
        'inter' : ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}

