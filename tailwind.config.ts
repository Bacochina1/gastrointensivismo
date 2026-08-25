import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      "colors": {
              "surface-variant": "#e2e2e2",
              "surface-container-low": "#f3f3f3",
              "on-error": "#ffffff",
              "surface-container-lowest": "#ffffff",
              "inverse-on-surface": "#f1f1f1",
              "error": "#ba1a1a",
              "surface": "#f9f9f9",
              "on-secondary-fixed": "#1c1b1b",
              "secondary-fixed": "#e5e2e1",
              "on-tertiary": "#ffffff",
              "surface-tint": "#bf0029",
              "on-secondary-fixed-variant": "#474646",
              "outline-variant": "#e5bdbb",
              "surface-dim": "#dadada",
              "on-secondary-container": "#656464",
              "outline": "#916f6e",
              "on-primary-fixed-variant": "#92001d",
              "primary": "#bc0028",
              "primary-fixed": "#ffdad8",
              "surface-container-highest": "#e2e2e2",
              "primary-container": "#e2263c",
              "on-error-container": "#93000a",
              "on-surface-variant": "#5c3f3f",
              "on-tertiary-container": "#fafffe",
              "inverse-primary": "#ffb3b1",
              "on-secondary": "#ffffff",
              "error-container": "#ffdad6",
              "on-surface": "#1a1c1c",
              "surface-bright": "#f9f9f9",
              "tertiary-fixed": "#91f2f3",
              "surface-container": "#eeeeee",
              "secondary-container": "#e5e2e1",
              "on-primary-container": "#fffdff",
              "surface-container-high": "#e8e8e8",
              "on-primary": "#ffffff",
              "inverse-surface": "#2f3131",
              "tertiary-fixed-dim": "#74d6d6",
              "on-tertiary-fixed-variant": "#004f50",
              "on-tertiary-fixed": "#002020",
              "tertiary-container": "#008384",
              "on-primary-fixed": "#410007",
              "background": "#f9f9f9",
              "secondary-fixed-dim": "#c8c6c5",
              "primary-fixed-dim": "#ffb3b1",
              "secondary": "#5f5e5e",
              "tertiary": "#006869",
              "on-background": "#1a1c1c"
      },
      "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
      },
      "spacing": {
              "container-max": "1280px",
              "margin-mobile": "20px",
              "gutter": "24px",
              "stack-lg": "32px",
              "unit": "8px",
              "stack-md": "16px",
              "margin-desktop": "64px",
              "stack-sm": "8px",
              "section-gap": "80px"
      },
      "fontFamily": {
              "label-md": [
                      "Inter", "sans-serif"
              ],
              "headline-md": [
                      "Inter", "sans-serif"
              ],
              "headline-lg": [
                      "Inter", "sans-serif"
              ],
              "body-md": [
                      "Inter", "sans-serif"
              ],
              "headline-lg-mobile": [
                      "Inter", "sans-serif"
              ],
              "body-lg": [
                      "Inter", "sans-serif"
              ],
              "display-lg": [
                      "Inter", "sans-serif"
              ],
              "label-sm": [
                      "Inter", "sans-serif"
              ]
      },
      "fontSize": {
              "label-md": [
                      "14px",
                      {
                              "lineHeight": "20px",
                              "letterSpacing": "0.01em",
                              "fontWeight": "500"
                      }
              ],
              "headline-md": [
                      "24px",
                      {
                              "lineHeight": "32px",
                              "letterSpacing": "-0.01em",
                              "fontWeight": "600"
                      }
              ],
              "headline-lg": [
                      "32px",
                      {
                              "lineHeight": "40px",
                              "letterSpacing": "-0.01em",
                              "fontWeight": "600"
                      }
              ],
              "body-md": [
                      "16px",
                      {
                              "lineHeight": "24px",
                              "letterSpacing": "0",
                              "fontWeight": "400"
                      }
              ],
              "headline-lg-mobile": [
                      "24px",
                      {
                              "lineHeight": "32px",
                              "letterSpacing": "-0.01em",
                              "fontWeight": "600"
                      }
              ],
              "body-lg": [
                      "18px",
                      {
                              "lineHeight": "28px",
                              "letterSpacing": "0",
                              "fontWeight": "400"
                      }
              ],
              "display-lg": [
                      "48px",
                      {
                              "lineHeight": "56px",
                              "letterSpacing": "-0.02em",
                              "fontWeight": "700"
                      }
              ],
              "label-sm": [
                      "12px",
                      {
                              "lineHeight": "16px",
                              "letterSpacing": "0.05em",
                              "fontWeight": "600"
                      }
              ]
      }
    },
  },
  plugins: [],
};
export default config;
