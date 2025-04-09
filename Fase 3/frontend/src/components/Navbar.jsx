// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  LineChart,
  BarChart3,
  KeyRound,
  Menu,
  X,
  Sun,
  Moon,
  BrainCircuit,
  SunMoon
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AccessModal from "./AccessModal";
import mqttInstance from "../utils/mqttClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MQTT_TOPIC = "dataCenter/comandos";

export default function Navbar() {
  const location = useLocation();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lightMode, setLightMode] = useState(2);
  const [connectionStatus, setConnectionStatus] = useState("Conectando...");

  useEffect(() => {
    const client = mqttInstance.getClient();

    const updateStatus = () => {
      setConnectionStatus(client.connected ? "Conectado" : "Desconectado");
    };

    client.on("connect", () => {
      updateStatus();
      console.log("Conexión establecida");
    });

    client.on("reconnect", () => {
      setConnectionStatus("Reconectando...");
    });

    client.on("offline", () => {
      updateStatus();
    });

    client.on("error", (err) => {
      console.error("Error MQTT:", err);
      setConnectionStatus("Error de conexión");
    });

    updateStatus();

    return () => {};
  }, []);
  const handleLightToggle = (newMode) => {
    setLightMode(newMode);
    const payload = JSON.stringify({ luzV: newMode });

    const published = mqttInstance.publish(MQTT_TOPIC, payload);

    if (published) {
      const modeData = {
        0: {
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400/90" />,
          text: "Luces apagadas",
        },
        1: {
          icon: <Sun className="w-3.5 h-3.5 text-amber-400/90" />,
          text: "Luces encendidas",
        },
        2: {
          icon: <SunMoon className="w-3.5 h-3.5 text-emerald-400/90" />,
          text: "Luces automáticas",
        },
      };

      toast(
        <div className="flex items-center gap-3 pl-1">
          <div className="flex-shrink-0">{modeData[newMode].icon}</div>
          <div>
            <p className="text-sm font-light text-gray-300/95">
              {modeData[newMode].text}
            </p>
            <p className="text-xs text-gray-500">Ajuste de iluminación</p>
          </div>
        </div>,
        {
          className: "",
          autoClose: 1800,
          hideProgressBar: true,
        }
      );
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm shadow-xl z-50 h-16 border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-white flex items-center gap-2"
          >
            <span className="text-blue-400">DataCenter</span> Monitor
          </Link>

          {/* Menú para desktop */}
          <div className="hidden md:flex gap-4 lg:gap-6 items-center">
            <NavLink
              to="/"
              icon={<LineChart />}
              text="En Vivo"
              active={location.pathname === "/"}
            />
            <NavLink
              to="/sensor"
              icon={<BarChart3 />}
              text="Detalle Sensor"
              active={location.pathname === "/sensor"}
            />
            <NavLink
              to="/predictions"
              icon={<BrainCircuit />}
              text="Predicciones"
              active={location.pathname === "/predictions"}
            />


            {/* Interruptor de luces premium */}
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  connectionStatus === "Conectado"
                    ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800"
                    : connectionStatus === "Reconectando..."
                    ? "bg-amber-900/30 text-amber-400 border border-amber-800"
                    : "bg-red-900/30 text-red-400 border border-red-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "Conectado"
                      ? "bg-emerald-400 animate-pulse"
                      : connectionStatus === "Reconectando..."
                      ? "bg-amber-400 animate-pulse"
                      : "bg-red-400"
                  }`}
                ></div>
                {connectionStatus}
              </div>

              <div className="relative bg-gray-800 rounded-full p-1 shadow-lg border border-gray-700">
                <div className="flex relative z-10">
                  <LightSwitchButton
                    active={lightMode === 0}
                    onClick={() => handleLightToggle(0)}
                    icon={<Moon className="w-4 h-4" />}
                    title="Apagar luces"
                    color="bg-indigo-600"
                  />
                  <LightSwitchButton
                    active={lightMode === 2}
                    onClick={() => handleLightToggle(2)}
                    icon={<SunMoon className="w-4 h-4" />}
                    title="Modo automático"
                    color="bg-emerald-600"
                    isMiddle
                  />
                  <LightSwitchButton
                    active={lightMode === 1}
                    onClick={() => handleLightToggle(1)}
                    icon={<Sun className="w-4 h-4" />}
                    title="Encender luces"
                    color="bg-amber-500"
                  />
                </div>
                <div className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500 blur-sm"></div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAccessModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
            >
              <KeyRound className="w-4 h-4" />
              Acceso Seguro
            </motion.button>
          </div>

          {/* Botón de menú móvil */}
          <button
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800/95 backdrop-blur-sm pb-4 px-4 border-b border-gray-700">
            <div className="flex flex-col space-y-2">
              <MobileNavLink
                to="/"
                icon={<LineChart size={18} />}
                text="En Vivo"
                active={location.pathname === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/sensor"
                icon={<BarChart3 size={18} />}
                text="Detalle Sensor"
                active={location.pathname === "/sensor"}
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <MobileNavLink
                to="/predictions"
                icon={<BrainCircuit size={18} />}
                text="Predicciones"
                active={location.pathname === "/predictions"}
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Interruptor de luces para móvil */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Estado:</span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      connectionStatus === "Conectado"
                        ? "bg-emerald-900/30 text-emerald-400"
                        : connectionStatus === "Reconectando..."
                        ? "bg-amber-900/30 text-amber-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {connectionStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-700 rounded-lg p-2">
                  <span className="text-gray-300 text-sm">
                    Control de Luces:
                  </span>
                  <div className="relative bg-gray-800 rounded-full p-1 shadow border border-gray-600">
                    <div className="flex gap-1">
                      <LightSwitchButton
                        active={lightMode === 0}
                        onClick={() => handleLightToggle(0)}
                        icon={<Moon className="w-4 h-4" />}
                        isMobile
                        color="bg-indigo-600"
                      />
                      <LightSwitchButton
                        active={lightMode === 2}
                        onClick={() => handleLightToggle(2)}
                        icon={<SunMoon className="w-4 h-4" />}
                        isMiddle
                        isMobile
                        color="bg-emerald-600"
                      />
                      <LightSwitchButton
                        active={lightMode === 1}
                        onClick={() => handleLightToggle(1)}
                        icon={<Sun className="w-4 h-4" />}
                        isMobile
                        color="bg-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAccessModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                <KeyRound className="w-4 h-4" />
                Acceso Seguro
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Modal de acceso */}
      <AccessModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        cliente ={mqttInstance.getClient()}
      />

      {/* Configuración de notificaciones */}
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        newestOnTop
        closeOnClick={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        limit={2}
        toastStyle={{
          margin: "0 0 1rem 0",
          width: "220px",
          background: "rgba(31, 41, 55, 0.98)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(55, 65, 81, 0.3)",
          borderRadius: "6px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
        progressStyle={{
          background: "rgba(156, 163, 175, 0.2)",
          height: "1px",
        }}
      />
    </>
  );
}

// Componente mejorado para los botones del interruptor de luces
function LightSwitchButton({
  active,
  onClick,
  icon,
  title,
  isMiddle,
  isMobile,
  color,
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-2 rounded-full flex items-center justify-center transition-all ${
        isMobile ? "w-8 h-8" : "px-4 py-2"
      } ${
        active
          ? `${color} text-white shadow-md`
          : "text-gray-300 hover:bg-gray-600"
      }`}
      title={title}
    >
      {icon}
    </motion.button>
  );
}

// Componente de enlaces para desktop
function NavLink({ to, icon, text, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}

// Componente de enlaces para móvil
function MobileNavLink({ to, icon, text, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}
