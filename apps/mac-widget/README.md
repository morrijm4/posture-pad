# PosturePad Mac Widget

This is a lightweight macOS companion app that renders a notch-style posture widget near the top center of the screen.

## What it does

- Shows a Dynamic Island-style pill at the top of the main display
- Colors the pill based on the user's live posture state
- Connects directly to MQTT over secure WebSockets
- Reads the on/off preference from `~/.posturepad/widget-preferences.json`

## Run it

From the repo root:

```bash
cd apps/mac-widget
swift run
```

The widget reads MQTT settings from the repo root `.env.local` during development.

Optional:

```bash
POSTUREPAD_WIDGET_DEVICE_ID=your-device-id swift run
```

If you omit `POSTUREPAD_WIDGET_DEVICE_ID`, the widget subscribes with `devices/+/posture` and follows the first matching posture messages it receives.
