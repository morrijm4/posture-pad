import pandas as pd
from sklearn.preprocessing import PolynomialFeatures
from sklearn.svm import LinearSVC
from sklearn.metrics import confusion_matrix
import numpy as np
import struct

# This should be set to true when this runs as an executable in the server
SERVER_MODE = True
DATA_DIR = './posture_data'
TESTING_DIR = './test_data' # only needed for nonserver use testing

def load_csv_data(file_list, directory):
    X_list = []
    y_list = []

    for i, file in enumerate(file_list):
        data = pd.read_csv(f"./{directory}/{file}", header=None)

        X = data
        cls = np.ones(shape=(data.shape[0]), dtype=int)
        cls *= i
        y = pd.DataFrame(cls)

        X_list.append(X)
        y_list.append(y)
    X_combined = pd.concat(X_list, ignore_index=True)
    y_combined = pd.concat(y_list, ignore_index=True)

    
    x = X_combined.to_numpy(dtype=np.float32)
    y = y_combined.to_numpy()
    y = y.squeeze()

    return x, y

def export_weights_c_code(coef, inter, poly):
    with open("model_weights.h", "w") as f:
        f.write(f"static constexpr int N_RAW     = {poly.n_features_in_};\n")
        f.write(f"static constexpr int N_POLY    = {poly.n_output_features_};\n")
        f.write(f"static constexpr int N_CLASSES = {coef.shape[0]};\n\n")

        f.write("static constexpr float coef[N_CLASSES][N_POLY] = {\n")
        for row in coef:
            vals = ", ".join(f"{v:.8f}f" for v in row)
            f.write(f"  {{{vals}}},\n")
        f.write("};\n\n")

        vals = ", ".join(f"{v:.8f}f" for v in inter)
        f.write(f"static constexpr float intercept[N_CLASSES] = {{{vals}}};\n")

def export_weights_bin(coef:np.ndarray, inter:np.ndarray):
    coef_flat = coef.flatten().astype(np.float32)
    intercept = inter.astype(np.float32)  
    payload = struct.pack(f'{len(coef_flat)}f', *coef_flat) + \
              struct.pack(f'{len(intercept)}f', *intercept)
    return payload


if __name__ == '__main__':
    # ==================
    # Order matters here, do not change this line (it must match the order setup in the cpp files)
    csv_files = ["good.csv", "slouch.csv", "left.csv", "right.csv", "mega.csv", "no.csv"]
    # ==================

    # Load the training data
    X_train, y_train = load_csv_data(csv_files, directory=DATA_DIR)
    clf = LinearSVC(C=1, dual=False)
    # Create nonlinear combinations of the state variables so the model is more expressive
    poly = PolynomialFeatures(degree=2)
    X_train = poly.fit_transform(X_train)

    # Train the model
    svm = clf.fit(X_train, y_train)

    if not SERVER_MODE:
        # Show training vs testing stats
        X_test, y_test = load_csv_data(csv_files, directory=TESTING_DIR)
        X_test = poly.transform(X_test)
        acc = (svm.predict(X_train) == y_train).mean()
        print("Train accuracy:", acc)

        print("WEIGHTS SHAPE:", svm.coef_.shape)
        acc = (svm.predict(X_test) == y_test).mean()
        print("Test accuracy:", acc)

        cm = confusion_matrix(y_test, svm.predict(X_test))
        print(cm)
        export_weights_c_code(svm.coef_, svm.intercept_, poly)
    else:
        # print out the payload in binary
        payload = export_weights_bin(svm.coef_, svm.intercept_)
        print(payload)