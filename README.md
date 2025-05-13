# 🌐 [Proyecto - Sistema Inteligente de Monitoreo Ambiental mediante IoT](https://youtu.be/CxrAFukMnrM)

**Universidad de San Carlos de Guatemala**  
**Facultad de Ingeniería**  
**Escuela de Ciencias y Sistemas**  
**Sistemas de Bases de Datos 1 - Segundo Semestre 2025** 

---

## 📌 Descripción del Proyecto

Este proyecto propone el desarrollo de un sistema inteligente de monitoreo ambiental orientado a cuartos de servidores, utilizando tecnologías de IoT para garantizar condiciones óptimas en estos espacios críticos. El sistema recolecta datos ambientales en tiempo real mediante sensores, y emplea procesamiento, análisis y visualización de información para alertar sobre posibles anomalías que puedan comprometer el funcionamiento del hardware.

📽️ Enlace al Video Presentación del Proyecto: https://youtu.be/CxrAFukMnrM

### 🔍 Características Principales:
- Medición de temperatura, humedad, calidad del aire, luz y corriente eléctrica.
- Implementación de sensores de proximidad, control de acceso RFID y autenticación facial.
- Comunicación en tiempo real mediante el protocolo MQTT.
- Visualización de datos en dashboards web en tiempo real e históricos.
- Integración con herramientas como Grafana para análisis avanzado y mapas de calor.
- Desarrollo de una plataforma web para monitoreo y control remoto del sistema.

### ⚙️ Arquitectura del Sistema
El sistema está basado en una arquitectura de 5 capas del IoT Stack Framework:
- Percepción: Sensores ambientales, motores, RFID, buzzer, LED.
- Red: NodeMCU ESP8266 y/o Raspberry Pi para conectividad Wi-Fi.
- Procesamiento: Arduino y Raspberry Pi como unidades de control y procesamiento local.
- Servicio: API backend para recepción y almacenamiento de datos (Node.js/Python).
- Aplicación: Plataforma web con dashboards, alertas y visualización de datos.

---

## 👥 Desarrolladores

| Nombre                           | GitHub                                                |  
|----------------------------------|-------------------------------------------------------|  
| Angel Samuel González Velásquez  | [Fercho9134](https://github.com/Fercho9134)           |  
| Irving Fernando Alvarado Asensio | [AngelSGonza2107](https://github.com/AngelSGonza2107) |  
| Adler Alejandro Pérez Asensio    | [AlejandroPA21](https://github.com/AlejandroPA21)     |                                                   |  
| Andrés Alejandro Quezada Cabrera | [MrQS94](https://github.com/MrQS94)                   |

---

## 📂 Documentación y Funcionalidades

El proyecto se ha dividido en 3 fases, cada una organizada en su propia carpeta. Cada carpeta contiene:

<details>
  <summary>💻 El código fuente de las funcionalidades desarrolladas</summary>
</details>

<details>
  <summary>📄 Documentación técnica y funcionalidades por fase</summary>
  <ul>
    <li>🧩 Diagrama de arquitectura del sistema IoT</li>
    <li>📶 Descripción técnica de los sensores y microcontroladores utilizados</li>
    <li>🔗 Configuración del protocolo MQTT y flujos de datos</li>
    <li>🗃️ Modelado y estructura de la base de datos</li>
    <li>🧑‍🏫 Manual de usuario para la plataforma web y dashboards</li>
    <li>☁️ Instrucciones de despliegue en la nube y conexión de dispositivos</li>
    <li>🧠 Todo el código implementado para Arduino, NodeMCU, Raspberry, APIs, Frontend, etc.</li>
  </ul>
</details>

Para obtener más detalles sobre las API's y el Frontend del proyecto, visita estos repositorios:
1. 🎨 [`Frontend`/`Dashboard` del proyecto](https://github.com/Fercho9134/dashboard-monitoreo-datacenter)
2. 🙃 [`API` para el reconocimiento facial](https://github.com/Fercho9134/api-reconocimiento-facial)
3. 🧾 [`API` para la recolección de datos históricos](https://github.com/Fercho9134/api-historicos)
4. 🗄️ [Suscriptor a la Base de Datos `Firebase`](https://github.com/Fercho9134/bd-suscriber)

---

## 📌 Nota
Este proyecto fue desarrollado como parte del curso Arquitectura de Computadores y Ensambladores 2, de la Facultad de Ingeniería en Ciencias y Sistemas de la Universidad de San Carlos de Guatemala.
