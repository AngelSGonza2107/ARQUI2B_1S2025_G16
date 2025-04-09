import paho.mqtt.client as mqtt
from firebase_admin import firestore, initialize_app, credentials
from datetime import datetime
import pytz
import json
import time

# Configuración Firebase
cred = credentials.Certificate("llave.json")
firebase_app = initialize_app(cred)
db = firestore.client()

# Configuración MQTT
broker = 'broker.emqx.io'
port = 1883
topic = "dataCenter/sensores"
client_id = 'api-mqtt-sub-1'
username = 'api_client'
password = 'grupo16'

# Configurar zona horaria GMT-6
timezone = pytz.timezone('America/Mexico_City')

# Variable para controlar el tiempo
last_saved_time = 0
SAVE_INTERVAL = 6  # segundos

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Conectado al broker MQTT con código {rc}")
    client.subscribe(topic)

def on_message(client, userdata, msg):
    global last_saved_time
    
    current_time = time.time()
    
    # Solo procesar si ha pasado el intervalo de tiempo
    if current_time - last_saved_time >= SAVE_INTERVAL:
        try:
            print(f"Mensaje recibido en {msg.topic}: {msg.payload.decode()}")
            
            data = json.loads(msg.payload.decode())
            
            now_utc = datetime.now(pytz.utc)
            now_gmt6 = now_utc.astimezone(timezone)
            data['fecha_hora'] = now_gmt6
            
            doc_ref = db.collection('lecturas').document()
            doc_ref.set(data)
            
            print(f"Datos guardados en Firestore con ID: {doc_ref.id}")
            print(f"Marca de tiempo: {now_gmt6.isoformat()}")
            
            # Actualizar el tiempo del último guardado
            last_saved_time = current_time
            
        except Exception as e:
            print(f"Error al procesar el mensaje: {e}")
    else:
        print(f"Mensaje ignorado (esperando {SAVE_INTERVAL} segundos entre guardados)")

# Configurar cliente MQTT con versión de callback API V2
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id)
client.username_pw_set(username, password)
client.on_connect = on_connect
client.on_message = on_message

# Conectar y empezar el loop
try:
    client.connect(broker, port)
    client.loop_forever()
except KeyboardInterrupt:
    print("Desconectando...")
    client.disconnect()