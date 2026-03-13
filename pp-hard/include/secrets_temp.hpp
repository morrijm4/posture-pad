#pragma once
#include <Arduino.h>

static constexpr char WIFI_SSID[]     = "WIFI-SSID";
static constexpr char WIFI_PASSWORD[] = "WIFI-PASS";

static constexpr char MQTT_BROKER[]   = "192.168.137.1";
static constexpr uint16_t MQTT_PORT   = 8883;

static constexpr char MQTT_CLIENT_ID[] = "posture_device";
static constexpr char MQTT_USER[]     = "";
static constexpr char MQTT_PASS[]     = "";