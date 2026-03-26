import sys
import serial
import serial.tools.list_ports
import time

def find_esp32_port():
    ports = serial.tools.list_ports.comports()
    keywords = ["cp210", "ch340", "ftdi", "uart", "usb serial", "esp"]

    for port in ports:
        desc = (port.description or "").lower()
        mfg  = (port.manufacturer or "").lower()
        if any(k in desc or k in mfg for k in keywords):
            return port.device

    if ports:
        return ports[0].device

    return None

def main():
    if len(sys.argv) != 2:
        raise RuntimeError("Need to specify output csv")
    csv_out = sys.argv[1]
    if ".csv" not in csv_out:
        csv_out += ".csv"
    port = find_esp32_port()
    ser = serial.Serial(port, 115200, timeout=1)
    time.sleep(2)
    ser.flushInput()
    time.sleep(1)

    while True:
        try:
            raw  = ser.readline()
            line = raw.decode("utf-8", errors="replace").strip()
        except Exception:
            continue

        if not line:
            continue
            
        if "CSV" in line:
            data = line[5:]
            csv_line = ",".join(data.split(",")[:-1])
            with open(csv_out, "a") as f:
                f.write(csv_line + '\n')
        
if __name__ == "__main__":
    main()