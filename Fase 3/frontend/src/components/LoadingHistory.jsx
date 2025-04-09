// src/components/LoadingHistory.jsx
import { motion } from 'framer-motion';
import { Activity, Database, BarChart2, Clock } from 'lucide-react';

export default function LoadingHistory() {
  const icons = [
    { icon: <Activity className="w-6 h-6 text-blue-600" />, delay: 0 },
    { icon: <Database className="w-6 h-6 text-purple-600" />, delay: 0.2 },
    { icon: <BarChart2 className="w-6 h-6 text-green-600" />, delay: 0.4 },
    { icon: <Clock className="w-6 h-6 text-yellow-500" />, delay: 0.6 }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Consultando historial</h3>
        <p className="text-gray-500">Recuperando datos del sensor seleccionado...</p>
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
        initial={{ opacity: 0 }} // Start invisible
        animate={{ opacity: 1 }} // Fade in
        transition={{ duration: 0.5 }}
      >
        {/* Barra de progreso indeterminada (efecto visual) */}
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5, 
            ease: "linear" 
          }}
          style={{ width: "50%" }} // Ajusta el ancho de la barra que se mueve
        />
      </motion.div>
      <p className="text-sm text-gray-500 mt-4">Por favor, espera un momento.</p>
    </div>
  );
}