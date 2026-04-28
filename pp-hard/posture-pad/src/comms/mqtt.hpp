#pragma once
#include "Arduino.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "secrets.hpp"
#include "esp_sleep.h"
#include "constants.hpp"
#include "storage/storage.hpp"
#include "posture/posture_model.hpp"
#include "time.h"
#include "esp_wifi.h"

namespace comms {
    void serial_csv(float *sense_vals, size_t n);
    
    class MQTT {
        public:
            MQTT();
            void setup_connection();
            void send_data(float *sensor_values, posture::PostureResult posture_res);
            void reconnect();
            void disconnect();
            void enter_light_sleep();
            void sync_time();

        private:
            static MQTT* instance;
            char posture_topic[96] = "";
            char config_topic[96] = "";
            char weights_topic[96] = "";
            int MQTT_MAX_RETRIES = 3;
            // WiFiClient wifiClient;
            WiFiClientSecure wifiClient;
            PubSubClient mqttClient;
            storage::DevicePreferences preferences;
            bool mqtt_reconnect();
            bool mqtt_connect();
            void mqtt_callback(char* topic, byte* payload, unsigned int length);
            static void mqtt_callback_static(char* topic, byte* payload, unsigned int length);
            void publish_posture(posture::PostureResult posture_res, float *sensor_vals);
            void wifi_on();
            void wifi_off();

    };
}