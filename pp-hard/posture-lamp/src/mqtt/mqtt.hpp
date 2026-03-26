#pragma once

#include <PubSubClient.h>

void connectWiFi();
void connectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void initMQTT();

extern PubSubClient client;