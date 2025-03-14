from flask import Flask, jsonify, request
from pymongo import MongoClient
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuración de conexión a MongoDB
client = MongoClient("mongodb+srv://grupo16:arqui2@arqui2g16.vc63g.mongodb.net/?retryWrites=true&w=majority&appName=arqui2G16")
db = client["arqui2G16"]

# Definir las colecciones
colecciones = {
    "temperatura": db["temperatura"],
    "humedad": db["humedad"],
    "distancia": db["distancia"],
    "luz": db["luz"],
    "calidadAire": db["calidadAire"],
    "corriente": db["corriente"],
    "distancia_puerta": db["distancia_puerta"],
    "puerta": db["puerta"]
}

@app.route('/datos/<sensor>', methods=['GET'])
def obtener_datos_sensor(sensor):
    if sensor in colecciones:
        datos = list(colecciones[sensor].find({}, {"_id": 0}).sort("fecha_hora", -1).limit(30))  # Últimos 30 registros
        return jsonify(datos), 200
    return jsonify({"error": "Sensor no encontrado"}), 404

@app.route('/datos', methods=['GET'])
def obtener_todos_los_datos():
    datos_completos = {}
    for sensor, coleccion in colecciones.items():
        datos_completos[sensor] = list(coleccion.find({}, {"_id": 0}).sort("fecha_hora", -1).limit(30)) # Últimos 30 registros
    return jsonify(datos_completos), 200

@app.route('/datos/<sensor>/filtrado', methods=['GET'])
def obtener_datos_filtrados(sensor):
    if sensor not in colecciones:
        return jsonify({"error": "Sensor no encontrado"}), 404

    # Parámetros opcionales: fecha inicio, fecha fin, límite
    fecha_inicio = request.args.get("fecha_inicio")  # Formato esperado: YYYY-MM-DD HH:MM:SS
    fecha_fin = request.args.get("fecha_fin")  # Formato esperado: YYYY-MM-DD HH:MM:SS
    limite = request.args.get("limite", default=500, type=int)  # Máximo de registros a devolver

    filtro = {}

    # Si el usuario proporciona un rango de fechas, filtramos por eso
    if fecha_inicio and fecha_fin:
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d %H:%M:%S")
            fecha_fin = datetime.strptime(fecha_fin, "%Y-%m-%d %H:%M:%S")
            filtro["fecha_hora"] = {"$gte": fecha_inicio.strftime('%Y-%m-%d %H:%M:%S'), 
                                    "$lte": fecha_fin.strftime('%Y-%m-%d %H:%M:%S')}
        except ValueError:
            return jsonify({"error": "Formato de fecha inválido. Usa YYYY-MM-DD HH:MM:SS"}), 400

    # Consultar MongoDB con los filtros
    datos = list(colecciones[sensor].find(filtro, {"_id": 0}).sort("fecha_hora", -1).limit(limite))

    # Si el rango de tiempo es muy grande, aplicamos muestreo simple
    if len(datos) > 500:
        datos = datos[::len(datos) // 500]  # Tomamos solo cada X elementos

    return jsonify(datos), 200

@app.route('/datos/<sensor>/ultimo', methods=['GET'])
def obtener_ultimo_dato(sensor):
    if sensor not in colecciones:
        return jsonify({"error": "Sensor no encontrado"}), 404

    # Buscar el último dato en la colección del sensor
    dato = colecciones[sensor].find_one({}, {"_id": 0}, sort=[("fecha_hora", -1)])

    if not dato:
        return jsonify({"error": "No hay datos disponibles para este sensor"}), 404

    return jsonify(dato), 200



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 

