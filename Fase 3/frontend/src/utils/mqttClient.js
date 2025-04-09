import mqtt from "mqtt";

const MQTT_BROKER_URL = "wss://broker.emqx.io:8084/mqtt";
const MQTT_OPTIONS = {
  clientId: `dc_frontend_${Math.random().toString(16).substr(2, 8)}`,
  keepalive: 60,
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 8000, // Aumentamos el timeout de conexión
  protocolVersion: 4,
  rejectUnauthorized: false,
  resubscribe: true // Habilitar resubscripción automática
};

class MQTTClient {
  constructor() {
    this.client = null;
    this.connectionListeners = {
      connect: [],
      error: [],
      close: []
    };
    this.connect();
  }

  connect() {
    if (this.client) {
      this.client.end(true);
    }

    console.log("[MQTT] Connecting to broker...");
    this.client = mqtt.connect(MQTT_BROKER_URL, MQTT_OPTIONS);

    // Configurar event listeners
    this.client.on("connect", () => {
      console.log("[MQTT] Connected to broker");
      this.connectionListeners.connect.forEach(cb => cb());
    });

    this.client.on("error", (err) => {
      console.error("[MQTT] Connection error:", err);
      this.connectionListeners.error.forEach(cb => cb(err));
    });

    this.client.on("close", () => {
      console.log("[MQTT] Connection closed");
      this.connectionListeners.close.forEach(cb => cb());
    });

    this.client.on("reconnect", () => {
      console.log("[MQTT] Attempting to reconnect...");
    });

    this.client.on("offline", () => {
      console.log("[MQTT] Client is offline");
    });
  }

  subscribe(topic, callback, options = { qos: 1 }) {
    if (!this.client) return;

    this.client.subscribe(topic, options, (err) => {
      if (err) {
        console.error(`[MQTT] Error subscribing to ${topic}:`, err);
        return;
      }
      console.log(`[MQTT] Subscribed to ${topic}`);
      this.client.on("message", (t, message) => {
        if (t === topic) {
          callback(t, message);
        }
      });
    });
  }

  unsubscribe(topic) {
    if (!this.client) return;
    
    this.client.unsubscribe(topic, (err) => {
      if (err) {
        console.error(`[MQTT] Error unsubscribing from ${topic}:`, err);
        return;
      }
      console.log(`[MQTT] Unsubscribed from ${topic}`);
    });
  }

  publish(topic, message, options = { qos: 1 }) {
    if (!this.client || !this.client.connected) {
      console.error("[MQTT] Cannot publish - client not connected");
      return false;
    }

    return this.client.publish(topic, message, options);
  }

  onConnect(callback) {
    this.connectionListeners.connect.push(callback);
  }

  onError(callback) {
    this.connectionListeners.error.push(callback);
  }

  onClose(callback) {
    this.connectionListeners.close.push(callback);
  }

  forceReconnect() {
    console.log("[MQTT] Forcefully reconnecting...");
    this.connect();
  }

  isConnected() {
    return this.client ? this.client.connected : false;
  }

  getClient() {
    return this.client;
  }
}

const mqttInstance = new MQTTClient();
export default mqttInstance;