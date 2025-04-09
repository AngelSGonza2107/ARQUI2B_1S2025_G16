// src/pages/SensorDetail.jsx 

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertCircle,
  Clock,
  Database,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Gauge,
  Ruler,
  DoorOpen,
} from "lucide-react";
import Navbar from "../components/Navbar";
import DateFilter from "../components/DateFilter"; 
import SensorTable from "../components/SensorTable"; 
import SensorChart from "../components/SensorChart";
import LoadingHistory from "../components/LoadingHistory";
import { fetchSensorData } from "../lib/api"; 
import { format } from "date-fns";
import { es } from "date-fns/locale"; 
import HeatMapCalendar from "@/components/HeatMapCalendar";

export default function SensorDetail() {
  const [filters, setFilters] = useState({
    sensor: null,
    start: null,
    end: null,
  });
  // Estado para los datos recibidos de la API
  const [data, setData] = useState(null); // Inicia como null para diferenciar de array vacío (sin resultados)
  // Estado para indicar si se está cargando
  const [isLoading, setIsLoading] = useState(false);
  // Estado para indicar si hubo un error en la API
  const [errorApi, setErrorApi] = useState(null); // Almacena el mensaje de error

  // Función para manejar el envío del formulario de filtros
  const handleFilterSubmit = async (newFilters) => {
    // Limpia si se deselecciona el sensor o fechas
    if (!newFilters.sensor || !newFilters.start || !newFilters.end) {
      setFilters(newFilters);
      setData(null); // Limpia datos si el filtro está incompleto/limpio
      setIsLoading(false);
      setErrorApi(null);
      return;
    }

    setFilters(newFilters);
    setIsLoading(true); // Activar loader
    setErrorApi(null); // Limpiar errores anteriores
    setData(null); // Limpiar datos anteriores mientras carga

    try {
      // Llama a la función que obtiene los datos
      const result = await fetchSensorData(
        newFilters.sensor,
        newFilters.start,
        newFilters.end
      );

      if (Array.isArray(result)) {
        setData(result);
      } else if (result && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        console.warn("La respuesta de la API no es un array:", result);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      // Guarda un mensaje de error más descriptivo
      setErrorApi(
        `Error al cargar datos: ${error.message || "Error desconocido"}`
      );
      setData(null); // Asegura que no haya datos en caso de error
    } finally {
      setIsLoading(false); // Desactivar loader (siempre se ejecuta)
    }
  };

  // Función auxiliar para obtener el icono según el nombre del sensor
  const getSensorIcon = (sensor) => {
    const icons = {
      temperatura: <Thermometer className="w-5 h-5 text-indigo-600" />,
      humedad: <Droplets className="w-5 h-5 text-blue-600" />,
      luz: <Sun className="w-5 h-5 text-yellow-600" />,
      calidadAire: <Wind className="w-5 h-5 text-green-600" />,
      corriente: <Gauge className="w-5 h-5 text-purple-600" />,
      distancia: <Ruler className="w-5 h-5 text-pink-600" />,
      distancia_puerta: <Ruler className="w-5 h-5 text-teal-600" />,
      puerta: <DoorOpen className="w-5 h-5 text-gray-600" />,
    };
    return icons[sensor] || <Activity className="w-5 h-5 text-gray-600" />;
  };

  // Función auxiliar para obtener el color del gráfico
  const getChartColor = (sensor) => {
    const colors = {
      temperatura: "#6366F1", // Indigo
      humedad: "#3B82F6", // Blue
      luz: "#F59E0B", // Amber
      calidadAire: "#10B981", // Emerald
      corriente: "#8B5CF6", // Violet
      distancia: "#EC4899", // Pink
      distancia_puerta: "#14B8A6", // Teal (ajustado de getSensorIcon)
      puerta: "#6B7280", // Gray (ajustado de getSensorIcon)
    };
    return colors[sensor] || "#6366F1"; // Default Indigo
  };

  // Determina si se ha realizado una búsqueda (para mostrar mensajes adecuados)
  const hasSearched = filters.sensor && filters.start && filters.end;

  // Prepara los datos para la tabla (mapeo)
  // Solo mapea si 'data' es un array válido
  const tableData = Array.isArray(data)
    ? data.map((item) => ({
        fecha_hora: item.fecha_hora,
        valor:
          item && typeof item === "object"
            ? item[filters.sensor]
            : "Dato inválido",
      }))
    : [];

  // Prepara los datos para el gráfico (mapeo)
  const chartData = Array.isArray(data)
    ? data
        .map((item) => ({
          
          time: item.fecha_hora,
          value: item && typeof item === "object" ? item[filters.sensor] : null, // Usa null para que el gráfico lo ignore si es inválido
        }))
        .filter((item) => item.value !== null) 
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 pt-16">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {" "}
        {/* Ampliado max-w */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8" // Añade espacio vertical entre elementos principales
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Database className="w-7 h-7 text-blue-600" />{" "}

                Historial de Sensores
              </h1>
              <p className="text-gray-600 mt-1">
                Visualiza y analiza los datos históricos de los sensores.
              </p>
            </div>
          </div>
          {/* Filtro de fecha */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                {" "}
                {/* Título un poco más grande */}
                <Clock className="w-5 h-5 text-blue-600" />
                Configurar Filtros
              </CardTitle>
              <CardDescription>
                Selecciona un sensor y el rango de fechas/horas para consultar
                los datos.
              </CardDescription>
            </CardHeader>
            <CardContent>

              <DateFilter onSubmit={handleFilterSubmit} isLoading={isLoading} />
            </CardContent>
          </Card>
          {/* Sección de Resultados */}
          <div className="min-h-[200px]">
            {" "}

            {isLoading && <LoadingHistory />}
            {/* Muestra error si existe y no está cargando */}
            {!isLoading && errorApi && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50 text-red-700"
                >
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>Error al Cargar Datos</AlertTitle>
                  <AlertDescription>{errorApi}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            {/* Mensaje inicial si no se ha buscado nada */}
            {!isLoading && !errorApi && !hasSearched && (
              <Card className="bg-blue-50 border-blue-200 text-center py-12">
                <CardContent className="flex flex-col items-center">
                  <Activity className="w-10 h-10 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Selecciona los filtros
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Utiliza el panel de arriba para elegir un sensor y un rango
                    de fechas/horas para visualizar los datos históricos.
                  </p>
                </CardContent>
              </Card>
            )}
            {/* Mensaje si se buscó pero no hubo resultados */}
            {!isLoading && !errorApi && hasSearched && data?.length === 0 && (
              <Card className="bg-yellow-50 border-yellow-200 text-center py-12">
                <CardContent className="flex flex-col items-center">
                  <AlertCircle className="w-10 h-10 text-yellow-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron datos
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    No hay registros disponibles para el sensor{" "}
                    <span className="font-medium">{filters.sensor}</span> en el
                    rango de fechas seleccionado.
                  </p>
                </CardContent>
              </Card>
            )}
            {/* Muestra Gráfico y Tabla si no está cargando, no hay error, y hay datos */}
            {!isLoading && !errorApi && data?.length > 0 && (
              <div className="grid grid-cols-1 gap-8">
                {" "}
                {/* Usa grid para layout */}
                {/* Gráfico */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl capitalize">
                        {" "}
                        {/* Capitalize sensor name */}
                        {getSensorIcon(filters.sensor)}
                        Gráfica de {filters.sensor?.replace(/_/g, " ")}{" "}
       
                      </CardTitle>
                      <CardDescription>
                 
                        Datos históricos desde el{" "}
                        {format(new Date(filters.start), "PPP p", {
                          locale: es,
                        })}{" "}
                        hasta el{" "}
                        {format(new Date(filters.end), "PPP p", { locale: es })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SensorChart
                        // Pasa los datos mapeados para el gráfico
                        data={chartData}
                        title={filters.sensor} // O un título más descriptivo
                        color={getChartColor(filters.sensor)}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
                {/* Mapa de Calor */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                >
                  <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl capitalize">
                        <Thermometer className="w-5 h-5 text-blue-600" />
                        Mapa de Calor: {filters.sensor?.replace(/_/g, " ")}
                      </CardTitle>
                      <CardDescription>
                        Visualización semanal de los datos. Los colores indican
                        valores por encima o debajo de la media.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <HeatMapCalendar
                        sensor={filters.sensor}
                        startDate={filters.start}
                        endDate={filters.end}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
                {/* Tabla */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }} // Pequeño delay
                >
                  <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl capitalize">
                        <Database className="w-5 h-5 text-blue-600" />
                        Datos Detallados: {filters.sensor?.replace(/_/g, " ")}
                      </CardTitle>
                      <CardDescription>
                        Registros individuales para el período seleccionado. El
                        historial completo puede ser una muestra representativa
                        para rangos amplios.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SensorTable
                        columns={["Fecha y Hora", "Valor"]} // Columnas fijas
                        // Pasa los datos mapeados para la tabla
                        data={tableData}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </div>{" "}
          {/* Fin Sección de Resultados */}
        </motion.div>
      </div>
    </div>
  );
}
function getChartColor(sensor) {
  const colors = {
    temperatura: "#6366F1",
    humedad: "#3B82F6",
    luz: "#F59E0B",
    calidadAire: "#10B981",
    corriente: "#8B5CF6",
    distancia: "#EC4899",
    distancia_puerta: "#6EE7B7",
    puerta: "#374151",
  };
  return colors[sensor] || "#6366F1";
}
