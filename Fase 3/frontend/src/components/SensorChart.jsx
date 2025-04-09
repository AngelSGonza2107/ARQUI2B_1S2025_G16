import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
  Dot,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { es } from 'date-fns/locale'; // Importar locale español

const CustomizedDot = (props) => {
  const { cx, cy, stroke, payload, value } = props;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      stroke={stroke}
      strokeWidth={2}
      fill="#fff"
      className="animate-pulse"
    />
  );
};

export default function SensorChart({
  data = [],
  title = "",
  color = "#6366F1",
  isCritical = false,
}) {
  const [displayData, setDisplayData] = useState([]);

  // Efecto para animar la transición de datos
  useEffect(() => {
    if (data.length > 0) {
      setDisplayData(data.slice(-50)); // Mostrar solo los últimos 50 puntos
    }
  }, [data]);

  // Calcular dominio Y dinámico
  const values = displayData.map((d) => d.value).filter(Number.isFinite);
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const yAxisDomain = [
    Math.round(Math.max(minValue * 0.9, 0) * 100) / 100,
    Math.round(Math.max(maxValue * 1.2, 10) * 100) / 100,
  ];

  return (
    <div
      className={`p-4 rounded-lg mb-4 ${
        isCritical
          ? "bg-red-50 border border-red-200"
          : "bg-white border border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          Actualizado: {format(new Date(), "HH:mm:ss")}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={displayData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tick={{ fill: "#6B7280", fontSize: 12 }}
            tickFormatter={(time) => {
              try {
                return format(parseISO(time), "HH:mm");
              } catch {
                return "";
              }
            }}
          />

          <YAxis
            domain={yAxisDomain}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            width={60}
          />

          <Tooltip
            contentStyle={{
              background: "rgba(255, 255, 255, 0.96)",
              borderRadius: "0.5rem",
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              color: "#111827",
            }}
            formatter={(value) => [
              `${value?.toFixed(2) || "N/A"} ${getUnit(title)}`,
              "Valor",
            ]}
            labelFormatter={(label) => {
              try {
                return format(parseISO(label), "PPpp", {locale: es});
              } catch {
                return "Fecha inválida";
              }
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="transparent"
            fill="url(#gradient)"
            fillOpacity={1}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={isCritical ? 3 : 2}
            dot={<CustomizedDot />}
            activeDot={{
              r: 6,
              stroke: "#fff",
              strokeWidth: 2,
              fill: color,
            }}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function getUnit(sensorName) {
  if (!sensorName) return "";
  const sensor = sensorName.toLowerCase();
  const units = {
    temperatura: "°C",
    humedad: "%",
    calidadaire: "ppm",
    corriente: "A",
    distancia: "cm",
    distancia_puerta: "cm",
    luz: "",
    puerta: "",
  };
  return units[sensor] || "";
}
