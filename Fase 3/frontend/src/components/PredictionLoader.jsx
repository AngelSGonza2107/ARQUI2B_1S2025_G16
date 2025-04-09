// src/components/PredictionLoader.jsx
import { motion } from 'framer-motion';
import { Activity, Cpu, BarChart2, Zap } from 'lucide-react';

export default function PredictionLoader() {
  const icons = [
    { icon: <Activity className="w-6 h-6 text-blue-600" />, delay: 0 },
    { icon: <Cpu className="w-6 h-6 text-purple-600" />, delay: 0.2 },
    { icon: <BarChart2 className="w-6 h-6 text-green-600" />, delay: 0.4 },
    { icon: <Zap className="w-6 h-6 text-yellow-500" />, delay: 0.6 }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Analizando datos históricos</h3>
        <p className="text-gray-500">Generando predicciones con modelos de machine learning</p>
      </motion.div>
      
      <div className="flex justify-center gap-6 mb-8">
        {icons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
              y: [0, -15, 0],
              opacity: 1
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              delay: item.delay,
              ease: "easeInOut"
            }}
            className="bg-white p-4 rounded-full shadow-md border border-gray-100"
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="w-full max-w-md bg-gray-200 rounded-full h-2.5 overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 3, ease: "linear" }}
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          style={{
            width: "100%",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          }}
        />
      </motion.div>
    </div>
  );
}