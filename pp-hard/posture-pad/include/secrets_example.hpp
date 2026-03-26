/**
 * REPLACE THE NAME OF THIS FILE WITH secrets.hpp and fill in all of the ask fields
 */

#pragma once
#include <Arduino.h>


static constexpr char WIFI_SSID[]     = "RedRover";
static constexpr char WIFI_PASSWORD[] = "";

static constexpr char MQTT_BROKER[]   = "pp.mattymo.dev";
static constexpr uint16_t MQTT_PORT   = 8883;

static constexpr char MQTT_USER[]     = "ask_thomichel_or_mattymo";
static constexpr char MQTT_PASS[]     = "ask_thomichel_or_mattymo";

static const char *ROOT_CA PROGMEM = R"EOF(-----BEGIN CERTIFICATE-----
ask_thomichel_or_mattymo
-----END CERTIFICATE-----)EOF";
