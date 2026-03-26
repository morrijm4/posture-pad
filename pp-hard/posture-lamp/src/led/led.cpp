#include "led.hpp"

CRGB leds[NUM_LEDS];

static float moodMix       = 0.0f;
static float targetMoodMix = 0.0f;

static const uint8_t gridToIndex[5][5] = {
  {4,5,14,15,24},
  {3,6,13,16,23},
  {2,7,12,17,22},
  {1,8,11,18,21},
  {0,9,10,19,20},
};

// -----------------------------------------------
// Helpers
// -----------------------------------------------
static float clamp01(float x) {
  if (x < 0.0f) return 0.0f;
  if (x > 1.0f) return 1.0f;
  return x;
}

static CRGB lerpColor(const CRGB& a, const CRGB& b, float t) {
  t = clamp01(t);
  uint8_t r  = a.r + (int)((b.r - a.r) * t);
  uint8_t g  = a.g + (int)((b.g - a.g) * t);
  uint8_t bl = a.b + (int)((b.b - a.b) * t);
  return CRGB(r, g, bl);
}

// -----------------------------------------------
// Color generators
// -----------------------------------------------
static CRGB naturalColorAt(uint8_t row, uint8_t col, uint32_t ms) {
  uint8_t t1 = (ms / 14);
  uint8_t t2 = (ms / 21);
  uint8_t t3 = (ms / 17);

  uint8_t waveA = sin8(t1 + row * 40 + col * 25);
  uint8_t waveB = sin8(t2 + row * 30 - col * 35 + 64);
  uint8_t waveC = sin8(t3 + row * 50 + col * 10 + 128);

  uint8_t blue  = scale8(waveA, 180) + 30;
  uint8_t green = scale8(waveB, 130) + 10;
  uint8_t red   = scale8(waveC, 25);

  CRGB c(red, green, blue);
  c.nscale8_video(220);
  return c;
}

static CRGB alertColorAt(uint8_t row, uint8_t col, uint32_t ms) {
  uint8_t t1 = (ms / 18);
  uint8_t t2 = (ms / 24);

  uint8_t glow1 = sin8(t1 + row * 35 + col * 20);
  uint8_t glow2 = sin8(t2 + row * 18 - col * 28 + 90);

  uint8_t red   = scale8(glow1, 160) + 50;
  uint8_t green = scale8(glow2, 70);
  uint8_t blue  = scale8(glow2, 8);

  CRGB c(red, green / 2, blue);
  c.nscale8_video(180);
  return c;
}

// -----------------------------------------------
// Public API
// -----------------------------------------------
void addTransition(float delta) {
  targetMoodMix = clamp01(targetMoodMix + delta);
}

void setTransition(float value) {
  targetMoodMix = clamp01(value);
}

void updateTransition() {
  const float followRate = 0.00004f;

  float error = targetMoodMix - moodMix;
  moodMix += error * followRate;

  if (fabs(error) < 0.001f) {
    moodMix = targetMoodMix;
  }
}

void renderGrid() {
  uint32_t ms = millis();

  for (uint8_t row = 0; row < 5; row++) {
    for (uint8_t col = 0; col < 5; col++) {
      uint8_t idx = gridToIndex[row][col];

      CRGB natural = naturalColorAt(row, col, ms);
      CRGB alert   = alertColorAt(row, col, ms);

      leds[idx] = lerpColor(natural, alert, moodMix);
    }
  }

  FastLED.show();
}