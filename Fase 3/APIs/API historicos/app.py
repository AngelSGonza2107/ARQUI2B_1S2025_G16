from flask import Flask, jsonify, request
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
from pytz import timezone, utc
import statistics
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuración
ZONA_HORARIA = timezone('America/Mexico_City')  # Ajusta tu zona horaria
MAX_DATOS = 250
MAX_DATOS_MAPA_CALOR = 500  # Máximo de datos para el mapa de calor

# Firebase
cred = credentials.Certificate("llave.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def formatear_fecha(fecha):
    """Formatea la fecha a la zona horaria especificada"""
    if isinstance(fecha, str):
        fecha = datetime.strptime(fecha, '%Y-%m-%d %H:%M:%S')
    return fecha.astimezone(ZONA_HORARIA).strftime('%Y-%m-%d %H:%M:%S')

@app.route('/datos/<campo>/filtrado', methods=['GET'])
def obtener_datos_filtrados(campo):
    try:
        # Validar parámetros
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return jsonify({'error': 'Se requieren fecha_inicio y fecha_fin'}), 400

        # Convertir fechas
        start_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d %H:%M:%S")
        end_dt = datetime.strptime(fecha_fin, "%Y-%m-%d %H:%M:%S")

        # Calcular días en el rango
        delta_dias = (end_dt - start_dt).days + 1
        lecturas_por_dia = max(1, MAX_DATOS // delta_dias)
        
        datos = []
        
        # Procesar cada día del rango
        for dia in range(delta_dias):
            current_date = start_dt + timedelta(days=dia)
            next_date = current_date + timedelta(days=1)
            
            
            # Dividir las lecturas por día en mitades (inicio y fin)
            mitad = lecturas_por_dia // 2
            restante = lecturas_por_dia - mitad  # Para manejar números impares

            #Agregamos utc -6 a la fecha de inicio y fin
            current_date = current_date.replace(tzinfo=utc).astimezone(ZONA_HORARIA)
            next_date = next_date.replace(tzinfo=utc).astimezone(ZONA_HORARIA)
            
            # Primera mitad (inicio del día)
            lecturas_inicio = db.collection('lecturas')\
                              .where('fecha_hora', '>=', current_date)\
                              .where('fecha_hora', '<', next_date)\
                              .order_by('fecha_hora')\
                              .limit(mitad)\
                              .stream()
            
            # Segunda mitad (final del día)
            lecturas_fin = db.collection('lecturas')\
                           .where('fecha_hora', '>=', current_date)\
                           .where('fecha_hora', '<', next_date)\
                           .order_by('fecha_hora', direction='DESCENDING')\
                           .limit(restante)\
                           .stream()
            
            # Procesar resultados del inicio del día
            for doc in lecturas_inicio:
                doc_data = doc.to_dict()
                if campo in doc_data:
                    datos.append({
                        "fecha_hora": formatear_fecha(doc_data["fecha_hora"]),
                        campo: doc_data[campo]
                    })
            
            # Procesar resultados del final del día (en orden cronológico)
            for doc in reversed(list(lecturas_fin)):
                doc_data = doc.to_dict()
                if campo in doc_data:
                    datos.append({
                        "fecha_hora": formatear_fecha(doc_data["fecha_hora"]),
                        campo: doc_data[campo]
                    })
        
        # Si por algún día no hubieron datos, podríamos tener menos de MAX_DATOS
        # Podemos completar con datos adicionales si es necesario
        if len(datos) < MAX_DATOS:
            # Consulta adicional para completar (opcional)
            docs_extra = db.collection('lecturas')\
                         .where('fecha_hora', '>=', start_dt)\
                         .where('fecha_hora', '<=', end_dt)\
                         .order_by('fecha_hora')\
                         .limit(MAX_DATOS - len(datos))\
                         .stream()
            
            for doc in docs_extra:
                doc_data = doc.to_dict()
                if campo in doc_data and doc_data not in datos:  # Evitar duplicados
                    datos.append({
                        "fecha_hora": formatear_fecha(doc_data["fecha_hora"]),
                        campo: doc_data[campo]
                    })
        
        # Ordenamos todos los datos cronológicamente
        datos.sort(key=lambda x: x["fecha_hora"])
        
        return jsonify(datos), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/datos/<campo>/mapa-calor', methods=['GET'])
def obtener_mapa_calor(campo):
    try:
        # Validar parámetros
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return jsonify({'error': 'Se requieren fecha_inicio y fecha_fin'}), 400

        # Convertir fechas
        start_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d %H:%M:%S")
        end_dt = datetime.strptime(fecha_fin, "%Y-%m-%d %H:%M:%S")
        
        # Calcular días en el rango
        delta_dias = (end_dt - start_dt).days + 1
        lecturas_por_dia = max(1, MAX_DATOS_MAPA_CALOR // delta_dias)
        
        resultados = []
        
        # Procesar cada día del rango
        for dia in range(delta_dias):
            current_date = start_dt + timedelta(days=dia)
            next_date = current_date + timedelta(days=1)
            
            # Obtener lecturas para este día (mitad al inicio, mitad al final)
            mitad = lecturas_por_dia // 2
            
            # Primera mitad (inicio del día)
            lecturas_inicio = db.collection('lecturas')\
                              .where('fecha_hora', '>=', current_date)\
                              .where('fecha_hora', '<', next_date)\
                              .order_by('fecha_hora')\
                              .limit(mitad)\
                              .stream()
            
            # Segunda mitad (final del día)
            lecturas_fin = db.collection('lecturas')\
                           .where('fecha_hora', '>=', current_date)\
                           .where('fecha_hora', '<', next_date)\
                           .order_by('fecha_hora', direction='DESCENDING')\
                           .limit(mitad)\
                           .stream()
            
            # Procesar valores
            valores = []
            
            for doc in lecturas_inicio:
                doc_data = doc.to_dict()
                if campo in doc_data:
                    valor = doc_data[campo]
                    # Verificar si el valor es válido
                    if valor not in ['N/A', None] and isinstance(valor, (int, float)):
                        valores.append(float(valor))
            
            for doc in lecturas_fin:
                doc_data = doc.to_dict()
                if campo in doc_data:
                    valor = doc_data[campo]
                    # Verificar si el valor es válido
                    if valor not in ['N/A', None] and isinstance(valor, (int, float)):
                        valores.append(float(valor))
            
            # Calcular media o usar 0 si no hay datos
            media = statistics.mean(valores) if valores else 0
            
            resultados.append({
                'fecha': current_date.strftime('%Y-%m-%d'),
                'media_lectura': round(media, 2)  # Redondear a 2 decimales
            })
        
        return jsonify(resultados), 200

    except Exception as e: 
        return jsonify({'error': str(e)}), 500


@app.route('/', methods=['GET'])
def bienvenida():
    return jsonify({'mensaje': 'Bienvenido a la API de datos de Firebase'}), 200

if __name__ == '__main__':
    app.run(
        host="0.0.0.0",
        port=5000,
        threaded=True,  # Permite manejar múltiples requests
        debug=False     # ¡Desactiva debug en producción!
    )