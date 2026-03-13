#pragma once
#include <Wire.h>
#include "Adafruit_DRV2605.h"
#include "constants.hpp"

namespace haptics {
    class Haptics {
        public:
            void setup();
            void buzz();
        private:
            int HAPTIC_SDA = 21;
            int HAPTIC_SCL = 22;
            Adafruit_DRV2605 drv;
            bool drvReady = false;
    };
}