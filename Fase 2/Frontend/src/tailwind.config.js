// tailwind.config.js
module.exports = {
    darkMode: "class", // Habilitar modo oscuro
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: "#6366F1", // Índigo
          secondary: "#10B981", // Verde
          background: "#0F172A", // Fondo oscuro
          card: "#1E293B", // Fondo de tarjetas
          text: "#F8FAFC", // Texto claro
          accent: "#F59E0B", // Amarillo
        },
      },
    },
    plugins: [],
  };