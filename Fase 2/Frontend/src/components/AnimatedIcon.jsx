// src/components/AnimatedIcon.jsx
import { motion } from "framer-motion";

export default function AnimatedIcon({ children }) {
  return (
    <motion.div
      whileHover={{ rotate: 15 }} // Girar 15 grados al pasar el mouse
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
}