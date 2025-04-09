import { useState, useCallback, useRef, useEffect } from "react";
import { useMqttData } from "../hooks/useMqttData";
import SensorCard from "../components/SensorCard";
import SensorChart from "../components/SensorChart";
import Navbar from "../components/Navbar";
import LiveDataLoader from "../components/LiveDataLoader";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Thermometer, Droplets, Sun, Gauge, Wind, Ruler, DoorOpen } from "lucide-react";
import { Activity, Zap, AlertTriangle } from "lucide-react";

export default function LiveDashboard() {
  const {
    currentData,
    chartData,
    isConnected,
    startCollectingData,
    stopCollectingData,
  } = useMqttData();

  const [selectedSensor, setSelectedSensor] = useState(null);
  const previousValues = useRef({});
  const [criticalSensors, setCriticalSensors] = useState([]);

  // Actualizar valores anteriores cuando llegan nuevos datos
  // Actualizar valores anteriores y detectar sensores críticos
  const updateTrendData = useCallback((newData) => {
    if (!newData) return;

    const critical = [];

    Object.entries(newData).forEach(([sensor, value]) => {
      const sensorKey =
        sensor === "distanciaEntrada" ? "distancia_puerta" : sensor;

      if (previousValues.current[sensorKey]?.current !== value) {
        previousValues.current[sensorKey] = {
          current: value,
          previous: previousValues.current[sensorKey]?.current,
        };
      }

      if (isCritical(sensorKey, value)) {
        critical.push(sensorKey);
      }
    });

    setCriticalSensors(critical);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      const timeout = setTimeout(() => {
        window.location.reload();
      }, 3000); // 3 segundos
  
      // Limpieza si el componente se desmonta o `isConnected` cambia
      return () => clearTimeout(timeout);
    }
  }, [isConnected]);

  // Calcular tendencia basada en valores anteriores
  const getTrend = useCallback((sensor) => {
    const sensorData = previousValues.current[sensor];
    if (!sensorData || sensorData.previous === undefined) return "stable";

    if (sensorData.current > sensorData.previous) return "up";
    if (sensorData.current < sensorData.previous) return "down";
    return "stable";
  }, []);

  // Efecto para actualizar tendencias cuando hay nuevos datos
  useEffect(() => {
    updateTrendData(currentData);
  }, [currentData, updateTrendData]);

  useEffect(() => {

  }, [isConnected]);

  const handleSensorClick = useCallback(
    (sensor) => {
      const sensorKey =
        sensor === "distanciaEntrada" ? "distancia_puerta" : sensor;

      if (selectedSensor === sensorKey) return;

      if (selectedSensor) {
        stopCollectingData(selectedSensor);
      }

      setSelectedSensor(sensorKey);
      startCollectingData(sensorKey);
    },
    [selectedSensor, startCollectingData, stopCollectingData]
  );

  const handleCloseModal = useCallback(() => {
    if (selectedSensor) {
      stopCollectingData(selectedSensor);
    }
    setSelectedSensor(null);
  }, [selectedSensor, stopCollectingData]);

  // Función para obtener la unidad según el sensor
  const getUnit = useCallback((sensor) => {
    const units = {
      temperatura: "°C",
      humedad: "%",
      distancia: "cm",
      luz: "",
      calidadAire: "ppm",
      corriente: "A",
      distancia_puerta: "cm",
      puerta: "",
    };
    return units[sensor] || "";
  }, []);

  // Función para asignar colores a los gráficos
  const getChartColor = useCallback((sensor) => {
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
  }, []);

  // Función para obtener el nombre del sensor
  const getSensorDisplayName = useCallback((sensor) => {
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
  }, []);

  // Funciones para detectar estados críticos y de advertencia
  const isCritical = useCallback((sensor, value) => {
    if (value === undefined) return false;
    const limits = {
      temperatura: 35,
      humedad: 70,
      corriente: 15,
      calidadAire: 500,
    };
    return value >= (limits[sensor] || Infinity);
  }, []);

  const isWarning = useCallback((sensor, value) => {
    if (value === undefined) return false;
    const limits = {
      temperatura: 30,
      humedad: 60,
      corriente: 10,
      calidadAire: 300,
    };
    return value >= (limits[sensor] || Infinity);
  }, []);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 pt-16">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-[70vh]">
          <LiveDataLoader 
            message="Conectando al servidor MQTT..." 
            icon={<Activity className="w-8 h-8 text-blue-600 animate-pulse" />}
          />
        </div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 pt-16">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-[70vh]">
          <LiveDataLoader 
            message="Esperando datos de sensores..." 
            icon={<Zap className="w-8 h-8 text-yellow-500 animate-pulse" />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-600" />
                Datos en Vivo
              </h2>
              <p className="text-gray-600 mt-1">
                Monitoreo en tiempo real de los sensores del data center
              </p>
            </div>
            
            {criticalSensors.length > 0 && (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-medium">
                  {criticalSensors.length} sensor{criticalSensors.length > 1 ? 'es' : ''} crítico{criticalSensors.length > 1 ? 's' : ''}
                </span>
              </motion.div>
            )}
          </div>
          
          <Separator className="mb-8 bg-gray-200" />

          {/* Grid de sensores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(currentData).map(([sensor, value]) => {
              const sensorKey = sensor === 'distanciaEntrada' ? 'distancia_puerta' : sensor;
              const unit = getUnit(sensorKey);
              const trend = getTrend(sensorKey);

              return (
                <motion.div
                  key={sensorKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * Object.keys(currentData).indexOf(sensor) }}
                  onClick={() => handleSensorClick(sensor)}
                >
                  <SensorCard
                    name={sensorKey}
                    value={value}
                    unit={unit}
                    trend={trend}
                    isCritical={isCritical(sensorKey, value)}
                    isWarning={isWarning(sensorKey, value)}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Modal del gráfico */}
        <Dialog open={!!selectedSensor} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-5xl bg-white border border-gray-200 rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {selectedSensor && (
                  <>
                    {getSensorIcon(selectedSensor)}
                    {getSensorDisplayName(selectedSensor)}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedSensor && (
              <SensorChart
                title={getSensorDisplayName(selectedSensor)}
                data={chartData[selectedSensor] || []}
                color={getChartColor(selectedSensor)}
                isCritical={isCritical(
                  selectedSensor,
                  currentData[selectedSensor === 'distancia_puerta' ? 'distanciaEntrada' : selectedSensor]
                )}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Función auxiliar para obtener iconos de sensores
function getSensorIcon(sensor) {
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
}
