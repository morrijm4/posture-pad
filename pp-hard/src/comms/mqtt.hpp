#pragma once
#include "Arduino.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "secrets.hpp"
#include "esp_sleep.h"
#include "constants.hpp"
#include "storage/storage.hpp"
#include "posture/posture_model.hpp"

namespace comms {
    void serial_csv(int *sense_vals, size_t n);
    
    class MQTT {
        public:
            MQTT();
            void setup_connection();
            void send_data(int *sensor_values, posture::PostureResult posture_res);
            void reconnect();
            void disconnect();

        private:
            static MQTT* instance;
            int MQTT_MAX_RETRIES = 3;
            WiFiClient wifiClient;
            PubSubClient mqttClient;
            storage::DevicePreferences preferences;
            bool mqtt_reconnect();
            bool mqtt_connect();
            void enter_light_sleep();
            void mqtt_callback(char* topic, byte* payload, unsigned int length);
            static void mqtt_callback_static(char* topic, byte* payload, unsigned int length);
            void publish_sensors(int *sensor_vals);
            void publish_posture(posture::PostureResult posture_res);
            void wifi_on();
            void wifi_off();

    };
}