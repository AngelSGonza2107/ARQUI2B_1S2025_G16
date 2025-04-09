import { motion } from 'framer-motion';

export default function LiveDataLoader({ message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="p-6 bg-white rounded-full shadow-lg border border-gray-200"
      >
        {icon}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500">Por favor espera mientras establecemos conexión</p>
      </motion.div>
      
      <motion.div 
        className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, repeat: Infinity }}
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