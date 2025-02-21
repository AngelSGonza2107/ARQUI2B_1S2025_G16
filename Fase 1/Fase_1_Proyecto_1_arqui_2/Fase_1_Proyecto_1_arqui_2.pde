import processing.serial.*;

Serial myPort;
String[] sensorData;
float temperature = 0;
float humidity = 0;
float ultrasonic = 0;
float light = 0;
float airQuality = 0;
float current = 0;
int lastUpdate = 0;

color bgColor1 = color(15, 20, 35);
color bgColor2 = color(30, 40, 55);
color cardColor = color(45, 55, 70, 220);
color primaryColor = color(0, 170, 255);
color warningColor = color(255, 180, 0);
color criticalColor = color(255, 0, 0);
color textColor = color(255);

PFont font;
PImage personIcon;

// Notificaciones
ArrayList<Notification> notifications = new ArrayList<Notification>();

void setup() {
  size(875, 680);
  noStroke();
  smooth();
  font = createFont("Roboto-Regular.ttf", 24);
  textFont(font);
  personIcon = loadImage("person_icon.png");
  String portName = Serial.list()[0]; // Cambiar índice si es necesario
  myPort = new Serial(this, portName, 9600);
  myPort.bufferUntil('\n');
}

void draw() {
  drawGradientBackground();
  
 /* if (millis() - lastUpdate > 5000) {
    temperature = random(20, 60);
    humidity = random(20, 80);
    ultrasonic = int(random(0, 10));
    light = random(0, 100);
    airQuality = random(20, 80);
    current = random(20, 80);
    checkCriticalLevels();
    lastUpdate = millis();
  }*/
  
  drawTitle();
  
  int cardWidth = 250; // Ancho de cada carta
  int cardHeight = 250; // Alto de cada carta
  int margin = 25; // Margen entre cartas
  
  // Primera fila: 3 cartas
  drawGauge(margin, 100, cardWidth, cardHeight, temperature, "Temperatura", "°C", 0, 60);
  drawGauge(margin + cardWidth + margin, 100, cardWidth, cardHeight, humidity, "Humedad", "%", 0, 80);
  drawGauge(margin + 2 * (cardWidth + margin), 100, cardWidth, cardHeight, airQuality, "CO2 en el ambiente", " PPM", 0, 1000);
  
  // Segunda fila: 2 cartas
  drawCurrentBar(margin, 100 + cardHeight + margin, cardWidth, cardHeight, current, 0, 5);
  drawLightIndicator(margin + cardWidth + margin, 100 + cardHeight + margin, cardWidth, cardHeight, light);
  drawPresenceIndicator(margin + 2 * (cardWidth + margin), 100 + cardHeight + margin, cardWidth, cardHeight);
  
  drawDateTime();
  
  // Dibujar notificaciones
  drawNotifications();
}

void serialEvent(Serial myPort) {
  String data = myPort.readStringUntil('\n');
  if (data != null) {
    data = trim(data);
    sensorData = split(data, ',');
    
    // Asigna los valores a las variables
    if (sensorData.length == 6) {
      temperature = float(sensorData[0]);
      humidity = float(sensorData[1]);
      ultrasonic = float(sensorData[2]);
      light = float(sensorData[3]);
      airQuality = float(sensorData[4]);
      current = float(sensorData[5]);
      checkCriticalLevels();
    }
  }
}

void drawGauge(float x, float y, float w, float h, float value, String label, String unit, float minVal, float maxVal) {
  // Colores base
  color verde = color(0, 255, 0);    // Verde
  color amarillo = color(255, 180, 0); // Amarillo
  color rojo = color(255, 0, 0);     // Rojo
  
  color shadowColor = color(10, 15, 30);// Azul marino oscuro
   
   //Sombra
   fill(shadowColor);
  noStroke();
  rect(x + 3, y + 3, w, h, 30);

  // Fondo del gauge
  fill(cardColor);
  noStroke(); // Sin contorno para el rectángulo principal
  rect(x, y, w, h, 30);

  // Mapear el valor a un rango de 0 a 1 para la interpolación
  float t = map(value, minVal, maxVal, 0, 1);

  // Calcular el color gradual
  color colorGauge;
  if (t <= 0.5) {
    // Interpolar entre verde y amarillo
    colorGauge = lerpColor(verde, amarillo, t * 2);
  } else {
    // Interpolar entre amarillo y rojo
    colorGauge = lerpColor(amarillo, rojo, (t - 0.5) * 2);
  }

  // Contorno del gauge con color gradual
  stroke(colorGauge);
  strokeWeight(5);
  noFill();
  arc(x + w / 2, y + h / 2 + 40, w * 0.8, h * 0.8, -PI, 0);

  // Aguja del gauge
  float angle = map(value, minVal, maxVal, -PI, 0);
  stroke(primaryColor);
  strokeWeight(4);
  line(x + w / 2, y + h / 2 + 40, x + w / 2 + cos(angle) * w * 0.4, y + h / 2 + 40 + sin(angle) * w * 0.4);

  // Texto del gauge
  fill(textColor);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + 30);
  text(nf(value, 0, 1) + unit, x + w / 2, y + h - 30);
}

