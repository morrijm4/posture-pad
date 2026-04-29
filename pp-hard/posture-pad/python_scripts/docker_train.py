import subprocess
import io
import csv
from flask import Flask, request, jsonify
from sklearn.preprocessing import PolynomialFeatures
from sklearn.svm import LinearSVC
import numpy as np
import struct
import paho.mqtt.client as mqtt

# === TODO CHANGE THESE === 
BROKER = "hostname"
MQTT_PORT = 8883
USERNAME = "username"
PASSWORD = "password"
CERT_PATH = "cert_path"

TOPIC_ROOT = "devices"
TOPIC_PUB = "weights"
# === CHANGE THESE === 


client = mqtt.Client()
client.username_pw_set(username=USERNAME, password=PASSWORD)

client.tls_set(
    ca_certs=CERT_PATH,
)

app = Flask(__name__)


def get_posture_data(pairs: list[dict]) -> np.ndarray:
    # ============ MATTYMO: CHANGE WHATEVER YOU NEED HERE START ============
    input_csv = "label,id\n" + "\n".join(
        f"{p['label']},{p['id']}" for p in pairs
    )

    result = subprocess.run(
        ["python", "dummy_db_script.py"],   # <-- swap in your script/binary here
        input=input_csv,
        capture_output=True,
        text=True,
        check=True,                      # raises CalledProcessError on non-zero exit
    )

    # ============ MATTYMO: CHANGE WHATEVER YOU NEED HERE END ============

    # Parse the CSV written to stdout into a NumPy tensor
    reader = csv.reader(io.StringIO(result.stdout))
    rows = [row for row in reader if row]   # skip blank lines
    posture_data = np.array(rows, dtype=float)

    return posture_data

def train_model(posture_data: np.ndarray):
    y_train = posture_data[:, -1]
    X_train = posture_data[:, :-1]

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

    print(f"Payload size: {len(payload)} bytes")  # 2208 bytes
    client.publish(f"{TOPIC_ROOT}/{device_id}/{TOPIC_PUB}", payload, qos=1)
    client.disconnect()


@app.post("/train")
def train():
    """
    POST /train
    Body (JSON): [{"label": "good", "id": 1}, {"label": "slouch", "id": 2}, ...]

    Triggers the training script, collects its CSV stdout, and converts the
    result into a NumPy tensor for downstream use.
    """
    body = request.get_json(force=True, silent=True)

    # --- Validate input ---
    if body is None:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    
    device_id = body.get("device_id")
    posture_data_details = body.get("posture_data_details")

    if not isinstance(device_id, str) or not isinstance(posture_data_details, list):
        return jsonify({"error": ...}), 400

    for item in posture_data_details:
        if not isinstance(item, dict) or "label" not in item or "id" not in item:
            return jsonify({"error": 'Each item must have "label" (str) and "id" (num)'}), 400
        if not isinstance(item["label"], str) or not isinstance(item["id"], (int, float)):
            return jsonify({"error": '"label" must be a string and "id" must be a number'}), 400

    # --- Run script and obtain tensor ---
    try:
        posture_data = get_posture_data(posture_data_details)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Training script failed", "stderr": e.stderr}), 500
    except ValueError as e:
        return jsonify({"error": f"Could not parse script output as numeric CSV: {e}"}), 500

    weights, bias = train_model(posture_data)
    send_trained_weights(weights, bias, device_id)

    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)