#pragma once

#include <FastLED.h>

#define LED_PIN     13
#define NUM_LEDS    25
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB
#define BRIGHTNESS  96

extern CRGB leds[NUM_LEDS];

void addTransition(float delta);
void setTransition(float value);
void updateTransition();
void renderGrid();