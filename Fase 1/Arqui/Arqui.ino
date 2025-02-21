#include <DHT.h>
#include <DHT_U.h>
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>

#define DHTTYPE DHT11
#define DHTPIN 9

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

float sensibilidad = 0.666;

// Pines de sensores
#define TRIG_PIN 2
#define ECHO_PIN 3
#define LDR_PIN 4
#define LED_PIN 13
#define CORRIENTE_PIN A0
#define MQ135_PIN A1

#define LED_OK A2
#define LED_MID A3
#define LED_BAD A4

// Botones de control
#define MODO_NORMAL_PIN 10
#define MODO_GUARDAR_PIN 11
#define MODO_MOSTRAR_PIN 12


// Variable de almacenamiento en EEPROM
int eepromAddress = 0;

// Estados del sistema
enum Mode { TIEMPO_REAL,
            GUARDAR,
            MOSTRAR_GUARDADOS };
Mode modoActual = TIEMPO_REAL;

// Tiempos de actualización
unsigned long ultimaActualizacionLCD = 0;
unsigned long ultimaActualizacionSerial = 0;
unsigned long tiempoAlerta = 0;
bool alertaActiva = false;

void setup() {
  Serial.begin(9600);
  dht.begin();
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Bienvenidos");

  // Configuración de pines
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

  pinMode(MODO_NORMAL_PIN, INPUT);
  pinMode(MODO_GUARDAR_PIN, INPUT);
  pinMode(MODO_MOSTRAR_PIN, INPUT);

  pinMode(LED_OK, OUTPUT);
  pinMode(LED_MID, OUTPUT);
  pinMode(LED_BAD, OUTPUT);
}



void loop() {
  manejarBotones();

  // Enviar datos por Serial cada 0.5s
  if (millis() - ultimaActualizacionSerial >= 500) {
    ultimaActualizacionSerial = millis();
    enviarDatosSerial();
  }

  switch (modoActual) {
    case TIEMPO_REAL:
      if (alertaActiva) {
        if (millis() - tiempoAlerta >= 3000) {  // Prioridad de 3s a alertas
          alertaActiva = false;
        }
      } else if (millis() - ultimaActualizacionLCD >= 500) {
        ultimaActualizacionLCD = millis();
        mostrarValoresTiempoReal();
      }
      break;

    case GUARDAR:
      guardarValoresEEPROM();
      modoActual = TIEMPO_REAL;  // Volver automáticamente al modo normal
      break;

    case MOSTRAR_GUARDADOS:
      mostrarValoresEEPROM();
      break;
  }
}

void manejarBotones() {
  if (digitalRead(MODO_NORMAL_PIN) == HIGH) {
    modoActual = TIEMPO_REAL;
    alertaActiva = false;  // Salir de cualquier alerta
  }
  if (digitalRead(MODO_GUARDAR_PIN) == HIGH) {
    modoActual = GUARDAR;
  }
  if (digitalRead(MODO_MOSTRAR_PIN) == HIGH) {
    modoActual = MOSTRAR_GUARDADOS;
  }
}

void enviarDatosSerial() {
  float distancia = obtenerDistancia();
  int calidadAire = analogRead(MQ135_PIN);
  calidadAire = calcularCo2(calidadAire);
  int luz = digitalRead(LDR_PIN);
  float humedad = dht.readHumidity();
  float temperatura = dht.readTemperature();
  float corriente = obtener_corriente();

  Serial.println(String(temperatura) + "," + String(humedad) + "," + String(distancia) + "," + String(luz) + "," + String(calidadAire) + "," + String(corriente));
}

float obtener_corriente() {
  float voltajeSensor;
  float corriente = 0;
  float Imax = 0;
  float Imin = 0;

  voltajeSensor = analogRead(CORRIENTE_PIN) * (5.0 / 1023.0);
  corriente = 0.9 * corriente + 1 * ((voltajeSensor - 2.5) / sensibilidad);
  if (corriente > Imax) {
    Imax = corriente;
  }
  if (corriente < Imin) {
    Imin = corriente;
  }
  return (((Imax - Imin) / 2)) * 10;
}

