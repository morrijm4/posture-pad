#pragma once
#include <cstdarg>
#include <Arduino.h>
#include <constants.hpp>

namespace posture {
    struct PostureResult {
        int id;
        const char* label;
        bool is_poor;
    };

    class SVM {
        public:
            SVM();
            int predict(float *x);
            PostureResult eval(float *pos_vals, int n);

        protected:
            const char* posture_label(int cls);
            bool posture_is_poor(int cls);
            uint8_t posture_count;
            void poly_expand(float* raw, float* out);

        private:
            uint64_t buffer;
            uint64_t count;
    };
}