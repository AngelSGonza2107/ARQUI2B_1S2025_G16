// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { LineChart, BarChart3 } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 w-full bg-gray-900 shadow-lg z-50 h-16">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">DataCenter</span> Monitor
        </Link>

        {/* Menú */}
        <div className="flex gap-6">
          <NavLink to="/" icon={<LineChart />} text="En Vivo" active={location.pathname === "/"} />
          <NavLink
            to="/sensor"
            icon={<BarChart3 />}
            text="Detalle Sensor"
            active={location.pathname === "/sensor"}
          />
        </div>
      </div>
    </nav>
  );
}

// Componente de enlaces del Navbar
function NavLink({ to, icon, text, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white" // Estilo activo
          : "text-gray-300 hover:bg-gray-700 hover:text-white" // Estilo inactivo
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}