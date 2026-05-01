import subprocess
import io
import csv
from flask import Flask, request, jsonify
from sklearn.preprocessing import PolynomialFeatures
from sklearn.svm import LinearSVC
import numpy as np
import struct
import paho.mqtt.client as mqtt
import psycopg2
import pandas as pd
from flask_cors import CORS
import ssl

# === TODO CHANGE THESE === 
BROKER = "pp.mattymo.dev"
MQTT_PORT = 8883
USERNAME = "mqtt-listener"
PASSWORD = ""

TOPIC_ROOT = "devices"
TOPIC_PUB = "weights"

DB_RUL = ""
LABEL_TABLE = {
    "good": 0,
    "slouch": 1,
    "left": 2,
    "right": 3,
    "mega": 4,
}
# === CHANGE THESE === 


client = mqtt.Client()
client.tls_set(tls_version=ssl.PROTOCOL_TLSv1_2)
client.tls_insecure_set(False)
client.username_pw_set(username=USERNAME, password=PASSWORD)
conn = psycopg2.connect(DB_RUL)

data_columns = [
    "gpio2",
    "gpio3",
    "gpio4",
    "gpio5",
    "gpio6",
    "gpio7",
    "gpio32",
    "gpio33",
    "gpio34",
    "gpio35",
    "gpio36",
    "gpio39",
]

app = Flask(__name__)
CORS(app) #, origins=[
    # "http://localhost:3000/",
    # "https://posture-pad.vercel.app/",
# ]) 

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

def get_posture_data(device_id:str, data: list[dict], num_samples:int) -> np.ndarray:
    X_list = [np.zeros(shape=(num_samples, 12))]
    y_list = [np.ones(shape=(num_samples,)) * 5]

    for item in data:
        label = item["label"]
        print("LABEL:", label)
        time_to = item["to"]
        time_from = item["from"]
        query = "SELECT * FROM posture WHERE device_id = %s AND device_timestamp >= %s AND device_timestamp <= %s LIMIT %s"
        df = pd.read_sql(query, conn, params=(device_id,time_from,time_to,num_samples))
        df = df[data_columns]
        df_numpy = df.to_numpy(dtype=np.float32)
        print("INCOMING DATA SHAPE", df_numpy.shape)
        print("TABLE:", LABEL_TABLE[label])
        print(df)
        y = np.ones(shape=(df.shape[0]), dtype=int)
        y *= LABEL_TABLE[label]
        
        X_list.append(df_numpy)
        y_list.append(y)

    return np.vstack(X_list), np.hstack(y_list)

def train_model(posture_data: np.ndarray):
    X_train, y_train = posture_data

    clf = LinearSVC(C=1, dual=False)

    # Create nonlinear combinations of the state variables so the model is more expressive
    poly = PolynomialFeatures(degree=2)
    X_train = poly.fit_transform(X_train)

    # Train the model
    svm = clf.fit(X_train, y_train)
    return svm.coef_, svm.intercept_

def send_trained_weights(weights:np.ndarray, bias:np.ndarray, device_id:str):
    client.connect(BROKER, MQTT_PORT)
    weights_flat = weights.flatten().astype(np.float32)
    bias = bias.astype(np.float32)  
    payload = struct.pack(f'{len(weights_flat)}f', *weights_flat) + \
              struct.pack(f'{len(bias)}f', *bias)
    
    print("WEIGHTS: FLAT", weights_flat)
    print("BIAS", bias)

    print(f"Payload size: {len(payload)} bytes")  # 2208 bytes
    client.publish(f"{TOPIC_ROOT}/{device_id}/{TOPIC_PUB}", payload, qos=1)
    client.disconnect()


@app.post("/train")
def train():
    body = request.get_json(force=True, silent=True)

    # --- Validate input ---
    if body is None:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    
    device_id = body.get("device_id")
    calibration_data_datails = body.get("data")
    num_samples = body.get("num_samples")

    if not isinstance(device_id, str) or not isinstance(calibration_data_datails, list) or not isinstance(num_samples, int):
        return jsonify({"error": ...}), 400

    for item in calibration_data_datails:
        if not isinstance(item, dict) or "label" not in item or "from" not in item or "to" not in item:
            return jsonify({"error": 'Each item must have "label" (str) and "from" (num) and "to" (num)'}), 400
        if not isinstance(item["label"], str) or not isinstance(item["from"], (int, float)) or not isinstance(item["to"], (int, float)):
            return jsonify({"error": '"label" must be a string, "from" must be a number, and "to" must be a number'}), 400

    # --- Run script and obtain tensor ---
    posture_data = get_posture_data(device_id, calibration_data_datails, num_samples)
    # csv_files = ["good.csv", "slouch.csv", "left.csv", "right.csv", "mega.csv", "no.csv"]
    # posture_data = load_csv_data(csv_files, directory='./posture_data')
    weights, bias = train_model(posture_data)
    send_trained_weights(weights, bias, device_id)

    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)