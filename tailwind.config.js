/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Ant Design과 충돌 방지를 위한 설정
  corePlugins: {
    preflight: false,
  },
}
