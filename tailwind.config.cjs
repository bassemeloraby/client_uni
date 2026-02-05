// @ts-nocheck
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        nightvision: {
          primary: "#00D9FF",
          secondary: "#00A8CC",
          accent: "#008B8B",
          neutral: "#0a0e27",
          "base-100": "#0f1419",
          "base-200": "#1a1f2e",
          "base-300": "#25293d",
          info: "#00D9FF",
          success: "#00FF41",
          warning: "#FFB700",
          error: "#FF0055",
        },
      },
      {
        ocean: {
          primary: "#006BA6",
          secondary: "#4FD1E6",
          accent: "#0091AD",
          neutral: "#1a2e3e",
          "base-100": "#E8F4F8",
          "base-200": "#C7DFE8",
          "base-300": "#A6CAD8",
          info: "#0EA5E9",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
    ],
  },
};


