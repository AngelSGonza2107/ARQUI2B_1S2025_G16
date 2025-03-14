// src/pages/LiveDashboard.jsx
import { useState } from "react";
import { useLiveData } from "../hooks/useLiveData";
import SensorCard from "../components/SensorCard";
import SensorChart from "../components/SensorChart";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function LiveDashboard() {
  const { data, isLoading, isError } = useLiveData();
  const [selectedSensor, setSelectedSensor] = useState(null); // Estado para el sensor seleccionado

  // Función para obtener la unidad según el sensor
  const getUnit = (sensor) => {
    const units = {
      temperatura: "°C",
      humedad: "%",
      distancia: "cm",
      luz: "", // No tiene unidad
      calidadAire: "ppm", // Partes por millón
      corriente: "A", // Amperios
      distancia_puerta: "cm",
      puerta: "", // No tiene unidad
    };
    return units[sensor] || "";
  };

  // Función para manejar el clic en una SensorCard
  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor); // Abrir el modal con la gráfica del sensor
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setSelectedSensor(null); // Cerrar el modal
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-16">
      {/* Navbar (siempre visible) */}
      <Navbar />

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">


        {/* Mostrar mensaje de carga */}
        {isLoading && <LoadingSpinner />}

        {/* Mostrar mensaje de error */}
        {isError && (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-red-500">
              Error al cargar los datos en vivo
            </p>
          </div>
        )}

        {/* Mostrar datos */}
        {!isLoading && !isError && (
          <>
            {/* Sección de tarjetas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Datos en Vivo
              </h2>
              <Separator className="mb-6 bg-gray-200" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.keys(data).map((sensor) => {
                  const sensorData = data[sensor][0]; // Último dato del sensor
                  const value = sensorData[sensor];
                  const unit = getUnit(sensor);

                  return (
                    <div key={sensor} onClick={() => handleSensorClick(sensor)}>
                      <SensorCard
                        name={sensor}
                        value={value}
                        unit={unit}
                        trend={
                          data[sensor].length > 1
                            ? data[sensor][0][sensor] > data[sensor][1][sensor]
                              ? "up"
                              : "down"
                            : "stable"
                        }
                        isCritical={isCritical(sensor, value)}
                        isWarning={isWarning(sensor, value)}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
            {/* Modal para gráficas */}
            <Dialog open={!!selectedSensor} onOpenChange={handleCloseModal}>
              <DialogContent className="sm:max-w-4xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Gráfica de {getSensorDisplayName(selectedSensor)}
                  </DialogTitle>
                </DialogHeader>
                {selectedSensor && (
                  <SensorChart
                    title={getSensorDisplayName(selectedSensor)}
                    data={data[selectedSensor].map((d) => ({
                      time: d.fecha_hora,
                      value: d[selectedSensor], // Acceder al valor correcto
                    }))}
                    color={getChartColor(selectedSensor)}
                    isCritical={isCritical(
                      selectedSensor,
                      data[selectedSensor][0][selectedSensor]
                    )}
                  />
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}

// Función para asignar colores a los gráficos
const getChartColor = (sensor) => {
  const colors = {
    temperatura: "#6366F1", // Índigo
    humedad: "#3B82F6", // Azul
    luz: "#F59E0B", // Amarillo
    calidadAire: "#10B981", // Verde
    corriente: "#8B5CF6", // Violeta
    distancia: "#EC4899", // Rosa
    distancia_puerta: "#6EE7B7", // Verde claro
    puerta: "#374151", // Gris oscuro
  };
  return colors[sensor] || "#6366F1"; // Color por defecto (índigo)
};

// Función para obtener el nombre del sensor
const getSensorDisplayName = (sensor) => {
  const names = {
    temperatura: "Temperatura",
    humedad: "Humedad",
    luz: "Estado de la Luz",
    calidadAire: "Calidad del Aire",
    corriente: "Corriente Eléctrica",
    distancia: "Distancia",
    distancia_puerta: "Distancia de la Puerta",
    puerta: "Estado de la Puerta",
  };
  return names[sensor] || sensor;
};

// Funciones para detectar estados críticos y de advertencia
const isCritical = (sensor, value) => {
  const limits = {
    temperatura: 35, // Ejemplo: 35°C es crítico
    humedad: 70, // Ejemplo: 80% es crítico
    corriente: 15, // Ejemplo: 15A es crítico
    calidadAire: 500, // Ejemplo: 600
  };
  return value >= (limits[sensor] || Infinity);
};

const isWarning = (sensor, value) => {
  const limits = {
    temperatura: 30, // Ejemplo: 30°C es advertencia
    humedad: 60, // Ejemplo: 70% es advertencia
    corriente: 10, // Ejemplo: 10A es advertencia
    calidadAire: 300, // Ejemplo: 400
  };
  return value >= (limits[sensor] || Infinity);
};
