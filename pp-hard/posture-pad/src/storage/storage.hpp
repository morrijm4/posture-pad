#pragma once
#include <Preferences.h>
#include "constants.hpp"
#include "mbedtls/sha256.h"

namespace storage {
    class DevicePreferences {
        public:
            void load_settings();
            void save_settings();
        private:
            Preferences preferences;
            void getDeviceID(char *output);
    };
}