// src/components/LightControlSwitch.jsx
import { Sun, Moon, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const LightControlSwitch = ({ value, onChange }) => {
  const modes = [
    { id: 0, icon: <Moon className="w-4 h-4" />, label: "Apagar", color: "bg-indigo-600" },
    { id: 2, icon: <Settings className="w-4 h-4" />, label: "Automático", color: "bg-emerald-600" },
    { id: 1, icon: <Sun className="w-4 h-4" />, label: "Encender", color: "bg-amber-500" }
  ];

  const handleChange = (newMode) => {
    onChange(newMode);
    toast.success(
      <div className="flex items-center gap-2">
        {modes.find(m => m.id === newMode).icon}
        <span>Modo {modes.find(m => m.id === newMode).label} activado</span>
      </div>, 
      {
        icon: false,
        className: "bg-gray-800 text-white border-l-4 border-emerald-500",
        progressClassName: "bg-gradient-to-r from-emerald-500 to-emerald-300"
      }
    );
  };

  return (
    <div className="relative bg-gray-800 rounded-full p-1 shadow-lg border border-gray-700">
      <div className="flex relative z-10">
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleChange(mode.id)}
            className={`relative px-4 py-2 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              value === mode.id 
                ? `${mode.color} text-white shadow-md`
                : "text-gray-300 hover:text-white"
            }`}
          >
            {mode.icon}
            <span className="hidden md:inline">{mode.label}</span>
          </motion.button>
        ))}
      </div>
      {/* Efecto de iluminación */}
      <div className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500 blur-sm"></div>
    </div>
  );
};

export default LightControlSwitch;