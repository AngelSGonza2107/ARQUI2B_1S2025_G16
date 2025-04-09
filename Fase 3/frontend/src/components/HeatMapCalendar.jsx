// src/components/HeatMapCalendar.jsx
import { useEffect, useState } from "react";
import { format, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { fetchHeatMap } from "@/lib/api";

const HeatMapCalendar = ({ sensor, startDate, endDate }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ mean: 0, min: 0, max: 0 });

  useEffect(() => {
    if (!sensor || !startDate || !endDate) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchHeatMap(sensor, startDate, endDate);

        if (!Array.isArray(response)) {
          throw new Error("La API no devolvió un array válido");
        }

        setHeatmapData(response);

        // Calcular estadísticas excluyendo los días con media_lectura = 0
        const validValues = response
          .filter(
            (item) =>
              item.media_lectura > 0 &&
              item.media_lectura != null &&
              item.media_lectura !== "N/A"
          )
          .map((item) => item.media_lectura);

        if (validValues.length > 0) {
          const mean =
            validValues.reduce((a, b) => a + b, 0) / validValues.length;
          const min = Math.min(...validValues);
          const max = Math.max(...validValues);
          setStats({ mean, min, max });
        }
      } catch (err) {
        console.error("Error al cargar datos del mapa de calor:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sensor, startDate, endDate]);

  // Generar todos los días en el rango seleccionado
  const daysInRange = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  // Paleta de colores mejorada con mejor contraste
  const colorPalette = [
    "#f3f4f6", // Sin datos (0) - gris claro con borde
    "#a7f3d0", // Muy bajo - verde muy claro
    "#6ee7b7", // Bajo - verde claro
    "#34d399", // Medio - verde
    "#10b981", // Alto - verde oscuro
    "#059669", // Muy alto - verde muy oscuro
  ];

  // Función para determinar el color basado en el valor
  const getColorForValue = (value) => {
    if (value === 0) return colorPalette[0]; // Días sin lecturas

    const { min, max } = stats;

    // Si todos los valores son iguales o no hay rango
    if (max - min <= 0) return colorPalette[3];

    // Normalizar el valor entre 0 y 1 respecto al rango
    const normalized = (value - min) / (max - min);

    // Determinar el índice de color
    if (normalized < 0.2) return colorPalette[1];
    if (normalized < 0.4) return colorPalette[2];
    if (normalized < 0.6) return colorPalette[3];
    if (normalized < 0.8) return colorPalette[4];
    return colorPalette[5];
  };

  // Función para obtener el valor de un día específico
  const getValueForDay = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayData = heatmapData.find((d) => d.fecha === dateStr);
    return dayData ? dayData.media_lectura : null;
  };

  // Agrupar días por semana para el renderizado
  const groupByWeek = (days) => {
    const weeks = [];
    let currentWeek = [];

    days.forEach((day, index) => {
      currentWeek.push(day);

      // Cada 7 días o al final del array
      if (currentWeek.length === 7 || index === days.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const weeks = groupByWeek(daysInRange);

  // Animación de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center"
        >
          <motion.div
            className="w-14 h-14 rounded-full bg-white"
            animate={{ scale: [1, 0.9, 1] }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-600 font-medium"
        >
          Generando mapa de calor...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-center">
        Error al cargar el mapa de calor: {error}
      </div>
    );
  }

  if (!heatmapData.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-500 p-4 rounded-md text-center">
        No hay datos disponibles para mostrar el mapa de calor
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full flex flex-col items-center p-4">
      {/* Mapa de calor - Centrado correctamente */}
      <div className="w-full flex justify-center">
        <div className="inline-flex flex-col items-center">
          {/* Semanas */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1 mb-1">
              {week.map((day, dayIndex) => {
                const value = getValueForDay(day);
                const color = getColorForValue(value);
                const dayNumber = format(day, "d");
                const textColor =
                  value === 0
                    ? "text-gray-500"
                    : color === colorPalette[4] || color === colorPalette[5]
                    ? "text-white"
                    : "text-gray-800";

                return (
                  <motion.div
                    key={dayIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: weekIndex * 0.05 + dayIndex * 0.01 }}
                    className={`flex items-center justify-center w-10 h-10 rounded-md relative group`}
                    style={{
                      backgroundColor: color,
                      border: value === 0 ? "1px solid #e5e7eb" : "none",
                    }}
                    title={`${format(day, "PPP", { locale: es })}: ${
                      value !== null
                        ? value === 0
                          ? "Sin lecturas"
                          : value.toFixed(2)
                        : "Sin datos"
                    }`}
                  >
                    <span className={`text-xs font-medium ${textColor}`}>
                      {dayNumber}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center gap-1">
          <div className="text-xs text-gray-500">Bajo</div>
          {colorPalette.slice(1).map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-sm"
              style={{ backgroundColor: color }}
            ></div>
          ))}
          <div className="text-xs text-gray-500">Alto</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-gray-100 border border-gray-200"></div>
            <span className="text-xs text-gray-600">Sin lecturas</span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats.mean > 0 && (
        <div className="grid grid-cols-3 gap-4 text-center mt-6">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 font-medium">Mínimo</div>
            <div className="text-xl font-semibold text-blue-600 mt-1">
              {stats.min.toFixed(2)}
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 font-medium">Media</div>
            <div className="text-xl font-semibold text-green-600 mt-1">
              {stats.mean.toFixed(2)}
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 font-medium">Máximo</div>
            <div className="text-xl font-semibold text-red-600 mt-1">
              {stats.max.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatMapCalendar;
