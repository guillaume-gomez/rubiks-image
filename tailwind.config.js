/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#2c5da6",
          "secondary": "#bd2827",
          "accent": "#7cb257",
          "neutral": "#eecf4e",
          "base-100": "#2A303C",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",

          "--rounded-box": "0rem", // border radius rounded-box utility class, used in card and other large boxes
          "--rounded-btn": "0em", // border radius rounded-btn utility class, used in buttons and similar element
          "--rounded-badge": "0rem", // border radius rounded-badge utility class, used in badges and similar
        },
      },
    ],
  },
  plugins: [require("daisyui")],
}

