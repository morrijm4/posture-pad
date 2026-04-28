#include "sensors.hpp"

namespace sensors {
    void FSR::setup() {
        analogReadResolution(12);
        spi_adc.begin();
    }
    
    void FSR::read_sensors() {
        Serial.println("[Sensors] Reading...");
        float sense_total;
        for (int i = 0; i < ADC1_COUNT; i++) {
            sense_total = 0;
            for (int j = 0; j < NUM_SAMPLES; ++j) {
                sense_total += analogRead(ADC1_PINS[i]);
            }
            sensorValues[i] = (sense_total/NUM_SAMPLES)/ADC1_MAX;
            Serial.printf("  ADC1 GPIO%d: %f\n", ADC1_PINS[i], sensorValues[i]);
        }

        for (int i = 0; i < SPI_ADC_COUNT; i++) {
            sense_total = 0;
            for (int j = 0; j < NUM_SAMPLES; ++j) {
                sense_total += spi_adc.analogRead(SPI_ADC_PINS[i]);
            }
            sensorValues[ADC1_COUNT + i] = (sense_total/NUM_SAMPLES)/SPI_ADC_MAX;
            Serial.printf("  SPI ADC PIN%d: %f\n", SPI_ADC_PINS[i], sensorValues[ADC1_COUNT + i]);
        }

        Serial.println("[Sensors] Done");
    }

    void FSR::get_sensor_value(float* buffer, size_t size) {
        for (size_t i = 0; i < size; ++i) {
            buffer[i] = sensorValues[i];
        }
    }
}
