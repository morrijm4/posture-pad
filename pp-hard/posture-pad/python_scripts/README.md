# Python Scripts

## Dependencies

The libraries required for these two Python scripts are in `requirements.txt`. Install it to a Python environment with 
```
pip install -r requirements.txt
```

## csv_gen.py
Reads data from the ESP32 and saves it as a .csv

To run the program, use
```
python csv_gen.py <file_name>
```

and the results will be stored in <file_name>.csv

## train.py

Trains the model based on the csvs found in `posture_data/`. To run this normally, ensure that the `SERVER_MODE` variable is set to False. To run this for the server training/config feature, set this to True.

To run the file, run
```
python train.py
```

The output of this is either testing statistics if not in server mode or it is a binary payload for MQTT to set to the ESP32.