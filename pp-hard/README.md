# Hardware Files for Posture Pad
All of the scripts used for the hardware of the posture pad. It utilizes Platformio, but it is not properly setup as a repo so to use this on your own device you should make a new platformio project and then copy and paste these files/directories to their corresponding locations.

## Directory Outline
### Platformio
- `./include/` Shared files/definitions used by source files
- `./src/` Main scripts for the device
    - `./src/comms/` MQTT funcs for device communication
    - `./src/haptics/` haptic control funcs
    - `./src/posture/` SVM posture classification funcs
    - `./src/sensors/` FSR sensor funcs
    - `./src/storage/` Non-Volatile Memory storage funcs for device preferences/settings
- `./platformio.ini` Platformio config file

### Python
- `./python_scripts/` Scripts for interacting with the PP over serial and for training the SVM posture classification algo


## Device Details

The PP is currently setup to communicate at a baud rate of 115200