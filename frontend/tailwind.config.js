/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4ADE80",
        background: "#000000",
        text: "#FFFFFF",
        "input-bg": "#1F1F1F",
        "card-bg": "#1F1F1F",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        welcome: "32px",
        title: "24px",
        "card-title": "18px",
        "modal-title": "20px",
        body: "16px",
        note: "14px",
      },
      spacing: {
        "card-padding": "16px",
        "page-padding": "24px",
        "section-gap": "24px",
      },
    },
  },
  plugins: [],
};
