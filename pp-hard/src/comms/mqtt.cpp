#include "mqtt.hpp"

namespace comms {
    void serial_csv(int *sense_vals, size_t n) {
        Serial.print("[CSV]");
        for (int i = 0; i < n; ++i) {
            Serial.print(sense_vals[i], 1); Serial.print(",");
        }
        Serial.println();
    }
    

    static RTC_DATA_ATTR uint8_t cachedBSSID[6] = {0};
    static RTC_DATA_ATTR uint8_t cachedChannel = 0;

    MQTT::MQTT(): mqttClient(wifiClient) {instance = this;};
    
    MQTT* MQTT::instance = nullptr;

    void MQTT::mqtt_callback_static(char* topic, byte* payload, unsigned int length) {
        if (instance) instance->mqtt_callback(topic, payload, length);
    }

    void MQTT::wifi_on() {
        // Read cached channel and BSSID from RTC memory
        // RTC memory survives light sleep
        if (cachedChannel != 0) {
            // Fast reconnect using cached AP info — skips scanning
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD, cachedChannel, cachedBSSID, true);
        } else {
            // First boot — normal connect and cache the result
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        }

        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
            delay(50);
            attempts++;
        }

        if (WiFi.status() == WL_CONNECTED) {
            // Cache for next wake
            memcpy(cachedBSSID, WiFi.BSSID(), 6);
            cachedChannel = WiFi.channel();
            Serial.printf("[WiFi] Connected in %dms\n", attempts * 50);
        }
    }

    void MQTT::wifi_off() {
        WiFi.disconnect(false);  // false = don't erase credentials
        WiFi.setSleep(WIFI_PS_MAX_MODEM);
        delay(100); // Settle before ADC2 reads
        Serial.println("[WiFi] Off");
    }


    void MQTT::setup_connection() {
        wifi_on();
        mqtt_connect();
    }

    void MQTT::reconnect() {
        wifi_on();
        mqtt_reconnect();
        uint32_t loopStart = millis();
        while (millis() - loopStart < 300) {
            mqttClient.loop();
            delay(10);
        }
    }

    void MQTT::disconnect() {
        mqttClient.loop();
        enter_light_sleep();
    }



    void MQTT::mqtt_callback(char* topic, byte* payload, unsigned int length) {
        Serial.printf("[MQTT] Message on %s\n", topic);
        Serial.printf("[MQTT] Callback fired — topic: %s length: %d\n", topic, length);
        StaticJsonDocument<256> doc;
        DeserializationError err = deserializeJson(doc, payload, length);
        if (err) {
            Serial.printf("[MQTT] JSON parse error: %s\n", err.c_str());
            return;
        }

        bool changed = false;

        if (doc.containsKey("buzzLength")) {
            device_config.hapticBuzzLength = doc["buzzLength"].as<int>();
            Serial.printf("[Config] buzzLength → %d\n", device_config.hapticBuzzLength);
            changed = true;
        }
        if (doc.containsKey("buzzEffect")) {
            device_config.hapticEffect = doc["buzzEffect"].as<uint8_t>();
            Serial.printf("[Config] buzzEffect → %d\n", device_config.hapticEffect);
            changed = true;
        }
        if (doc.containsKey("threshold")) {
            device_config.postureThreshold = doc["threshold"].as<int>();
            Serial.printf("[Config] threshold → %d\n", device_config.postureThreshold);
            changed = true;
        }
        if (doc.containsKey("haptics")) {
            device_config.hapticsEnabled = doc["haptics"].as<bool>();
            Serial.printf("[Config] haptics → %s\n", device_config.hapticsEnabled ? "on" : "off");
            changed = true;
        }

        if (changed) preferences.save_settings();
    }

    bool MQTT::mqtt_reconnect() {
        if (mqttClient.connected()) return true;

        Serial.println("[MQTT] Reconnecting...");

        // Ensure WiFi is up first
        if (WiFi.status() != WL_CONNECTED) {
            wifi_on();
        }

        mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
        mqttClient.setCallback(mqtt_callback_static);
        mqttClient.setKeepAlive(15);
        mqttClient.setSocketTimeout(5);

        // Track whether this is the first ever connection
        // RTC_DATA_ATTR survives light sleep and deep sleep
        static RTC_DATA_ATTR bool firstBoot = true;

        int retries = 0;
        while (!mqttClient.connected() && retries < 3) {
            bool connected = mqttClient.connect(
                MQTT_CLIENT_ID,
                nullptr, nullptr,
                TOPIC_STATUS, 1, true, "offline",
                false   // cleanSession = false — persistent session
            );

            if (connected) {
                mqttClient.publish(TOPIC_STATUS, "online", true);

                // Only subscribe on first boot — broker remembers
                // the subscription for all future reconnects
                if (firstBoot) {
                    mqttClient.subscribe(TOPIC_CONFIG, 1); // QoS 1
                    Serial.println("[MQTT] Subscribed to config topic");
                    firstBoot = false;
                }

                Serial.println("[MQTT] Reconnected");
                return true;
            }

            Serial.printf("[MQTT] Failed rc=%d retry %d/3\n",
                        mqttClient.state(), retries + 1);
            delay(200);
            retries++;
        }
        return false;
    }

    bool MQTT::mqtt_connect() {
        mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
        mqttClient.setCallback(mqtt_callback_static);
        mqttClient.setKeepAlive(60);

        int retries = 0;
        while (!mqttClient.connected() && retries < MQTT_MAX_RETRIES) {
            Serial.printf("[MQTT] Connecting (attempt %d)...\n", retries + 1);

            bool connected = (strlen(MQTT_USER) > 0)
                ? mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS,
                                    TOPIC_STATUS, 1, true, "offline")
                : mqttClient.connect(MQTT_CLIENT_ID, nullptr, nullptr,
                                    TOPIC_STATUS, 1, true, "offline");

            if (connected) {
                Serial.println("[MQTT] Connected");
                mqttClient.subscribe(TOPIC_CONFIG, 1); // QoS 1
                mqttClient.publish(TOPIC_STATUS, "online", true); // retained
                return true;
            }

            Serial.printf("[MQTT] Failed, rc=%d. Retrying...\n", mqttClient.state());
            delay(500);
            retries++;
        }

        Serial.println("[MQTT] Could not connect to broker");
        return false;
    }

    void MQTT::publish_sensors(int *sensor_vals) {
        // {"sensors":{"GPIO32":1234,"GPIO33":2345,...},"timestamp":12345}
        StaticJsonDocument<512> doc;
        JsonObject sensors = doc.createNestedObject("sensors");

        for (int i = 0; i < ADC1_COUNT; i++) {
            char key[8];
            snprintf(key, sizeof(key), "GPIO%d", ADC1_PINS[i]);
            sensors[key] = sensor_vals[i];
        }
        for (int i = 0; i < ADC2_COUNT; i++) {
            char key[8];
            snprintf(key, sizeof(key), "GPIO%d", ADC2_PINS[i]);
            sensors[key] = sensor_vals[ADC1_COUNT + i];
        }
        doc["timestamp"] = millis();

        char buf[512];
        serializeJson(doc, buf);
        mqttClient.publish(TOPIC_SENSORS, buf, false);
        Serial.printf("[MQTT] Published sensors: %s\n", buf);
    }

    void MQTT::publish_posture(posture::PostureResult posture_res) {
        StaticJsonDocument<128> doc;
        doc["posture"]    = posture_res.label;
        doc["poor"]       = posture_res.is_poor;
        doc["timestamp"]  = millis();

        char buf[128];
        serializeJson(doc, buf);
        mqttClient.publish(TOPIC_POSTURE, buf, false);

        Serial.printf("[MQTT] Published posture: %s\n", buf);
    }

    void MQTT::send_data(int *sensor_values, posture::PostureResult posture_res) {
        if (!mqttClient.connected()) {
            Serial.println("[MQTT] Not connected — skipping publish");
            return;
        }

        publish_sensors(sensor_values);
        publish_posture(posture_res);

        // Give broker time to receive before sleeping
        mqttClient.loop();
        delay(100);
    }

    void MQTT::enter_light_sleep() {
        // Explicitly disconnect cleanly before sleeping
        mqttClient.disconnect();
        delay(20); // Let disconnect packet send
        Serial.println("[Sleep] Entering light sleep");
        Serial.flush();
        esp_sleep_enable_timer_wakeup(SLEEP_DURATION_US);
        esp_light_sleep_start();
        Serial.println("[Sleep] Woke up");
    }
}










