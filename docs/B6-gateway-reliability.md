# 06 · Gateway Reliability Investigation

[← Back to README](../README.md)

## Symptom

After some hours the gateway appeared **offline** in HA and stayed that way until its power was cycled. Several times.

## What was established

| Observation | Meaning |
|---|---|
| While "offline" it **still answered ping** and its USB serial console | The Wi-Fi link was up, so this pointed at the **MQTT connection not being restored** rather than a total Wi-Fi loss |
| Eight other ESP32 devices on the same network and router stayed connected | Not a general network problem |
| On a laptop USB port, with the laptop kept awake: **16 h+** and **12.5 h+** with no gaps | Stable on that supply |
| Earlier gaps on laptop power | Traced to the laptop **sleeping**, not the stick |

## Measuring it

Packets per hour from the logs. Gaps show exactly when it was offline:

```bash
cat /config/ramses_rf_logs/packet_log.log* | cut -c1-13 | sort | uniq -c
```

## Wall-adapter test: still failing (open issue)

On a plug-in **wall adapter** the gateway **still can't hold its connection reliably**. It's stable on a computer's USB port, so the difference is either:

| Candidate | How to tell |
|---|---|
| **Supply:** the adapter can't meet the ESP32-S3's Wi-Fi transmit current peaks, or its 5 V sags or is noisy | Try a known-good 5 V 2 A+ supply and a short, thick USB cable; or a powered USB hub fed from the same wall socket. If it becomes stable, it was the supply |
| **Wi-Fi coverage** at the wall-adapter location | Note the stick's RSSI and the router's client list at each location; test the wall adapter *where the PC is* (same position, different supply) to separate the two variables |

**Current workaround:** powered from the PC's USB port. It's stable, but the location isn't central between the two controllers, so it's not the final position.

## Next steps

1. Wall adapter **at the PC's location** (changes only the supply).
2. If that fails: a better 5 V supply or cable at the same spot.
3. If supply is ruled out: improve Wi-Fi at the central location (dedicated 2.4 GHz SSID, access point or mesh node), then move the stick there.
4. At any stuck episode: does it ping, what does the serial log say, and did Mosquitto or HA restart just before?

## Mitigations if it recurs

- A smart-plug power-cycle automation (works whatever the cause).
- Router: a dedicated 2.4 GHz SSID on a fixed channel; band steering and 802.11k/v/r off for it; check the router log for de-auths.

## Issue report

Raised as an issue on the firmware's public repository (IndaloTech/ramses_esp), including: hardware, MQTT mode, the ping and serial evidence, the comparison devices and related issues. **No response from the maintainer yet.** It will be updated with the supply/location test results and per-hour packet counts.
