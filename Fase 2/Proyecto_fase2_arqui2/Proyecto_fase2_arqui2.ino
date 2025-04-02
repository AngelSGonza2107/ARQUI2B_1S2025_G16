#include <DHT.h>
#include <DHT_U.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

float sensibilidad = 0.666;

// Pines de sensores
// Ultrasonicos
#define TRIG_PIN 2
#define ECHO_PIN 3
#define TRIG_PIN_ENTRADA 4
#define ECHO_PIN_ENTRADA 5

// Temperatura
#define DHTPIN 6
#define DHTTYPE DHT11
#define MOTOR_DC 7

// Luz
#define LDR_PIN 31  // Pin de sensor de luz
#define LED_PIN 8   // Pin iluminación

// RFID
#define SDA_PIN 53  // SDA (SS)
#define RST_PIN 48  // RST

/*
Se deben de conectar los pines de la siguiente manera: TODOS excepto el pin IRQ
SDA (SS) -> 53
SCK -> 52
MOSI -> 51
MISO -> 50
IRQ -> No conectar
GND -> GND
RST -> 48
3.3V -> 3.3V
*/

// Corriente
#define CORRIENTE_PIN A1
#define BUZZER_PIN 22

// Sensor de calidad de aire
#define MQ135_PIN A2

// LEDS de alerta
#define LED_ROJO 24      // Rojo
#define LED_AMARILLO 26  // Amarillo
#define LED_AZUL 28      // Azul

// Servo
#define SERVO_PIN 36

// Instancias de los objetos
MFRC522 rfid(SDA_PIN, RST_PIN);
DHT dht(DHTPIN, DHTTYPE);
Servo servo;

// Información usuarios autorizados
byte UsuariosAutorizados[][4] = {
  { 0x52, 0x32, 0x03, 0x1C },
  { 0x25, 0xDC, 0x2E, 0x02 }
};

#define NUM_USERS sizeof(UsuariosAutorizados) / sizeof(UsuariosAutorizados[0])

// Tiempos de actualización
unsigned long ultimaActualizacionLCD = 0;
unsigned long ultimaActualizacionSerial = 0;
unsigned long tiempoAlerta = 0;
bool alertaActiva = false;
unsigned long servoTime = 0;
bool servoCerrado = true;

void setup() {
  Serial.begin(9600);
  dht.begin();
  lcd.init();
  delay(100);
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Bienvenidos");

  // Configuración de pines
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(TRIG_PIN_ENTRADA, OUTPUT);
  pinMode(ECHO_PIN_ENTRADA, INPUT);
  pinMode(MOTOR_DC, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_AZUL, OUTPUT);
  pinMode(LDR_PIN, INPUT);

  // Inicialización de RFID
  SPI.begin();
  rfid.PCD_Init();

  // Inicialización de servo
  servo.attach(SERVO_PIN);
  servo.write(0);
}

void loop() {
  verificarRFID();
  verificarServo();

  // Enviar datos por Serial cada 0.5s
  if (millis() - ultimaActualizacionSerial >= 500) {
    ultimaActualizacionSerial = millis();
    enviarDatosSerial();
  }

  if (alertaActiva) {
    if (millis() - tiempoAlerta >= 3000) {  // Prioridad de 3s a alertas
      alertaActiva = false;
    }
  } else if (millis() - ultimaActualizacionLCD >= 500) {
    ultimaActualizacionLCD = millis();
    mostrarValoresTiempoReal();
  }
}

void verificarRFID() {
  if (servoCerrado) {
    if (rfid.PICC_IsNewCardPresent()) {
      if (rfid.PICC_ReadCardSerial()) {
        byte uid[4];
        String codigoTarjeta = "";

        for (byte i = 0; i < 4; i++) {
          uid[i] = rfid.uid.uidByte[i];
          codigoTarjeta += String(uid[i], HEX);  // Convertir a hexadecimal
          if (i < 3) codigoTarjeta += ":";       // Separador entre bytes
        }

        if (esUsuarioAutorizado(uid)) {
          servoCerrado = false;
          servoTime = millis();
          servo.write(90);
          mostrarAlerta("Ok: " + codigoTarjeta);
        } else {
          mostrarAlerta("Acceso denegado");
        }
      }
    }
  }
}

bool esUsuarioAutorizado(byte *uid) {
  //Comparar le uid leido con los usuarios autorizados
  for (int i = 0; i < NUM_USERS; i++) {
    if (memcmp(uid, UsuariosAutorizados[i], 4) == 0) {
      return true;
    }
  }
  return false;
}

