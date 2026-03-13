#include "haptics.hpp"

namespace haptics {
    void Haptics::setup() {
        Wire.begin(HAPTIC_SDA, HAPTIC_SCL);
        if (!drv.begin()) {
            Serial.println("[Haptics] DRV2605 not found");
            drvReady = false;
            return;
        }
        drv.selectLibrary(1);
        drv.setMode(DRV2605_MODE_INTTRIG);
        drvReady = true;
        Serial.println("[Haptics] DRV2605 ready");
    }

    void Haptics::buzz() {
        if (!device_config.hapticsEnabled || !drvReady) return;
        drv.setWaveform(0, device_config.hapticEffect);
        drv.setWaveform(1, 0);
        drv.go();
        delay(device_config.hapticBuzzLength);
        drv.stop();
    }
}