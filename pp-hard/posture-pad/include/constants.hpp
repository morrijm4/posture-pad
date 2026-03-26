#pragma once
#include<Arduino.h>

struct DeviceConfig {
    uint16_t hapticBuzzLength = 2000;
    uint8_t hapticEffect = 82;
    uint64_t sleep_duration_us = 1000000ULL;
    int32_t gmtOffset_sec = 0;
    int16_t daylight_savings_offset = 0;
    char device_id[65] = {};
    bool hapticsEnabled = true;
    bool mqttEnabled = true;
};
extern DeviceConfig device_config;


// MQTT Topics
static constexpr char TOPIC_ROOT[] = "devices";
static constexpr char TOPIC_POSTURE[] = "posture";
static constexpr char TOPIC_CONFIG[]  = "config";

// ADC Pins
static constexpr int ADC1_PINS[]  = { 32, 33, 34, 35, 36, 39 };
static constexpr int ADC1_COUNT   = 6;
static constexpr int ADC2_PINS[]  = {};
static constexpr int ADC2_COUNT   = 0;
static constexpr int TOTAL_SENSORS = ADC1_COUNT + ADC2_COUNT;
static constexpr float ADC_MAX = 4095.0;

// NTP Server
static constexpr char NTP_SERVER1[] = "pool.ntp.org";
static constexpr char NTP_SERVER2[] = "time.nist.gov";

// Device Sleep Period
static constexpr int POSTURE_PER = 12 * 5; // keep track of the last 12 readings (at 7s intervals (1 min))
static constexpr int POSTURE_THRESH = 7 * 5; // alert if 7 or more of past 12 are poor

enum PostureClass {
    POSTURE_GOOD    = 0,
    POSTURE_SLOUCH  = 1,
    POSTURE_LEAN_L  = 2,
    POSTURE_LEAN_R  = 3,
    POSTURE_MEGA_SLOUCH = 4,
    NO_SEATED = 5,
    POSTURE_UNKNOWN = -1
};