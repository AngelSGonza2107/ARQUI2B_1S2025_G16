// src/lib/api.js
const API_BASE_URL = "http://192.168.1.4:5000"; // Cambia esto si tu API está en otro lugar

export const fetchLiveData = async () => {
  const response = await fetch(`${API_BASE_URL}/datos`);
  if (!response.ok) throw new Error("Error fetching live data");
  return response.json();
};

export const fetchSensorData = async (sensor, fechaInicio, fechaFin) => {
  const params = new URLSearchParams();
  if (fechaInicio) params.append("fecha_inicio", fechaInicio);
  if (fechaFin) params.append("fecha_fin", fechaFin);

  const response = await fetch(`${API_BASE_URL}/datos/${sensor}/filtrado?${params.toString()}`);
  if (!response.ok) throw new Error("Error fetching sensor data");
  return response.json();
};

export const fetchLatestSensorData = async (sensor) => {
  const response = await fetch(`${API_BASE_URL}/datos/${sensor}/ultimo`);
  if (!response.ok) throw new Error("Error fetching latest sensor data");
  return response.json();
};