float animatedBrightness = 0;
void drawLightIndicator(float x, float y, float w, float h, float lightValue) {
  // Animación suave del brillo
  float targetBrightness = map(lightValue, 0, 1, 0, 255);
  animatedBrightness = lerp(animatedBrightness, targetBrightness, 0.1);
  
  color shadowColor = color(10, 15, 30);// Azul marino oscuro

   fill(shadowColor);
  noStroke();
  rect(x + 3, y + 3, w, h, 30); 

  // Fondo del gauge
  fill(cardColor);
  noStroke(); // Sin contorno para el rectángulo principal
  rect(x, y, w, h, 30);
  
  // Dibujar el círculo
  fill(animatedBrightness);
  noStroke();
  ellipse(x + w / 2, y + h / 2, w * 0.6, w * 0.6);
  
  // Configurar el estilo del texto
  fill(textColor);
  textSize(18);
  textAlign(CENTER, CENTER);
  
  // Dibujar el valor numérico de la luz (centrado dentro del círculo)
  text(nf(lightValue, 0, 1) + "",  x + w / 2, y + h - 30);
  
  // Dibujar el título (encima del círculo)
  textSize(20); // Tamaño más pequeño para el título
  textAlign(CENTER, BOTTOM); // Alinear al centro y en la parte inferior
  text("Nivel de Luz", x + w / 2, y + 40); // Posición encima del círculo
}


float animatedBarHeight = 0; // Variable para la animación de la altura
color currentBarColor = color(0, 255, 0); // Variable para el color actual de la barra
void drawCurrentBar(float x, float y, float w, float h, float value, float minVal, float maxVal) {
  // sombra de la caja
  color shadowColor = color(10, 15, 30); // Azul marino oscuro
  fill(shadowColor);
  noStroke();
  rect(x + 3, y + 3, w, h, 30); // Sombra desplazada 3 píxeles
  
  // caja principal
  fill(cardColor);
  noStroke();
  rect(x, y, w, h, 30); // Caja con bordes redondeados
  
  // ajustar el tamaño de la batería
  float batteryWidth = w * 0.4; 
  float batteryHeight = h * 0.50; 
  float batteryX = x + (w - batteryWidth) / 2; 
  float batteryY = y + (h - batteryHeight) / 2 + 10;
  
  // cuerpo de la batería
  fill(cardColor);
  
   // Color del borde
  strokeWeight(2); // Grosor del borde
    stroke(color(255,255,255));

  rect(batteryX, batteryY, batteryWidth, batteryHeight, 5); 
  
  // terminal de la batería 
  float terminalWidth = batteryWidth * 0.6; // Ancho del terminal
  float terminalHeight = batteryHeight * 0.1; // Alto del terminal
  fill(cardColor);
  stroke(color(255,255,255));
  strokeWeight(2);
  rect(batteryX + (batteryWidth - terminalWidth) / 2, batteryY - terminalHeight, terminalWidth, terminalHeight, 3); // Terminal
  
  //color dinámico de la barra (gradual)
  color targetBarColor;
  if (value <= 30) {
    targetBarColor = color(0, 255, 0); // Verde para valores altos
  } else if (value <= 50) {
    targetBarColor = color(255, 255, 0); // Amarillo para valores bajos
  } else {
    targetBarColor = color(255, 0, 0); // Rojo para valores muy bajos
  }
  
  // Interpolación suave del color
  currentBarColor = lerpColor(currentBarColor, targetBarColor, 0.1);
  
  // Animación suave de la altura de la barra
  float targetBarHeight = map(value, minVal, maxVal, 0, batteryHeight);
  animatedBarHeight = lerp(animatedBarHeight, targetBarHeight, 0.1);
  
  //  nivel de carga (barra de progreso)
  fill(currentBarColor);
  noStroke();
  rect(batteryX + 5, batteryY + batteryHeight - animatedBarHeight + 5, batteryWidth - 10, animatedBarHeight - 10, 3); // Barra con margen interno
  
  // barritas intermedias (niveles de consumo)
    stroke(color(220,220,220));
 // Color de las barritas
  strokeWeight(1); // Grosor de las barritas
  for (int i = 1; i < 4; i++) {
    float lineY = batteryY + batteryHeight - (i * batteryHeight / 4); // Posición de cada barrita
    line(batteryX + 5, lineY, batteryX + batteryWidth - 5, lineY); // Dibujar la barrita
  }
  
  // valor numérico (consumo)
  fill(textColor);
  textSize(18);
  textAlign(CENTER, CENTER);
  text(nf(value, 0, 1) + " A", x + w / 2, y + h - 30); // Consumo abajo
  
  // título (arriba)
  textSize(20);
  textAlign(CENTER, BOTTOM);
  text("Consumo eléctrico", x + w / 2, y + 40); // Título arriba
}

