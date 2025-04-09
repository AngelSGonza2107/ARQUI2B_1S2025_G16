// src/lib/api.js
const API_BASE_URL = "https://api-historicos.onrender.com"; //api datos historicos
const API_BSSE_URL_FACIAL = "https://api-reconocimiento-facial.onrender.com" //api datos faciales

export const verifyFace = async (image) => {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_BSSE_URL_FACIAL}/verify`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Error verifying face");
  return response.json();
}


export const fetchSensorData = async (sensor, fechaInicio, fechaFin) => {
  const params = new URLSearchParams();
  if (fechaInicio) params.append("fecha_inicio", fechaInicio);
  if (fechaFin) params.append("fecha_fin", fechaFin);

  const response = await fetch(`${API_BASE_URL}/datos/${sensor}/filtrado?${params.toString()}`);
  if (!response.ok) throw new Error("Error fetching sensor data");
  return response.json();
};

export const fetchHeatMap = async (sensor, fechaInicio, fechaFin) => {
  const params = new URLSearchParams();
  if (fechaInicio) params.append("fecha_inicio", fechaInicio);
  if (fechaFin) params.append("fecha_fin", fechaFin);

  const response = await fetch(`${API_BASE_URL}/datos/${sensor}/mapa-calor?${params.toString()}`);
  if (!response.ok) throw new Error("Error fetching heatmap data");
  return response.json();
}