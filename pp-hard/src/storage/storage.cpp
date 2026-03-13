#include "storage.hpp"

namespace storage {
    void DevicePreferences::load_settings() {
        preferences.begin("posture", true);
        device_config.hapticBuzzLength = preferences.getUInt("buzzLength",  500);
        device_config.hapticEffect     = preferences.getUInt("buzzEffect",  1);
        device_config.postureThreshold = preferences.getUInt("threshold",   2000);
        device_config.hapticsEnabled   = preferences.getBool("haptics",    true);
        device_config.mqttEnabled   = preferences.getBool("mqtt",    false);
        preferences.end();
        Serial.println("[NVS] Settings loaded");
    }

    void DevicePreferences::save_settings() {
        preferences.begin("posture", false);
        preferences.putInt("buzzLength", device_config.hapticBuzzLength);
        preferences.putInt("buzzEffect", device_config.hapticEffect);
        preferences.putInt("threshold", device_config.postureThreshold);
        preferences.putBool("haptics", device_config.hapticsEnabled);
        preferences.putBool("mqtt", device_config.mqttEnabled);
        preferences.end();

        Serial.println("[NVS] Settings saved");
    }
}