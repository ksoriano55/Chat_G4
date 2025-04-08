/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-blue": "#030039",  
        "Brown": "#1F1313",
        "Yellow-Switch": "#F4ED23",
        "Yellow-Switch-2": "#686628",
        "Brown-Titulo": "#4D4343",
        "Rose-Send": "#D95082",
        "Rose-Recive": "#613444"
      },
      maxHeight: {
        '98': '30rem', 
      },
    },
  },
  plugins: [],
}

