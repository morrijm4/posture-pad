#include "posture_model.hpp"

namespace posture {
    SVM::SVM(): posture_count(0), buffer(0), count(0) {}

    void SVM::poly_expand(float* raw, float* out) {
        int idx = 0;
        out[idx++] = 1.0f;                        // 1 bias term

        for (int i = 0; i < N_RAW; i++)
            out[idx++] = raw[i];                  // 12 linear terms

        for (int i = 0; i < N_RAW; i++)
            for (int j = i; j < N_RAW; j++)
                out[idx++] = raw[i] * raw[j];       // degree-2 terms
    }
    
    int SVM::predict(float *x) {
        float features[91];
        poly_expand(x, features);
        float scores[N_CLASSES];
        for (int c = 0; c < N_CLASSES; c++) {
            float sum = intercept[c];
            for (int j = 0; j < N_POLY; j++)
                sum += coef[c][j] * features[j];
            scores[c] = sum;
        }
        int best = 0;
        for (int c = 1; c < N_CLASSES; c++)
            if (scores[c] > scores[best]) best = c;
        return best;
    }

    PostureResult SVM::eval(float *pos_vals, int n) {
        int pred = predict(pos_vals);
        const char* label = posture_label(pred);
        bool is_poor = posture_is_poor(pred);
        Serial.printf("[Posture] Prediction %d=%s\n", pred, label);
        return {pred,label,is_poor};
    }

    const char* SVM::posture_label(int cls) {
        switch (cls) {
            case POSTURE_GOOD:   return "good";
            case POSTURE_SLOUCH: return "slouching";
            case POSTURE_LEAN_L: return "leaning_left";
            case POSTURE_LEAN_R: return "leaning_right";
            case POSTURE_MEGA_SLOUCH: return "mega_slouching";
            case NO_SEATED: return "no_seated";
            default:             return "unknown";
        }
    }

    bool SVM::posture_is_poor(int cls) {
        bool poor = cls != POSTURE_GOOD && cls != NO_SEATED;
        uint64_t outgoing = (buffer >> POSTURE_PER) & 1;  
        buffer = (buffer << 1) | (poor & 1);
        count += poor;
        count -= outgoing;
        if (count > POSTURE_THRESH && poor && cls != POSTURE_UNKNOWN) {
            Serial.println("[Posture] Continual bad posture detected");
            count = 0;
            buffer = 0;
            return true;
        }
        return false;
    }
}