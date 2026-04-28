#include "mqtt.hpp"

namespace comms {
    void serial_csv(float *sense_vals, size_t n) {
        Serial.print("[CSV]");
        for (int i = 0; i < n; ++i) {
            // Serial.print(sense_vals[i], 1); 
            // Serial.print(",");
            Serial.printf("%f,", sense_vals[i]);
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
        esp_wifi_start();
        WiFi.mode(WIFI_STA);
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
        WiFi.disconnect(true, false);  // false = don't erase credentials
        WiFi.mode(WIFI_OFF);
        esp_wifi_stop();
        delay(50); // Settle before ADC2 reads
        Serial.println("[WiFi] Off");
    }


    void MQTT::setup_connection() {
        mqttClient.setBufferSize(2048);
        sprintf(posture_topic, "%s/%s/%s", TOPIC_ROOT, device_config.device_id, TOPIC_POSTURE);
        sprintf(config_topic, "%s/%s/%s", TOPIC_ROOT, device_config.device_id, TOPIC_CONFIG);
        wifi_on();
        sync_time();
        wifiClient.setCACert(ROOT_CA);
        delay(1000);
        mqtt_reconnect();
        uint32_t loopStart = millis();
        while (millis() - loopStart < 300) {
            mqttClient.loop();
            delay(10);
        }
        esp_wifi_set_ps(WIFI_PS_MIN_MODEM);
    }

    void MQTT::reconnect() {
        mqtt_reconnect();
        uint32_t loopStart = millis();
        while (millis() - loopStart < 300) {
            mqttClient.loop();
            delay(10);
        }
    }

    void MQTT::disconnect() {
        mqttClient.disconnect();
        delay(20); // Let disconnect packet send
        wifi_off();
    }

    void MQTT::sync_time() {
        configTime(device_config.gmtOffset_sec, device_config.daylight_savings_offset, NTP_SERVER1, NTP_SERVER2);
        time_t now = time(nullptr);
        while (now < 1700000000) {
            delay(500);
            now = time(nullptr);
        }
        Serial.printf("[TIME] synced time: %d\n", now);
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

        mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
        mqttClient.setCallback(mqtt_callback_static);
        mqttClient.setKeepAlive(60);
        mqttClient.setSocketTimeout(15);

        // Track whether this is the first ever connection
        // RTC_DATA_ATTR survives light sleep and deep sleep
        static RTC_DATA_ATTR bool firstBoot = true;

        int retries = 0;
        while (!mqttClient.connected() && retries < 3) {
            bool connected = mqttClient.connect(device_config.device_id, MQTT_USER, MQTT_PASS);

            if (connected) {
                // Only subscribe on first boot — broker remembers
                // the subscription for all future reconnects
                if (firstBoot) {
                    mqttClient.subscribe(config_topic, 1); // QoS 1
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

    void MQTT::publish_posture(posture::PostureResult posture_res, float *sensor_vals) {
        StaticJsonDocument<512> doc;
        JsonObject sensors = doc.createNestedObject("sensors");

        for (int i = 0; i < ADC1_COUNT; i++) {
            char key[8];
            snprintf(key, sizeof(key), "GPIO%d", ADC1_PINS[i]);
            sensors[key] = sensor_vals[i];
        }

        for (int i = 0; i < SPI_ADC_COUNT; i++) {
            char key[8];
            snprintf(key, sizeof(key), "GPIO%d", SPI_ADC_PINS[i]);
            sensors[key] = sensor_vals[ADC1_COUNT + i];
        }

        time_t unix_time_s;
        time(&unix_time_s);
        doc["posture"] = posture_res.label;
        doc["timestamp"] = unix_time_s;

        char buf[512];
        size_t len = serializeJson(doc, buf, sizeof(buf));

        Serial.printf("[MQTT] JSON length: %u\n", (unsigned)len);

        bool ok = mqttClient.publish(posture_topic, buf, false);
        Serial.printf("[MQTT] Publish %s: %s\n", ok ? "OK" : "FAILED", buf);
    }

    void MQTT::send_data(float *sensor_values, posture::PostureResult posture_res) {
        if (!mqttClient.connected()) {
            Serial.println("[MQTT] Not connected — attempting reconnect...");
            reconnect();
        }

        publish_posture(posture_res, sensor_values);

        // Give broker time to receive before sleeping
        mqttClient.loop();
        delay(100);
    }

    void MQTT::enter_light_sleep() {
        Serial.println("[Sleep] Entering light sleep");
        Serial.flush();
        esp_sleep_enable_timer_wakeup(device_config.sleep_duration_us);
        esp_light_sleep_start();
        Serial.println("[Sleep] Woke up");
    }
}
