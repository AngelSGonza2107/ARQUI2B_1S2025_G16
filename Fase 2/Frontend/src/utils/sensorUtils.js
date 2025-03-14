// src/utils/sensorUtils.js
export const getSensorDisplayName = (sensor) => {
    const names = {
      temperatura: "Temperatura",
      humedad: "Humedad",
      luz: "Estado de la Luz",
      calidadAire: "Calidad del Aire",
      corriente: "Corriente Eléctrica",
      distancia: "Distancia",
      distancia_puerta: "Estado de la Puerta",
      puerta: "Estado de la Puerta",
    };
    return names[sensor] || sensor;
  };
  
  export const getSensorStatus = (sensor, value) => {
    const limits = {
      temperatura: { warning: 30, critical: 35 },
      corriente: { warning: 10, critical: 15 },
      calidadAire: { warning: 400, critical: 600 },
      humedad: { warning: 70, critical: 80 },
    };
  
    if (limits[sensor]) {
      if (value >= limits[sensor].critical) return "critical";
      if (value >= limits[sensor].warning) return "warning";
    }
    return "normal";
  };