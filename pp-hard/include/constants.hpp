#pragma once
#include<Arduino.h>

struct DeviceConfig {
    uint16_t hapticBuzzLength = 500;
    uint8_t hapticEffect = 1;
    uint16_t postureThreshold = 2000;
    bool hapticsEnabled = true;
    bool mqttEnabled = true;
};
extern DeviceConfig device_config;

// MQTT Topics
static constexpr char TOPIC_SENSORS[] = "posture/sensors";
static constexpr char TOPIC_POSTURE[] = "posture/predicted";
static constexpr char TOPIC_STATUS[]  = "posture/status";
static constexpr char TOPIC_CONFIG[]  = "posture/config";

// ADC Pins
static constexpr int ADC1_PINS[]  = { 32, 33, 34, 35, 36, 39 };
static constexpr int ADC1_COUNT   = 6;
static constexpr int ADC2_PINS[]  = { 25, 26, 27, 14};
static constexpr int ADC2_COUNT   = 4;
static constexpr int TOTAL_SENSORS = ADC1_COUNT + ADC2_COUNT;
static constexpr float ADC_MAX = 4095.0;

// Device Sleep Period
static constexpr uint64_t SLEEP_DURATION_US = 5000000ULL;

enum PostureClass {
    POSTURE_GOOD    = 0,
    POSTURE_SLOUCH  = 1,
    POSTURE_LEAN_L  = 2,
    POSTURE_LEAN_R  = 3,
    POSTURE_MEGA_SLOUCH = 4,
    POSTURE_UNKNOWN = -1
};