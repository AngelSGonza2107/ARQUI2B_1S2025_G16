// src/hooks/useSensorData.js
import { useQuery } from "@tanstack/react-query";
import { fetchSensorData } from "../lib/api";

export const useSensorData = (sensor, fechaInicio, fechaFin) => {
  return useQuery({
    queryKey: ["sensorData", sensor, fechaInicio, fechaFin],
    queryFn: () => fetchSensorData(sensor, fechaInicio, fechaFin),
    enabled: !!sensor, // Solo ejecuta la query si el sensor está definido
  });
};