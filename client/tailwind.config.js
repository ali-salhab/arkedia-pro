export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1E3A8A", // Updated primary color
          secondary: "#1D4ED8", // Updated secondary color
          accent: "#3B82F6", // Updated accent color
          glow: "#60A5FA", // Updated glow color
        },
        sidebar: {
          background: "#1E3A8A", // Sidebar background color
          text: "#FFFFFF", // Sidebar text color
          hover: "#3B82F6", // Sidebar hover color
        },
      },
    },
  },
  plugins: [],
};
