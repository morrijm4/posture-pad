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
        // drv.setMode(DRV2605_MODE_INTTRIG);
        drv.setMode(DRV2605_MODE_REALTIME);
        drvReady = true;
        Serial.println("[Haptics] DRV2605 ready");
    }

    void Haptics::buzz() {
        if (!device_config.hapticsEnabled || !drvReady) return;
        // switch(device_config.hapticEffect) {
        //     case 82:
        //         Serial.println("HAPTICING");
        //         drv.setWaveform(0, 88);
        //         drv.setWaveform(1, 76);
        //         drv.setWaveform(2, 0);
        //         break;
        //     default:
        //         drv.setWaveform(0, 88);
        //         drv.setWaveform(1, 76);
        //         drv.setWaveform(2, 0);
        //         break;
        // }
        // drv.go();

        int steps = 50;              // number of steps up (and down)
        int maxVal = 88;           // max amplitude
        int delayTime = 1000 / (steps * 2); // total 1 second (up + down)

        // Ramp up
        for (int i = 0; i <= steps; i++) {
            int val = map(i, 0, steps, 0, maxVal);
            drv.setRealtimeValue(val);
            delay(delayTime);
        }
        delay(250);
        // Ramp down
        for (int i = steps; i >= 0; i--) {
            int val = map(i, 0, steps, 0, maxVal);
            drv.setRealtimeValue(val);
            delay(delayTime);
        }


        // delay(2000);
    }
}