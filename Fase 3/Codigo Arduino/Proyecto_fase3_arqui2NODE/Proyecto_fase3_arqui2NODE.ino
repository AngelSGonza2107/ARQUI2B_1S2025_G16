#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char* ssid = "POCO X5 Pro 5G";
const char* wifi_password = "plaplepli";
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_topic_pub = "dataCenter/sensores";  // Tópico para publicar
const char* mqtt_topic_sub = "dataCenter/comandos";  // Tópico para suscribir

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setupWiFi() {
  WiFi.begin(ssid, wifi_password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);

    Serial.print(".");
  }
  
  Serial.print("\nConectado. IP: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  char message[20];
  length = length < 19 ? length : 19;
  memcpy(message, payload, length);
  message[length] = '\0';

  if(strstr(message, "luzV") || strstr(message, "puertaV")) {
    Serial.println(message);
  }
}

void connectMQTT() {
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(callback);

  String clientId = "NodeMCU-" + String(random(0xffff), HEX);

  Serial.println("Intentando conectar a MQTT...");
  while (!mqttClient.connected()) {
    if (mqttClient.connect(clientId.c_str())) {
      mqttClient.subscribe(mqtt_topic_sub);
      Serial.println("✅ Conectado a MQTT");
    } else {
      Serial.println("❌ Falló conexión MQTT, reintentando en 5 segundos...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  setupWiFi();
  connectMQTT();
}

void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();
  
  if (Serial.available()) {
    String payload = Serial.readStringUntil('\n');
    payload.trim();
    
    if (mqttClient.connected() && payload.length() > 0) {
      mqttClient.publish(mqtt_topic_pub, payload.c_str());
    }
  }
}