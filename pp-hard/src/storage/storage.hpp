#pragma once
#include <Preferences.h>
#include "constants.hpp"

namespace storage {
    class DevicePreferences {
        public:
            void load_settings();
            void save_settings();
        private:
            Preferences preferences;
    };
}