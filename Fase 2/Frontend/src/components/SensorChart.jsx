// src/components/SensorChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from "recharts";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";


export default function SensorChart({ data, title, color, isCritical }) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} /> {/* Más visible */}
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "#6B7280" }}
            tickFormatter={(time) => format(parseISO(time), "HH:mm:ss")} // Mostrar segundos
          />
          <YAxis tick={{ fill: "#6B7280" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFF",
              borderColor: "#E5E7EB",
              borderRadius: "8px",
              color: "#1F2937",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value) => [value, "Valor"]}
            labelFormatter={(time) => format(parseISO(time), "PPpp")} // Formatear la fecha en el tooltip
          />
          <Area
            type="monotone"
            dataKey="value"
            fill="url(#gradient)" // Usar el gradiente
            stroke="transparent" // Sin borde en el área
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={isCritical ? 4 : 2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}