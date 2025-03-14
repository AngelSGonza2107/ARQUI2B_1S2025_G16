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
    luz: value === 1 ? "Luz detectada 🌞" : "No hay luz 🌑",
    puerta: value === "1" ? "Puerta abierta 🚪" : "Puerta cerrada 🔒"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }} // Escalar la tarjeta al pasar el mouse
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="hover:shadow-lg transition-shadow bg-white border border-gray-200 relative">
        {/* Badge de estado personalizado */}
        {(isCritical || isWarning) && (
          <div
            className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
              isCritical ? "bg-red-500" : "bg-yellow-500"
            } text-white`}
          >
            {isCritical ? "Crítico" : "Advertencia"}
          </div>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            {sensorIcons[name]}
            <span className="capitalize text-gray-900">{displayName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">
            {customDisplay[name] || (
              <span className="flex">
                {digits.map((digit, index) => (
                  <AnimatedDigit
                    key={index}
                    digit={digits[index]}
                    newDigit={digit}
                    direction={direction}
                  />
                ))}
                <span>{unit}</span>
              </span>
            )}
          </p>
          {trend && name !== "luz" && name !== "puerta" && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              {trend === "up" && <ArrowUp className="w-4 h-4 text-green-500" />}
              {trend === "down" && <ArrowDown className="w-4 h-4 text-red-500" />}
              <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                {trend === "up" ? "Subiendo" : "Bajando"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}