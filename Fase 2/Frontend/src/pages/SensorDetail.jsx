// src/pages/SensorDetail.jsx
import { useState } from "react";
import { useSensorData } from "../hooks/useSensorData";
import DateFilter from "../components/DateFilter";
import SensorTable from "../components/SensorTable";
import SensorChart from "../components/SensorChart";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function SensorDetail() {
  const [filters, setFilters] = useState({ sensor: null, start: null, end: null });
  const { data, isLoading, isError } = useSensorData(filters.sensor, filters.start, filters.end);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-16">
      {/* Navbar */}
      <Navbar />

      {/* Contenido principal */}
      <div className="container mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Detalle del Sensor
        </h1>

        {/* Filtro de fecha */}
        <DateFilter onChange={setFilters} />

        <Separator className="my-6 bg-gray-200" />

        {/* Mensajes de carga y error */}
        {isLoading && <LoadingSpinner />}
        {isError && (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-red-500">Error al cargar los datos del sensor</p>
          </div>
        )}

        {/* Si no hay filtros, mostrar un mensaje */}
        {!isLoading && !isError && (!filters.sensor || !filters.start || !filters.end) && (
          <p className="text-center text-gray-500 text-lg">
            Selecciona un sensor y un rango de fechas para ver los datos.
          </p>
        )}

        {/* Gráfica y tabla de datos */}
        {!isLoading && !isError && data?.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Gráfica de {filters.sensor}
              </h2>
              <SensorChart
                data={data.map((item) => ({
                  time: item.fecha_hora,
                  value: item[filters.sensor],
                }))}
                title={filters.sensor}
                color={getChartColor(filters.sensor)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos en Tabla</h2>
              <SensorTable
                columns={["Fecha y Hora", "Valor"]}
                data={data.map((item) => ({
                  fecha_hora: item.fecha_hora,
                  valor: item[filters.sensor],
                }))}
              />
            </motion.div>
          </>
        )}

        {/* Si no hay datos después de filtrar */}
        {!isLoading && !isError && data?.length === 0 && (
          <p className="text-center text-gray-500 text-lg">
            No se encontraron datos para el sensor seleccionado en este rango de fechas.
          </p>
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
