#pragma once
#include <Arduino.h>
#include "constants.hpp"

namespace sensors {
    class FSR {
        static constexpr int NUM_SAMPLES = 10;
        public:
            void setup();
            void read_sensors();
            void get_sensor_value(int* buffer, size_t size);
        private:
            int sensorValues[TOTAL_SENSORS];
    };
}