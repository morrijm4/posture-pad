#include "sensors.hpp"

namespace sensors {
    void FSR::setup() {
        analogReadResolution(12);
    }
    
    void FSR::read_sensors() {
        Serial.println("[Sensors] Reading...");
        int sense_total;
        for (int i = 0; i < ADC1_COUNT; i++) {
            sense_total = 0;
            for (int j = 0; j < NUM_SAMPLES; ++j) {
                sense_total += analogRead(ADC1_PINS[i]);
            }
            sensorValues[i] = sense_total/NUM_SAMPLES;
            Serial.printf("  ADC1 GPIO%d: %d\n", ADC1_PINS[i], sensorValues[i]);
        }

        for (int i = 0; i < ADC2_COUNT; i++) {
            sense_total = 0;
            for (int j = 0; j < NUM_SAMPLES; ++j) {
                sense_total += analogRead(ADC2_PINS[i]);
            }
            sensorValues[ADC1_COUNT + i] = sense_total/NUM_SAMPLES;
            Serial.printf("  ADC2 GPIO%d: %d\n", ADC2_PINS[i], sensorValues[ADC1_COUNT + i]);
        }

        Serial.println("[Sensors] Done");
    }

    void FSR::get_sensor_value(int* buffer, size_t size) {
        for (size_t i = 0; i < size; ++i) {
            buffer[i] = sensorValues[i];
        }
    }
}
