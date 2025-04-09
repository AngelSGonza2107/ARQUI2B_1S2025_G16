// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LiveDashboard from "./pages/LiveDashboard";
import SensorDetail from "./pages/SensorDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PredictionsPage from "./pages/PredictionsPage";

function App() {
  return (
    <Router>
      {/* Navbar se muestra en todas las páginas */}
      <Navbar />

      {/* Definición de rutas */}
      <Routes>
        <Route path="/" element={<LiveDashboard />} />
        <Route path="/sensor" element={<SensorDetail />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        {/* Puedes agregar más rutas aquí */}
      </Routes>
      
      {/* Footer se muestra en todas las páginas */}
      <Footer />
    </Router>
  );
}

export default App;