float calcularCo2(int valorADC) {
  return valorADC;
}

void mostrarValoresTiempoReal() {
  float distancia = obtenerDistancia();
  int calidadAire = analogRead(MQ135_PIN);
  calidadAire = calcularCo2(calidadAire);
  int luz = digitalRead(LDR_PIN);
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
    lcd.print("T:" + String(temperatura) + " H:" + String(humedad));
    lcd.setCursor(0, 1);
    lcd.print("CO2:" + String(calidadAire) + " C:" + String(corriente));
  }
}

void mostrarAlerta(String mensaje) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(mensaje);
  alertaActiva = true;
  tiempoAlerta = millis();
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
void guardarValoresEEPROM() {
  float distancia = obtenerDistancia();
  float calidadAire = analogRead(MQ135_PIN);
  calidadAire = calcularCo2(calidadAire);
  float luz = digitalRead(LDR_PIN);
  float humedad = dht.readHumidity();
  float temperatura = dht.readTemperature();
  float corriente = obtener_corriente();

  EEPROM.put(eepromAddress, temperatura);
  EEPROM.put(eepromAddress + sizeof(float), humedad);
  EEPROM.put(eepromAddress + 2 * sizeof(float), distancia);
  EEPROM.put(eepromAddress + 3 * sizeof(float), calidadAire);
  EEPROM.put(eepromAddress + 4 * sizeof(float), corriente);
  EEPROM.put(eepromAddress + 5 * sizeof(float), luz);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Valor guardado");

  eepromAddress += 6 * sizeof(float);
  if (eepromAddress >= EEPROM.length()) {
    eepromAddress = 0;
  }
}

void mostrarValoresEEPROM() {
  float temperatura, humedad, distancia, luz, calidadAire, corriente;
  int addr = 0;
  int registro = 1;

  while (addr < eepromAddress && modoActual == MOSTRAR_GUARDADOS) {
    EEPROM.get(addr, temperatura);
    EEPROM.get(addr + sizeof(float), humedad);
    EEPROM.get(addr + 2 * sizeof(float), distancia);
    EEPROM.get(addr + 3 * sizeof(float), calidadAire);
    EEPROM.get(addr + 4 * sizeof(float), corriente);
    EEPROM.get(addr + 5 * sizeof(float), luz);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("T:" + String(temperatura) + " H:" + String(humedad));
    lcd.setCursor(0, 1);
    lcd.print("CO2:" + String(calidadAire) + " C:" + String(corriente));
    delay(3000);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("D:" + String(distancia) + " L:" + String(luz));
    lcd.setCursor(0, 1);
    lcd.print("Reg #" + String(registro));
    delay(3000);

    addr += 6 * sizeof(float);
    registro++;
  }
}

void manejarAlertas(float temperatura, float humedad, float corriente) {
  int errores = 0;
  if (corriente < 0.5 || corriente > 6) {
    errores = errores + 1;
    mostrarAlerta("Corriente ALERTA");
  }

  if (humedad < 20 || humedad > 60) {
    errores = errores + 1;
    mostrarAlerta("Humedad ALERTA");
  }

  if (temperatura < 18 || temperatura > 35) {
    errores = errores + 1;
    mostrarAlerta("Temperatura ALERTA");
  }

  if (errores > 0 && errores <= 2) {
    digitalWrite(LED_MID, HIGH);
    digitalWrite(LED_OK, LOW);
    digitalWrite(LED_BAD, LOW);

  } else if (errores > 2) {
    digitalWrite(LED_BAD, HIGH);
    digitalWrite(LED_OK, LOW);
    digitalWrite(LED_MID, LOW);
  } else if (errores < 1) {
    digitalWrite(LED_OK, HIGH);
    digitalWrite(LED_MID, LOW);
    digitalWrite(LED_BAD, LOW);
  }
}