void drawPresenceIndicator(float x, float y, float w, float h) {
  color shadowColor = color(10, 15, 30); // Azul marino oscuro
  fill(shadowColor);
  noStroke();
  rect(x + 3, y + 3, w, h, 30); 

  fill(cardColor);
  noStroke();
  rect(x, y, w, h, 30); // Caja con bordes redondeados
  
  fill(textColor);
  textSize(20);
  textAlign(CENTER, TOP);
  text("Presencia", x + w / 2, y + 20);
  if (ultrasonic > 5) {
    tint(0, 255, 0);
  } else {
    tint(255,0,0);
  }
  image(personIcon, x + w / 2 - 70, y + 60, 150, 150);
}

void drawGradientBackground() {
  for (int i = 0; i <= height; i++) {
    float inter = map(i, 0, height, 0, 1);
    color c = lerpColor(bgColor1, bgColor2, inter);
    stroke(c);
    line(0, i, width, i);
  }
}

void drawTitle() {
  fill(textColor);
  textSize(32);
  textAlign(CENTER, TOP);
  text("Monitoreo del Data Center", width / 2, 20);
}

void drawDateTime() {
  fill(textColor);
  textSize(18);
  textAlign(CENTER, TOP);
  text(day() + "/" + month() + "/" + year() + " " + hour() + ":" + nf(minute(), 2) + ":" + nf(second(), 2), width /2, 60);
}

void checkCriticalLevels() {
  color notificationColor = color(255, 165, 0);
  if (temperature < 18 || temperature > 35) {
    addNotification("¡Temperatura crítica! " + nf(temperature, 0, 1) + "°C", notificationColor);
  }
  if (humidity < 20 || humidity > 60) {
    addNotification("¡Humedad crítica! " + nf(humidity, 0, 1) + "%", notificationColor);
  }
  if (airQuality > 800) {
    addNotification("¡Cantidad de CO2 crítica! " + nf(airQuality, 0, 1) + " PPM", notificationColor);
  }
  if(current < 0.01 || current > 0.15){
    addNotification("¡Consumo de energía crítica! " + nf(current, 0, 1) + " mAh", notificationColor);
  }
}

void addNotification(String message, color notificationColor) {
  notifications.add(new Notification(message, notificationColor));
}

void drawNotifications() {
  for (int i = notifications.size() - 1; i >= 0; i--) {
    Notification notification = notifications.get(i);
    notification.display(i);
    if (notification.isExpired()) {
      notifications.remove(i);
    }
  }
}

class Notification {
  String message;
  color notificationColor;
  int timer;
  float x, y;
  float targetX;
  boolean isClosing = false;

  Notification(String message, color notificationColor) {
    this.message = message;
    this.notificationColor = notificationColor;
    this.timer = millis();
    this.x = width; 
    this.targetX = width - 400; 
  }

  void display(int index) {
    x = lerp(x, targetX, 0.1);
    
  
    float notificationY = 20 + index * 60;

    fill(0, 50);
    noStroke();
    rect(x + 3, notificationY + 3, 380, 50, 10);

    fill(notificationColor);
    noStroke();
    rect(x, notificationY, 380, 50, 10);

    // Dibujar icono
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("⚠", x + 30, notificationY + 25);

    // Dibujar texto
    fill(textColor);
    textSize(18);
    textAlign(LEFT, CENTER);
    text(message, x + 20, notificationY + 25);

    // Botón de cerrar
    fill(255, 100);
    rect(x + 340, notificationY + 10, 30, 30, 5);
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("×", x + 355, notificationY + 25);

    // Verificar si se hace clic en el botón de cerrar
    if (mousePressed && mouseX > x + 340 && mouseX < x + 370 && mouseY > notificationY + 10 && mouseY < notificationY + 40) {
      isClosing = true;
      targetX = width; // Mover fuera de la pantalla
    }

    // Eliminar si está fuera de la pantalla
    if (isClosing && x > width - 10) {
      notifications.remove(this);
    }
  }

  boolean isExpired() {
    return millis() - timer > 3000; // Duración de 3 segundos
  }
}
