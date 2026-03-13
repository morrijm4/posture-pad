#include <Arduino.h>
#include "constants.hpp"
#include "posture/posture_model.hpp"
#include "comms/mqtt.hpp"
#include "haptics/haptics.hpp"
#include "sensors/sensors.hpp"
#include "storage/storage.hpp"

posture::SVM posture_model;
comms::MQTT posture_mqtt;
haptics::Haptics posture_haptics;
sensors::FSR fsr_sensors;
storage::DevicePreferences preferences;
DeviceConfig device_config;

void setup() {
    Serial.begin(115200);
    Serial.println("\n[Boot] Posture device starting...");

    preferences.load_settings();
    fsr_sensors.setup();
    posture_haptics.setup();
    
    if (device_config.mqttEnabled)
        posture_mqtt.setup_connection();

    Serial.println("[Boot] Ready");
}

void loop() {
    fsr_sensors.read_sensors();
    int fsr_readings[TOTAL_SENSORS];
    fsr_sensors.get_sensor_value(fsr_readings, TOTAL_SENSORS);

    posture::PostureResult posture_res = posture_model.eval(fsr_readings, TOTAL_SENSORS);
    
    if (posture_res.is_poor) {
        posture_haptics.buzz();
    }
    if (device_config.mqttEnabled) {
        posture_mqtt.reconnect();
        posture_mqtt.send_data(fsr_readings, posture_res);
        posture_mqtt.disconnect();
    } else {
        comms::serial_csv(fsr_readings, TOTAL_SENSORS);
        delay(500);
    }
}
