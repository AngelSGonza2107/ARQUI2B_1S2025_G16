import { useEffect, useState, useCallback, useRef } from "react";
import mqttInstance from "../utils/mqttClient";

export const useMqttData = () => {
  const [currentData, setCurrentData] = useState(null);
  const [chartData, setChartData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const activeSensors = useRef(new Set());
  const messageHandlers = useRef(new Map());
  const connectionListeners = useRef({});

  // Función para limpiar y parsear el mensaje MQTT
  const parseMessage = useCallback((message) => {
    try {
      const cleanedMessage = message.toString()
        .replace(/\u00A0/g, ' ')
        .replace(/[^\x20-\x7E]/g, '');
      return JSON.parse(cleanedMessage);
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
      return null;
    }
  }, []);

  // Manejo de conexión centralizado
  const setupConnection = useCallback(() => {
    const client = mqttInstance.getClient();
    
    // Limpiar listeners anteriores si existen
    if (connectionListeners.current.connect) {
      client.off('connect', connectionListeners.current.connect);
    }
    if (connectionListeners.current.close) {
      client.off('close', connectionListeners.current.close);
    }
    if (connectionListeners.current.error) {
      client.off('error', connectionListeners.current.error);
    }

    // Configurar nuevos listeners
    const onConnect = () => {
      console.log('MQTT Connected - Resubscribiendo');
      setIsConnected(true);
      // Resuscribirse a los sensores activos
      activeSensors.current.forEach(sensor => {
        const topic = `dataCenter/${sensor}`;
        client.subscribe(topic, { qos: 1 });
      });
    };

    const onClose = () => {
      console.log('MQTT Disconnected');
      setIsConnected(false);
    };

    const onError = (err) => {
      console.error('MQTT Error:', err);
      setIsConnected(false);
    };

    client.on('connect', onConnect);
    client.on('close', onClose);
    client.on('error', onError);

    // Guardar referencias para poder limpiar
    connectionListeners.current = {
      connect: onConnect,
      close: onClose,
      error: onError
    };

    return () => {
      client.off('connect', onConnect);
      client.off('close', onClose);
      client.off('error', onError);
    };
  }, []);

  // Efecto principal para manejar la conexión
  useEffect(() => {
    const cleanupConnection = setupConnection();
    
    // Forzar reconexión si la página se vuelve visible
    const handleVisibilityChange = () => {
      if (!document.hidden && !isConnected) {
        console.log('Página visible - Forzando reconexión');
        mqttInstance.forceReconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      cleanupConnection();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setupConnection, isConnected]);

  // Manejo de mensajes
  useEffect(() => {
    if (!isConnected) return;

    const client = mqttInstance.getClient();
    const topic = 'dataCenter/sensores';

    const handleMessage = (topic, message) => {
      const newData = parseMessage(message);
      if (!newData) return;

      setCurrentData(newData);
      
      setChartData(prev => {
        const updated = {...prev};
        activeSensors.current.forEach(sensor => {
          if (newData[sensor] !== undefined) {
            updated[sensor] = [
              ...(updated[sensor] || []),
              {
                time: new Date().toISOString(),
                value: newData[sensor]
              }
            ].slice(-100);
          }
        });
        return updated;
      });
    };

    client.subscribe(topic, { qos: 1 });
    client.on('message', handleMessage);
    messageHandlers.current.set(topic, handleMessage);

    return () => {
      client.unsubscribe(topic);
      client.off('message', handleMessage);
      messageHandlers.current.delete(topic);
    };
  }, [isConnected, parseMessage]);

  const startCollectingData = useCallback((sensor) => {
    const client = mqttInstance.getClient();
    const topic = `dataCenter/${sensor}`;
    
    activeSensors.current.add(sensor);
    setChartData(prev => ({
      ...prev,
      [sensor]: prev[sensor] || []
    }));

    if (client.connected) {
      client.subscribe(topic, { qos: 1 });
    }
  }, []);

  const stopCollectingData = useCallback((sensor) => {
    const client = mqttInstance.getClient();
    const topic = `dataCenter/${sensor}`;
    
    activeSensors.current.delete(sensor);
    
    if (client.connected) {
      client.unsubscribe(topic);
    }
    
    setChartData(prev => {
      const newData = { ...prev };
      delete newData[sensor];
      return newData;
    });
  }, []);

  return {
    currentData,
    chartData,
    isConnected,
    startCollectingData,
    stopCollectingData
  };
};
