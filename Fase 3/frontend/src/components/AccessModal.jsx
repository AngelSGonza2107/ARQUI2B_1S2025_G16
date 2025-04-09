"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  X,
  Check,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  RotateCw,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { verifyFace } from "@/lib/api"; // Asegúrate de que esta importación sea correcta
import mqttInstance from "@/utils/mqttClient";

export default function AccessModal({ isOpen, onClose, cliente }) {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("idle");
  const [attempts, setAttempts] = useState(0);
  const [facialStatus, setFacialStatus] = useState("pending");
  const [photoData, setPhotoData] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const CORRECT_PIN = "4279";

  // Efectos para manejar la cámara
  useEffect(() => {
    if (status === "success" && isOpen) {
      setShowTransition(true);
      const timer = setTimeout(() => {
        setShowTransition(false);
        startCamera();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [status, isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setFacialStatus("error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = async () => {
    setFacialStatus("capturing");
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        canvas.toBlob(async (blob) => {
          try {
            const result = await verifyFace(blob);
            console.log("Resultado de verificación facial:", result);
            setVerificationResult(result);
            
            if (result.access) {
              setFacialStatus("success");
              setTimeout(() => {
                stopCamera();
                onClose();
              }, 3500);

              // Caso access true
              if (result.access === true) {
                const message = {"puertaV":1};
                const publicado = cliente.publish("dataCenter/comandos", JSON.stringify(message));
              }else{
                const message = {"puertaV":0};
                const publicado = cliente.publish("dataCenter/comandos", JSON.stringify(message));
              }
            

            } else {
              // Maneja el caso donde no hay caras o no coincide
              setFacialStatus("error");
              const message = {"puertaV":0};
              const publicado = cliente.publish("dataCenter/comandos", JSON.stringify(message));

              
            }
          } catch (error) {
            console.error("Error en verificación facial:", error);
            setFacialStatus("error");
            alert("Error al verificar el rostro. Por favor, intente nuevamente.");
          }
        }, "image/jpeg", 0.9);
      } catch (error) {
        console.error("Error al capturar foto:", error);
        setFacialStatus("error");
      }
    }
  };

  const retryFacial = () => {
    stopCamera();
    setFacialStatus("pending");
    setVerificationResult(null);
    startCamera();
  };

  const handleNumberClick = (number) => {
    if (pin.length < 4 && status !== "verifying") {
      setPin(pin + number);
    }
  };

  const handleSubmit = () => {
    if (pin.length !== 4) return;

    setStatus("verifying");
    setTimeout(() => {
      if (pin === CORRECT_PIN) {
        setStatus("success");
      } else {
        setStatus("error");
        setAttempts(prev => prev + 1);
        setTimeout(() => {
          setPin("");
          if (attempts < 2) setStatus("idle");
        }, 800);
      }
    }, 800);
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const resetAll = () => {
    setPin("");
    setStatus("idle");
    setAttempts(0);
    setFacialStatus("pending");
    setPhotoData(null);
    setShowTransition(false);
    setVerificationResult(null);
    stopCamera();
  };

  useEffect(() => {
    if (!isOpen) resetAll();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border-0 shadow-xl">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-gradient-to-b from-gray-50 to-white"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    {status === "success"
                      ? showTransition
                        ? "Verificación en progreso"
                        : "Verificación Facial"
                      : "Acceso Seguro"}
                  </DialogTitle>
                  <button
                    onClick={() => {
                      stopCamera();
                      onClose();
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                  >
                  </button>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-6">
                {status !== "success" ? (
                  <>
                    {/* Estado de ingreso de PIN */}
                    <div className="flex flex-col items-center mb-6">
                      <motion.div
                        className={cn(
                          "p-5 rounded-full mb-4 shadow-inner",
                          status === "error"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Lock className="h-8 w-8" />
                      </motion.div>

                      <p className={cn(
                        "text-sm mb-6 min-h-5 font-medium",
                        status === "error" ? "text-red-600" : "text-gray-600"
                      )}>
                        {status === "idle" && (attempts > 0
                          ? `Intento ${attempts + 1}/3`
                          : "Ingrese su PIN de 4 dígitos")}
                        {status === "verifying" && "Verificando..."}
                        {status === "error" && (attempts >= 3
                          ? "Demasiados intentos fallidos"
                          : "PIN incorrecto, intente nuevamente")}
                      </p>

                      {/* Indicador de PIN */}
                      <div className="flex gap-3 mb-8">
                        {[0, 1, 2, 3].map(i => (
                          <motion.div
                            key={i}
                            className={cn(
                              "w-4 h-4 rounded-full border-2",
                              i < pin.length
                                ? status === "error"
                                  ? "bg-red-500 border-red-500"
                                  : "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            )}
                            whileTap={{ scale: 0.9 }}
                          />
                        ))}
                      </div>

                      {/* Teclado numérico */}
                      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <KeypadButton
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            disabled={status === "verifying" || attempts >= 3}
                          >
                            {num}
                          </KeypadButton>
                        ))}

                        <KeypadButton
                          onClick={handleBackspace}
                          disabled={!pin.length || status === "verifying" || attempts >= 3}
                          variant="ghost"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </KeypadButton>

                        <KeypadButton
                          onClick={() => handleNumberClick("0")}
                          disabled={status === "verifying" || attempts >= 3}
                        >
                          0
                        </KeypadButton>

                        <KeypadButton
                          onClick={handleSubmit}
                          disabled={pin.length !== 4 || status === "verifying" || attempts >= 3}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </KeypadButton>
                      </div>
                    </div>
                  </>
                ) : showTransition ? (
                  <>
                    {/* Transición a verificación facial */}
                    <motion.div 
                      className="flex flex-col items-center justify-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          rotate: {
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "linear"
                          },
                          scale: {
                            repeat: Infinity,
                            duration: 1,
                            ease: "easeInOut"
                          }
                        }}
                        className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                      >
                        <Lock className="h-8 w-8 text-blue-600" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Verificación en progreso
                      </h3>
                      <p className="text-gray-500 text-center max-w-xs">
                        Preparando sistema de reconocimiento facial...
                      </p>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Verificación facial */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-xs aspect-square mb-6 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-inner">
                        {facialStatus === "pending" || facialStatus === "capturing" ? (
                          <>
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                              style={{ transform: "scaleX(-1)" }}
                            />
                            {facialStatus === "capturing" && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-black/30 flex items-center justify-center"
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className="text-white text-lg font-medium flex flex-col items-center"
                                >
                                  <Camera className="h-8 w-8 mb-2 animate-pulse" />
                                  Capturando imagen...
                                </motion.div>
                              </motion.div>
                            )}
                          </>
                        ) : facialStatus === "success" ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full bg-green-50 flex flex-col items-center justify-center"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", damping: 10 }}
                              className="p-4 bg-green-100 rounded-full mb-4"
                            >
                              <Check className="h-10 w-10 text-green-600" />
                            </motion.div>
                            <h3 className="text-xl font-semibold text-green-600 mb-1">
                              Verificación exitosa
                            </h3>
                            <p className="text-green-500 text-sm">
                              Acceso concedido al DataCenter
                            </p>
                            {verificationResult?.user && (
                              <div className="mt-2 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-md">
                                Usuario: {verificationResult.user}
                              </div>
                            )}
                            {verificationResult?.confidence && (
                              <div className="mt-1 text-xs text-green-700">
                                Confianza: {verificationResult.confidence.toFixed(2)}%
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full bg-red-50 flex flex-col items-center justify-center"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", damping: 10 }}
                              className="p-4 bg-red-100 rounded-full mb-4"
                            >
                              <AlertTriangle className="h-10 w-10 text-red-600" />
                            </motion.div>
                            <h3 className="text-xl font-semibold text-red-600 mb-1">
                              Verificación fallida
                            </h3>
                            <p className="text-red-500 text-sm">
                              No se pudo verificar su identidad
                            </p>
                          </motion.div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                      </div>

                      <div className="w-full max-w-xs">
                        {facialStatus === "pending" && (
                          <Button
                            onClick={capturePhoto}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                            size="lg"
                          >
                            <Camera className="h-5 w-5 mr-2" />
                            Tomar Foto para Verificación
                          </Button>
                        )}
                        {facialStatus === "error" && (
                          <Button
                            onClick={retryFacial}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                            size="lg"
                          >
                            <RotateCw className="h-5 w-5 mr-2" />
                            Intentar Nuevamente
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

const KeypadButton = ({ children, className, ...props }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "h-14 w-full rounded-lg bg-white border border-gray-200",
        "flex items-center justify-center text-lg font-medium",
        "hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white",
        "shadow-sm hover:shadow-md transition-all",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};