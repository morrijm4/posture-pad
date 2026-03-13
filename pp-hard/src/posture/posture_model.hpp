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
            int predict(float *x);
            PostureResult eval(int *pos_vals, int n);

        protected:
            float compute_kernel(float *x, ...);
            const char* posture_label(int cls);
            bool posture_is_poor(int cls);
    };
}