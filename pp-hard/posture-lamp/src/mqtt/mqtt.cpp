#include "mqtt.hpp"
#include "led/led.hpp"
#include "secrets.hpp"

#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

static WiFiClientSecure espClient;
PubSubClient client(espClient);

static BearSSL::X509List cert(ROOT_CA);

// -----------------------------------------------
// Callback
// -----------------------------------------------
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  char message[length + 1];
  for (unsigned int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
  }
  message[length] = '\0';

  Serial.print("[MQTT] Topic: ");
  Serial.println(topic);
  Serial.print("[MQTT] Payload: ");
  Serial.println(message);

  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.print("[MQTT] JSON parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  if (!doc.containsKey("posture")) {
    Serial.println("[MQTT] No 'posture' field found");
    return;
  }

  const char* posture = doc["posture"];
  if (posture == nullptr) {
    Serial.println("[MQTT] posture field is null");
    return;
  }

  if (strcmp(posture, "good") == 0) {
    addTransition(-0.20f);
    Serial.println("[LED] posture=good_posture -> slightly toward natural");
  }
  else if (strcmp(posture, "slouching") == 0) {
    addTransition(+0.10f);
    Serial.println("[LED] posture=slouching -> shifting toward alert");
  }
  else if (strcmp(posture, "leaning_left") == 0 || strcmp(posture, "leaning_right") == 0) {
    addTransition(+0.10f);
    Serial.println("[LED] posture=left/right -> more alert");
  }
  else if (strcmp(posture, "mega_slouching") == 0) {
    addTransition(+0.35f);
    Serial.println("[LED] posture=mega_slouching -> strongly alert");
  }
  else {
    addTransition(-0.05f);
    Serial.print("[LED] Unknown posture: ");
    Serial.println(posture);
  }
}

// -----------------------------------------------
// Wi-Fi
// -----------------------------------------------
void connectWiFi() {
  Serial.println();
  Serial.print("[WIFI] Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("[WIFI] Connected");
  Serial.print("[WIFI] IP address: ");
  Serial.println(WiFi.localIP());
}

// -----------------------------------------------
// MQTT connect/reconnect
// -----------------------------------------------
void connectMQTT() {
  while (!client.connected()) {
    Serial.print("[MQTT] Connecting...");

    bool ok;
    if (MQTT_USER[0] == '\0') {
      ok = client.connect(MQTT_CLIENT_ID);
    } else {
      ok = client.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS);
    }

    if (ok) {
      Serial.println("connected");

      bool subOk = client.subscribe(MQTT_SUB_TOPIC);
      if (subOk) {
        Serial.print("[MQTT] Subscribed to: ");
        Serial.println(MQTT_SUB_TOPIC);
      } else {
        Serial.println("[MQTT] Subscribe failed");
      }
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 3 seconds...");
      delay(3000);
    }
  }
}

// -----------------------------------------------
// One-time TLS + broker setup (call from setup())
// -----------------------------------------------
void initMQTT() {
  espClient.setTrustAnchors(&cert);

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Syncing time");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("\nTime synced!");

  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(mqttCallback);
}