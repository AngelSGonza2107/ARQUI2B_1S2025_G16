import serial
import time
from pymongo import MongoClient
from datetime import datetime

# Conexión con MongoDB en la nube
client = MongoClient("mongodb+srv://grupo16:arqui2@arqui2g16.vc63g.mongodb.net/?retryWrites=true&w=majority&appName=arqui2G16")
db = client["arqui2G16"]

# Definir las colecciones para cada sensor
coleccion_temperatura = db["temperatura"]
coleccion_humedad = db["humedad"]
coleccion_distancia = db["distancia"]
coleccion_luz = db["luz"]
coleccion_calidadAire = db["calidadAire"]
coleccion_corriente = db["corriente"]
coleccion_distancia_puerta = db["distancia_puerta"]
coleccion_puerta = db["puerta"]

# Abrir el puerto serial donde Arduino está enviando los datos
ser = serial.Serial('COM6', 9600)  # Cambia 'COM3' por el puerto correcto de tu sistema

# Función para procesar la línea recibida
def procesar_datos(linea):
    # Parsear la línea CSV recibida
    datos = linea.strip().split(',')
    if len(datos) == 8:  # Asegurarse de que hay 8 valores en la línea
        temperatura = float(datos[0])
        humedad = float(datos[1])
        distancia = float(datos[2])
        luz = float(datos[3])
        calidadAire = float(datos[4])
        corriente = float(datos[5])
        distancia_puerta = float(datos[6])
        puerta = datos[7]

        # Obtener la fecha y hora actual
        fecha_hora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Crear un diccionario con los datos y la fecha
        documento_temperatura = {"temperatura": temperatura, "fecha_hora": fecha_hora}
        documento_humedad = {"humedad": humedad, "fecha_hora": fecha_hora}
        documento_distancia = {"distancia": distancia, "fecha_hora": fecha_hora}
        documento_luz = {"luz": luz, "fecha_hora": fecha_hora}
        documento_calidadAire = {"calidadAire": calidadAire, "fecha_hora": fecha_hora}
        documento_corriente = {"corriente": corriente, "fecha_hora": fecha_hora}
        documento_distancia_puerta = {"distancia_puerta": distancia_puerta, "fecha_hora": fecha_hora}
        documento_puerta = {"puerta": puerta, "fecha_hora": fecha_hora}

        # Insertar los datos en las colecciones correspondientes
        coleccion_temperatura.insert_one(documento_temperatura)
        coleccion_humedad.insert_one(documento_humedad)
        coleccion_distancia.insert_one(documento_distancia)
        coleccion_luz.insert_one(documento_luz)
        coleccion_calidadAire.insert_one(documento_calidadAire)
        coleccion_corriente.insert_one(documento_corriente)
        coleccion_distancia_puerta.insert_one(documento_distancia_puerta)
        coleccion_puerta.insert_one(documento_puerta)

# Bucle para leer datos del puerto serial
while True:
    if ser.in_waiting > 0:
        # Leer la línea de datos
        linea = ser.readline().decode('utf-8').strip()  # Intentar leer y decodificar como UTF-8
        print(linea)  # Para ver qué datos está leyendo
        procesar_datos(linea)  # Procesar y almacenar en MongoDB

    else:
        print("Esperando nuevos datos...")  # Si no hay nuevos datos, muestra un mensaje

    ser.flushInput()  # Limpiar el buffer de entrada después de cada lectura

    time.sleep(0.5)  # Esperar 0.5 segundos entre lecturas