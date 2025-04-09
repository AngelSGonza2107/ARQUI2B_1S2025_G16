import json
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.feature_extraction import FeatureHasher
import paho.mqtt.client as mqtt
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    datefmt=''
)
logger = logging.getLogger(__name__)

# Inicializar Firebase
cred = credentials.Certificate('llave.json')
firebase_admin.initialize_app(cred)

# Inicializar Firestore
db = firestore.client()
lecturas_ref = db.collection("lecturas")

TIPOS_LECTURA = ["temperatura", "humedad", "calidadAire", "corriente"]

# Configuración MQTT
MQTT_BROKER = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "dataCenter/predicciones"
RESULT_TOPIC = "dataCenter/resultados"

def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        logger.info("Conectado al broker MQTT exitosamente")
        client.subscribe(MQTT_TOPIC)
    else:
        logger.error(f"Error de conexión: {reason_code}")

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode('utf-8')
        data = json.loads(payload)
        
        sensor = data.get('sensor')
        dias = data.get('dias')
        
        logger.info(f"Mensaje recibido - Sensor: {sensor}, Días: {dias}")
        
        # Validación de parámetros
        if sensor is None or dias is None:
            logger.error("Error: Los parámetros 'sensor' y 'dias' son requeridos")
            return
        
        try:
            dias = int(dias)
        except ValueError:
            logger.error("Error: El parámetro 'dias' debe ser un número entero")
            return
            
        if sensor not in TIPOS_LECTURA:
            logger.error("Error: Sensor no válido para la predicción")
            return
            
        if not (1 <= dias <= 8):
            logger.error("Error: El parámetro 'dias' debe estar entre 1 y 8")
            return
        
        # Procesar la solicitud
        resultado = generar_predicciones(sensor, dias)
        
        # Publicar resultado
        client.publish(RESULT_TOPIC, json.dumps(resultado))
        logger.info("Predicciones publicadas exitosamente")
        
    except Exception as e:
        logger.error(f"Error al procesar mensaje: {str(e)}")

def obtener_datos_historicos(sensor):
    datos = []
    dias_encontrados = 0
    dia_actual = 0

    dias_a_buscar = 4
    limite_dias = 30
    
    while dias_encontrados < dias_a_buscar and dia_actual < limite_dias:
        fecha_consulta = datetime.now() - timedelta(days=dia_actual)
        dia_inicio = fecha_consulta.replace(hour=0, minute=0, second=0, microsecond=0)
        dia_fin = dia_inicio.replace(hour=23, minute=59, second=59, microsecond=999999)

        query = (
            lecturas_ref
            .where(filter=firestore.FieldFilter("fecha_hora", ">=", dia_inicio))
            .where(filter=firestore.FieldFilter("fecha_hora", "<=", dia_fin))
            .order_by("fecha_hora", direction=firestore.Query.DESCENDING)
            .limit(150)
        )

        resultados = query.get()
        
        if resultados:
            dias_encontrados += 1
            for doc in resultados:
                doc_data = doc.to_dict()
                fecha = doc_data.get("fecha_hora")
                valor = doc_data.get(sensor)

                if fecha and valor is not None and isinstance(valor, (int, float)):
                    if isinstance(fecha, str):
                        fecha = datetime.fromisoformat(fecha)
                    datos.append({
                        "timestamp": fecha.timestamp(),
                        "valor": float(valor),
                        "fecha_original": fecha.isoformat()
                    })
        
        dia_actual += 1
    
    return datos

def generar_predicciones(sensor, dias):
    datos = obtener_datos_historicos(sensor)
    
    if len(datos) < 24:
        return {"error": "No hay datos suficientes para realizar la predicción"}

    # Ordenar datos por timestamp
    datos.sort(key=lambda x: x["timestamp"])
    
    # Preparar características
    X, y = [], []
    for i in range(1, len(datos)):
        dt = datetime.fromtimestamp(datos[i]['timestamp'])
        X.append({
            'hora': dt.hour,
            'dia_semana': dt.weekday(),
            'timestamp_norm': (datos[i]['timestamp'] - datos[0]['timestamp']) / 86400,
            'valor_anterior': datos[i-1]['valor'],
            'diff_anterior': datos[i]['valor'] - datos[i-1]['valor']
        })
        y.append(datos[i]['valor'])
    
    # Entrenar modelo
    hasher = FeatureHasher(n_features=10, input_type='dict')
    modelo = GradientBoostingRegressor(
        n_estimators=150,
        learning_rate=0.1,
        max_depth=4,
        min_samples_leaf=5,
        random_state=42
    )
    modelo.fit(hasher.transform(X), np.array(y))
    
    # Generar predicciones
    predicciones = []
    ultimo_ts = datos[-1]['timestamp']
    ultimo_valor = datos[-1]['valor']
    
    for dia in range(1, dias + 1):
        dt_pred = datetime.now() + timedelta(days=dia)
        ts_pred = ultimo_ts + (dia * 86400)
        
        x_pred = {
            'hora': dt_pred.hour,
            'dia_semana': dt_pred.weekday(),
            'timestamp_norm': (ts_pred - datos[0]['timestamp']) / 86400,
            'valor_anterior': ultimo_valor,
            'diff_anterior': 0
        }
        
        valor_pred = modelo.predict(hasher.transform([x_pred]))[0]
        ultimo_valor = valor_pred
        
        predicciones.append({
            'dia': dia,
            'fecha': dt_pred.strftime('%Y-%m-%d'),
            'valor_prediccion': round(float(valor_pred), 2),
            'hora_prediccion': dt_pred.strftime('%H:%M')
        })
    
    return {
        'sensor': sensor,
        'modelo': 'GradientBoostingRegressor',
        'total_muestras': len(datos),
        'predicciones': predicciones
    }

def main():
    try:
        # Configurar cliente MQTT con versión actualizada
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.on_connect = on_connect
        client.on_message = on_message
        
        # Conectar y mantener activo
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        logger.info("Iniciando cliente MQTT...")
        client.loop_forever()
        
    except Exception as e:
        logger.error(f"Error en la ejecución principal: {str(e)}")

if __name__ == '__main__':
    main()