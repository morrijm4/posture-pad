#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "led/led.hpp"
#include "mqtt/mqtt.hpp"

static uint32_t lastFrameMs = 0;
static const uint16_t frameIntervalMs = 20;  // ~50 FPS

void setup() {
  Serial.begin(115200);
  delay(500);

  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear(true);
  setTransition(0);

  connectWiFi();
  initMQTT();
  client.setBufferSize(512);
}

void loop() {
  uint32_t now = millis();

  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (!client.connected())           connectMQTT();

  if (now - lastFrameMs >= frameIntervalMs) {
    lastFrameMs = now;
    renderGrid();
  }

  client.loop();
  updateTransition();
}