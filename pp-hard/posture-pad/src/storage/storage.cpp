#include "storage.hpp"

namespace storage {
    void DevicePreferences::load_settings() {
        preferences.begin("posture", true);
        device_config.hapticBuzzLength = preferences.getUInt("buzzLength",  device_config.hapticBuzzLength);
        device_config.hapticEffect = preferences.getUInt("buzzEffect",  device_config.hapticEffect);
        // device_config.hapticsEnabled = preferences.getBool("haptics",    device_config.hapticsEnabled);
        device_config.sleep_duration_us = preferences.getULong64("sleep_len", device_config.sleep_duration_us);
        device_config.gmtOffset_sec = preferences.getLong("gmt_ofst", device_config.gmtOffset_sec);
        device_config.daylight_savings_offset = preferences.getInt("dylgt_ofst", device_config.daylight_savings_offset);
        getDeviceID(device_config.device_id);
        preferences.end();
        Serial.println("[NVS] Settings loaded");
    }

    void DevicePreferences::save_settings() {
        preferences.begin("posture", false);
        if (preferences.getUInt("buzzLength",  device_config.hapticBuzzLength) != device_config.hapticBuzzLength)
            preferences.putUInt("buzzLength", device_config.hapticBuzzLength);
        if (preferences.getUInt("buzzEffect",  device_config.hapticEffect) != device_config.hapticEffect)
            preferences.putUInt("buzzEffect", device_config.hapticEffect);
        if (preferences.getBool("haptics",    device_config.hapticsEnabled) != device_config.hapticsEnabled)
            preferences.putBool("haptics", device_config.hapticsEnabled);
        if (preferences.getULong64("sleep_len", device_config.sleep_duration_us) != device_config.sleep_duration_us)
            preferences.putULong64("sleep_len", device_config.sleep_duration_us);
        if (preferences.getLong("gmt_ofst", device_config.gmtOffset_sec) != device_config.gmtOffset_sec)
            preferences.putLong("gmt_ofst", device_config.gmtOffset_sec);
        if (preferences.getInt("dylgt_ofst", device_config.daylight_savings_offset) != device_config.daylight_savings_offset)
            preferences.putInt("dylgt_ofst", device_config.daylight_savings_offset);          
        preferences.end();

        Serial.println("[NVS] Settings saved");
    }

    void DevicePreferences::getDeviceID(char *output) {
        uint64_t chipid = ESP.getEfuseMac();

        uint8_t data[8];
        for (int i = 0; i < 8; i++) {
            data[7 - i] = (chipid >> (8 * i)) & 0xFF;
        }

        uint8_t hash[32];
        mbedtls_sha256(data, 8, hash, 0);

        for (int i = 0; i < 32; i++) {
            sprintf(output + (i * 2), "%02x", hash[i]);
        }
    }
}