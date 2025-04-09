import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { motion } from 'framer-motion';

const getColorForSensor = (sensor) => {
  const colors = {
    temperatura: '#FF6B6B',
    humedad: '#4ECDC4',
    calidadAire: '#45B7D1',
    corriente: '#FFA07A'
  };
  return colors[sensor] || '#8884d8';
};

export default function PredictionChart({ data, sensor }) {
  const chartData = data.map(item => ({
    ...item,
    valor_prediccion: Number(item.valor_prediccion.toFixed(2))
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-80 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getColorForSensor(sensor)} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={getColorForSensor(sensor)} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="dia" 
            label={{ value: 'Días', position: 'insideBottomRight', offset: -5 }}
            tick={{ fill: '#6B7280' }}
          />
          <YAxis 
            label={{ 
              value: getUnit(sensor), 
              angle: -90, 
              position: 'insideLeft',
              fill: '#6B7280'
            }}
            tick={{ fill: '#6B7280' }}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.96)',
              borderRadius: '0.5rem',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#111827'
            }}
            formatter={(value) => [`${value} ${getUnit(sensor)}`, 'Predicción']}
            labelFormatter={(label) => `Día ${label}`}
          />
         
          <Area 
            type="monotone" 
            dataKey="valor_prediccion" 
            stroke={getColorForSensor(sensor)}
            fillOpacity={1} 
            fill="url(#colorValue)"
            name={`Predicción ${sensor}`}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="valor_prediccion" 
            stroke={getColorForSensor(sensor)}
            strokeWidth={2}
            dot={{ r: 4, fill: getColorForSensor(sensor), strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#fff', stroke: getColorForSensor(sensor), strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function getUnit(sensor) {
  const units = {
    temperatura: "°C",
    humedad: "%",
    calidadAire: "ppm",
    corriente: "A"
  };
  return units[sensor] || "";
}