from micromlgen import port
from sklearn.svm import SVC
import pandas as pd
from sklearn.svm import SVC

from sklearn.svm import LinearSVC


import numpy as np
from sklearn.model_selection import train_test_split



def load_csv_data(file_list):
    X_list = []
    y_list = []

    for i, file in enumerate(file_list):
        data = pd.read_csv(f"./posture_data/{file}", header=None)

        X = data
        cls = np.ones(shape=(data.shape[0]), dtype=int)
        cls *= i
        y = pd.DataFrame(cls)

        X_list.append(X)
        y_list.append(y)
    X_combined = pd.concat(X_list, ignore_index=True)
    y_combined = pd.concat(y_list, ignore_index=True)

    return X_combined, y_combined


if __name__ == '__main__':
    csv_files = ["good.csv", "slouch.csv", "left.csv", "right.csv", "mega_slouch.csv", "no.csv"]
    X, Y = load_csv_data(csv_files)
    x = X.to_numpy(dtype=np.float32)
    x /= 4095.0
    y = Y.to_numpy()
    y = y.squeeze()
    clf = SVC(kernel='linear', gamma=0.001, C=1)
    # clf = LinearSVC(C=1, dual=False)

    X_train, X_test, y_train, y_test = train_test_split(
        x, y, test_size=0.1, random_state=42
    )

    svm = clf.fit(X_train, y_train)

    acc = (svm.predict(X_test) == y_test).mean()
    print("Test accuracy:", acc)
    # print(svm.predict([[0,0,0,0,0,0,0,0,0,0]]))
    print(port(svm))