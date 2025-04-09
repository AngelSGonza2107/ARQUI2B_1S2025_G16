import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Database,
  Cpu,
  AlertCircle,
  ChevronRight,
  Clock,
  BarChart2,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";
import PredictionChart from "../components/PredictionChart";
import { Separator } from "@/components/ui/separator";
import mqttInstance from "@/utils/mqttClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PredictionLoader from "../components/PredictionLoader";

export default function PredictionsPage() {
  const [formData, setFormData] = useState({
    dias: 3,
    sensor: "temperatura",
  });
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageHandler = useRef(null);
  const connectionStatus = isConnected ? "Conectado" : "Desconectado";

  const sensorOptions = [
    {
      value: "temperatura",
      label: "Temperatura",
      icon: <Zap className="w-4 h-4 mr-2" />,
    },
    {
      value: "humedad",
      label: "Humedad",
      icon: <BarChart2 className="w-4 h-4 mr-2" />,
    },
    {
      value: "calidadAire",
      label: "Calidad del Aire",
      icon: <Activity className="w-4 h-4 mr-2" />,
    },
    {
      value: "corriente",
      label: "Corriente",
      icon: <Cpu className="w-4 h-4 mr-2" />,
    },
  ];

  // Manejo de mensajes MQTT
  const handleMqttMessage = useCallback((topic, message) => {
    console.log(`Received message on ${topic}:`, message.toString());
    try {
      const data = JSON.parse(message.toString());
      if (data && data.sensor && data.predicciones) {
        setPredictions(data);
        setIsLoading(false);
        setError(null);
      }
    } catch (err) {
      console.error("Error processing MQTT message:", err);
      setError("Error al procesar la respuesta del servidor");
      setIsLoading(false);
    }
  }, []);

  // Configuración de conexión MQTT
  useEffect(() => {
    const client = mqttInstance.getClient();

    const handleConnect = () => {
      console.log("MQTT Connected - Subscribing to dataCenter/resultados");
      setIsConnected(true);
      client.subscribe("dataCenter/resultados", { qos: 1 }, (err) => {
        if (err) {
          console.error("Error subscribing to resultados:", err);
        } else {
          console.log("Successfully subscribed to dataCenter/resultados");
        }
      });
    };

    const handleDisconnect = () => {
      console.log("MQTT Disconnected");
      setIsConnected(false);
    };

    const handleError = (err) => {
      console.error("MQTT Error:", err);
      setIsConnected(false);
      setError("Error de conexión con el servidor MQTT");
    };

    // Configurar listeners
    client.on("connect", handleConnect);
    client.on("close", handleDisconnect);
    client.on("disconnect", handleDisconnect);
    client.on("error", handleError);

    // Manejar mensajes entrantes
    messageHandler.current = handleMqttMessage;
    client.on("message", messageHandler.current);

    // Verificar estado inicial
    if (client.connected) {
      handleConnect();
    } else {
      console.log("MQTT not connected, forcing reconnect");
      mqttInstance.forceReconnect();
    }

    return () => {
      // Limpiar listeners
      client.off("connect", handleConnect);
      client.off("close", handleDisconnect);
      client.off("disconnect", handleDisconnect);
      client.off("error", handleError);
      
      if (messageHandler.current) {
        client.off("message", messageHandler.current);
      }
      
      // Desuscribirse al salir
      if (client.connected) {
        client.unsubscribe("dataCenter/resultados");
      }
    };
  }, [handleMqttMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError("No hay conexión con el servidor MQTT. Intente nuevamente.");
      mqttInstance.forceReconnect();
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictions(null);

    try {
      const payload = JSON.stringify({
        sensor: formData.sensor,
        dias: formData.dias
      });

      console.log("Publishing to dataCenter/predicciones:", payload);
      
      mqttInstance.publish("dataCenter/predicciones", payload, { qos: 1 }, (err) => {
        if (err) {
          console.error("Error publishing prediction request:", err);
          setError("Error al enviar la solicitud de predicción");
          setIsLoading(false);
        } else {
          console.log("Prediction request published successfully");
          // Timeout para evitar carga infinita
          setTimeout(() => {
            if (isLoading) {
              setError("Tiempo de espera agotado. No se recibió respuesta.");
              setIsLoading(false);
            }
          }, 30000);
        }
      });
    } catch (err) {
      console.error("Error:", err);
      setError("Error al enviar la solicitud de predicción");
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dias" ? parseInt(value) : value,
    }));
  };

  const currentSensor = sensorOptions.find(
    (opt) => opt.value === formData.sensor
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Predicciones Inteligentes
            </h1>
            <div className={`ml-auto flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isConnected
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-red-500"
              }`}></div>
              {isConnected ? "Conectado" : "Desconectado"}
            </div>
          </div>
          
          <p className="text-gray-600 mb-6 max-w-2xl">
            Utiliza nuestro modelo de machine learning para predecir valores
            futuros basados en datos históricos del data center.
          </p>
          <Separator className="mb-6 bg-gray-200" />

          {/* Formulario de predicción */}
          <Card className="mb-8 border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                Configuración de Predicción
              </CardTitle>
              <CardDescription>
                Selecciona el sensor y el período de predicción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Días a predecir (1-8)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="dias"
                        min="1"
                        max="8"
                        value={formData.dias}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">#</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      Tipo de Sensor
                    </label>
                    <select
                      name="sensor"
                      value={formData.sensor}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                      required
                    >
                      {sensorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || connectionStatus !== "Conectado"}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-md shadow-md transition-all duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generando Predicción...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      Generar Predicción
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resultados */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <PredictionLoader />
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Error al generar predicción
                  </h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {predictions && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Resumen de la predicción */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    Resumen de Predicción
                  </CardTitle>
                  <CardDescription>
                    Resultados del modelo de machine learning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Cpu className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Modelo utilizado
                          </p>
                          <p className="font-medium text-gray-900">
                            {predictions.modelo}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Database className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Muestras analizadas
                          </p>
                          <p className="font-medium text-gray-900">
                            {predictions.total_muestras.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Clock className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Período predicho
                          </p>
                          <p className="font-medium text-gray-900">
                            {predictions.dias_con_datos} días
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de predicciones */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-600" />
                    Tendencias de {predictions.sensor}
                  </CardTitle>
                  <CardDescription>
                    Proyección para los próximos {predictions.dias_con_datos}{" "}
                    días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PredictionChart
                    data={predictions.predicciones}
                    sensor={predictions.sensor}
                  />
                </CardContent>
              </Card>

              {/* Tabla de predicciones */}
              <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Detalle por Día
                  </CardTitle>
                  <CardDescription>
                    Valores predichos para cada día
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Día
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor Predicho
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {predictions.predicciones.map((pred, idx) => (
                          <motion.tr
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                Día {pred.dia}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {pred.fecha}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {pred.valor_prediccion.toFixed(2)}{" "}
                              {getUnit(predictions.sensor)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(
                                pred.valor_prediccion,
                                predictions.sensor
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function getUnit(sensor) {
  const units = {
    temperatura: "°C",
    humedad: "%",
    calidadAire: "ppm",
    corriente: "A",
  };
  return units[sensor] || "";
}

function getStatusBadge(value, sensor) {
  const getStatus = () => {
    if (sensor === "temperatura") {
      if (value > 35) return { text: "Crítico", color: "red" };
      if (value > 30) return { text: "Alerta", color: "orange" };
      return { text: "Normal", color: "green" };
    }
    if (sensor === "humedad") {
      if (value > 70) return { text: "Alto", color: "orange" };
      if (value < 30) return { text: "Bajo", color: "yellow" };
      return { text: "Óptimo", color: "green" };
    }
    return { text: "Normal", color: "blue" };
  };

  const status = getStatus();
  return <Badge variant={status.color}>{status.text}</Badge>;
}