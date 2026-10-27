# 01 · Gateway Set-up

[← Back to README](../README.md)

## Hardware

| Item | Detail |
|---|---|
| Gateway | Indalo Tech **ramses_esp** USB stick: ESP32-S3 with CC1101 868 MHz radio |
| Firmware | Factory-installed release (version kept current) |
| Purchased | Directly from Indalo Tech, September 2026 |
| RAMSES ID | HGI **18:000001** |
| Connection | Wi-Fi → MQTT (Mosquitto add-on), not USB to the HA host, so it can sit centrally between the two controllers |

## Step 1: Wi-Fi and MQTT over the serial console

The stick is configured over USB serial from a laptop. Its LEDs show solid red and flashing blue at power-up.

| Setting | Value |
|---|---|
| Port | the stick's COM port (Windows Device Manager → "USB Serial Device") |
| Speed / format | **115200 baud, 8 data bits, no parity, 1 stop bit**, no flow control |
| Line ending | **CR+LF** |
| Local echo | **On**, otherwise typed commands are invisible |

Commands used at the console (values redacted):

```
wifi ssid <your-ssid>
wifi password <your-wifi-password>
nvs dump              # check what's stored
```

The MQTT broker address and credentials are set the same way, as described in the ramses_esp README.

**Gotchas met:**
- PuTTY wouldn't open the port (Windows just beeped), usually because another program holds it. A different terminal (Tera Term) opened it.
- Tera Term connected but showed **no prompt**, only live RF traffic scrolling. That's normal: the stick prints received packets, for example `I --- 04:000001 --:------ 01:000001 3150 002 0000`, a TRV reporting heat demand. Commands still work once local echo and CR+LF are set.
- Seeing real packets straight away is a good first test that the radio works.

## Step 2: Mosquitto

On HA's Mosquitto add-on the gateway connects as an MQTT client and publishes under:

```
RAMSES/GATEWAY/18:000001/rx      ← packets received from RF
RAMSES/GATEWAY/18:000001/tx      ← packets to transmit
RAMSES/GATEWAY/18:000001/info/version
```

Check with an MQTT client (e.g. HA's MQTT integration → Listen to topic `RAMSES/GATEWAY/#`).

## Step 3: ramses_cc

1. Install **ramses_cc** from HACS and restart.
2. Add the integration. On the first page choose **MQTT broker**. Don't choose "Home Assistant MQTT broker (in development)". The live system ended up on the standalone broker mode after starting on the in-development option.
3. Serial port config: the port is given as an **MQTT URL** (`port_name: mqtt://<user>:<password>@<broker>:1883`). Errors such as *"expected a mapping"* or *"not a valid option"* came from the advanced serial field being filled in the wrong format.
4. Packet logging on, to `/config/ramses_rf_logs/packet_log.log`.
5. **Sending off** at first (`disable_sending: true`), so it's listen-only until the system is understood ([B5](B5-transmit-and-packet-audit.md)).

## Current options

| Option | Value |
|---|---|
| Mode | Standalone MQTT broker (`port_name: mqtt://…`) |
| `disable_sending` | false (Tx on, enabled deliberately after the audit) |
| `send_packet` service | false |
| `log_all_mqtt` | false |
