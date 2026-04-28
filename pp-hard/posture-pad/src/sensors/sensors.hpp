#pragma once
#include <Arduino.h>
#include <MCP3XXX.h>
#include "constants.hpp"

namespace sensors {
    class FSR {
        static constexpr float NUM_SAMPLES = 10.0;
        public:
            void setup();
            void read_sensors();
            void get_sensor_value(float* buffer, size_t size);
        private:
            float sensorValues[TOTAL_SENSORS];
            MCP3008 spi_adc;
    };
}