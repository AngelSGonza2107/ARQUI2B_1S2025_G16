// src/components/SensorCard.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowUp, ArrowDown, Thermometer, Droplets, Sun, Gauge, Wind, Ruler, DoorOpen } from "lucide-react";

const sensorIcons = {
  temperatura: <Thermometer className="w-6 h-6 text-indigo-500" />,
  humedad: <Droplets className="w-6 h-6 text-blue-500" />,
  luz: <Sun className="w-6 h-6 text-yellow-500" />,
  calidadAire: <Wind className="w-6 h-6 text-green-500" />,
  corriente: <Gauge className="w-6 h-6 text-purple-500" />,
  distancia: <Ruler className="w-6 h-6 text-pink-500" />,
  distancia_puerta: <Ruler className="w-6 h-6 text-teal-500" />,
  puerta: <DoorOpen className="w-6 h-6 text-gray-500" />,
};

// Función para dividir un número en dígitos, incluyendo el punto decimal
const splitNumberIntoDigits = (number) => {
  return String(number).split("");
};

// Componente para animar un dígito
const AnimatedDigit = ({ digit, newDigit, direction }) => {
  return (
    <motion.span
      key={newDigit}
      initial={{ y: direction === "up" ? -8 : 8, opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring", // Usamos un efecto de resorte
        stiffness: 400, // Rigidez del resorte
        damping: 10, // Amortiguación para un efecto más suave
        mass: 0.4, // Masa del objeto animado
      }}
      className="inline-block"
    >
      {newDigit}
    </motion.span>
  );
};

export default function SensorCard({ name, value, unit, trend, isCritical, isWarning }) {
  const [previousValue, setPreviousValue] = useState(value);
  const [digits, setDigits] = useState(splitNumberIntoDigits(value));
  const [direction, setDirection] = useState("up"); // "up" o "down"

  useEffect(() => {
    if (value !== previousValue) {
      // Determinar la dirección de la animación
      setDirection(value > previousValue ? "up" : "down");
      setDigits(splitNumberIntoDigits(value));
      setPreviousValue(value);
    }
  }, [value, previousValue]);

  const displayName = {
    temperatura: "Temperatura",
    humedad: "Humedad",
    luz: "Estado de la Luz",
    calidadAire: "Calidad del Aire",
    corriente: "Corriente Eléctrica",
    distancia: "Distancia",
    distancia_puerta: "Estado de la Puerta",
    puerta: "Estado de la Puerta",
  }[name];

  // Personalización para "luz" y "puerta"
  const customDisplay = {
    luz: value === 1 ? "Luz encendida 🌞" : "Luz apagada 🌑",
    puerta: value === 1 ? "Puerta abierta 🚪" : "Puerta cerrada 🔒"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 ${
        isCritical ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200" :
        isWarning ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200" :
        "bg-gradient-to-br from-white to-gray-50 border-gray-200"
      }`}>
        {(isCritical || isWarning) && (
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none"></div>
        )}
        
        {/* Header */}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isCritical ? "bg-red-100 text-red-600" :
                isWarning ? "bg-amber-100 text-amber-600" :
                "bg-blue-100 text-blue-600"
              }`}>
                {sensorIcons[name]}
              </div>
              <span className="text-gray-900 font-medium">{displayName}</span>
            </CardTitle>
            {trend && name !== "luz" && name !== "puerta" && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                trend === "up" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {trend === "up" ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {trend === "up" ? "Subiendo" : "Bajando"}
              </div>
            )}
          </div>
        </CardHeader>
  
        {/* Content */}
        <CardContent>
          <p className={`text-3xl font-bold ${
            isCritical ? "text-red-600" :
            isWarning ? "text-amber-600" :
            "text-gray-900"
          }`}>
            {customDisplay[name] || (
              <span className="flex items-baseline gap-1">
                {digits.map((digit, index) => (
                  <AnimatedDigit
                    key={index}
                    digit={digits[index]}
                    newDigit={digit}
                    direction={direction}
                  />
                ))}
                <span className="text-lg text-gray-500 ml-1">{unit}</span>
              </span>
            )}
          </p>
        </CardContent>
  
        {/* Status indicator */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          isCritical ? "bg-red-500" :
          isWarning ? "bg-amber-500" :
          "bg-blue-500"
        }`}></div>
      </Card>
    </motion.div>
  );
}