void verificarServo() {
  if (!servoCerrado && millis() - servoTime >= 5000) {
    float distancia = obtenerDistanciaEntrada();
    if (distancia > 6) {
      servoCerrado = true;
      servo.write(0);
    } else {
      servoTime = millis();
      mostrarAlerta("Despeje la entrada");
    }
  }
}


void enviarDatosSerial() {
  float distancia = obtenerDistancia();
  int calidadAire = analogRead(MQ135_PIN);
  calidadAire = calcularCo2(calidadAire);
  int luz = !digitalRead(LDR_PIN);
  float humedad = dht.readHumidity();
  float temperatura = dht.readTemperature();
  float corriente = obtener_corriente();
  float dista = obtenerDistanciaEntrada();
  int puerta = 0;

  //Devolvemos 1 si la puerta esta abierta y 0 si esta cerrada
  if (servoCerrado) {
    puerta = 0;
  } else {
    puerta = 1;
  }


  Serial.println(String(temperatura) + "," + String(humedad) + "," + String(distancia) + "," + String(luz) + "," + String(calidadAire) + "," + String(corriente) + "," + String(dista) + "," + String(puerta));
}

float obtener_corriente() {
  int lectura = analogRead(CORRIENTE_PIN);
  float voltajeSensor = lectura * (5.0 / 1023.0);
  return (voltajeSensor - 2.5) / sensibilidad;
}

float calcularCo2(int valorADC) {
  return valorADC;
}

void mostrarValoresTiempoReal() {
  float distancia = obtenerDistancia();
  int calidadAire = analogRead(MQ135_PIN);
  calidadAire = calcularCo2(calidadAire);
  int luz = !digitalRead(LDR_PIN);
  float humedad = dht.readHumidity();
  float temperatura = dht.readTemperature();
  float corriente = obtener_corriente();

  if (isnan(humedad) || isnan(temperatura)) {
    mostrarAlerta("DHT11 Error");
    return;
  }

  manejarAlertas(temperatura, humedad, corriente);

  if (!alertaActiva) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("T:" + String(temperatura, 0) + " H:" + String(humedad, 0) + " D:" + String(obtenerDistancia(), 1));
    lcd.setCursor(0, 1);
    lcd.print("C2:" + String(calidadAire) + " C:" + String(corriente) + " L:" + String(luz));
  }
}

void mostrarAlerta(String mensaje) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(mensaje);
  alertaActiva = true;
  tiempoAlerta = millis();
}

float obtenerDistanciaEntrada() {
  digitalWrite(TRIG_PIN_ENTRADA, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN_ENTRADA, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN_ENTRADA, LOW);

  long duration = pulseIn(ECHO_PIN_ENTRADA, HIGH);
  return duration * 0.034 / 2;
}

float obtenerDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2;
}

void manejarAlertas(float temperatura, float humedad, float corriente) {

  // Nivel de co2
  int calidadAire = analogRead(MQ135_PIN);
  calidadAire = calcularCo2(calidadAire);

  // Nivel de luz
  int luz = digitalRead(LDR_PIN);  // Lee 1 si no hay luz y 0 si hay luz POSIBLE CAMBIO A !digitalRead(LDR_PIN)

  /*
    - Si no se detecta consumo de corriente el buzzar debe de pitar

    - Si humedad, co2 o temperatura son críticos, se enciende el ventilador (motor DC)


    - Si no hay luz (fotoresistencia) se deben de encender los leds (iluminación)
    */
  int contadorVentilador = 0;

  if (luz == 1) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }

  if (corriente < -15 || corriente > 15) {
    mostrarAlerta("Corriente ALERTA");
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(LED_AMARILLO, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_AMARILLO, LOW);
  }

  if (humedad < 30 || humedad > 60) {
    mostrarAlerta("Humedad ALERTA");
    contadorVentilador += 1;
    digitalWrite(LED_AZUL, HIGH);
  } else {
    digitalWrite(LED_AZUL, LOW);
  }

  if (temperatura < 18 || temperatura > 30) {
    mostrarAlerta("Temperatura ALERTA");
    contadorVentilador += 1;
    digitalWrite(LED_ROJO, HIGH);
  } else {
    digitalWrite(LED_ROJO, LOW);
  }

  if (calidadAire > 400) {
    mostrarAlerta("CO2 ALERTA");
    contadorVentilador += 1;
  }

  if (contadorVentilador > 0) {
    digitalWrite(MOTOR_DC, HIGH);

  } else {
    digitalWrite(MOTOR_DC, LOW);

  }

}