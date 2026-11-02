# 06 · Gateway Reliability Investigation

[← Back to README](../README.md)

**Status (2 Nov 2026): root cause narrowed to the gateway firmware's radio side; automatic recovery in place; fix awaited upstream.** The ESP-based RAMSES-II gateway periodically **stops receiving RF while its Wi-Fi and MQTT stay connected**. A soft restart over MQTT cures it, and Home Assistant now does that automatically.

## 1. History

| Phase | Symptom | Finding |
|---|---|---|
| Oct 2026, factory firmware | Gateway "offline" in HA after some hours; power cycle needed | Still answered ping and its serial console: Wi-Fi up, **MQTT not restored**. Stable on a laptop USB port (16 h+, 12.5 h+); unreliable on a wall adapter |
| Issue raised upstream (IndaloTech/ramses_esp #47) | Stick stops retrying Wi-Fi after a drop | Maintainer released a network-stability update at the end of October |
| 2 Nov 2026, updated firmware (flashed over USB, [B4](B4-upgrade-and-known-issues.md#gateway-firmware-update-usb-browser-flasher)) | **Wi-Fi reconnection now works**: the stick rejoined Wi-Fi by itself several times | But a **different fault** appeared: RF reception stops |

## 2. Monitoring built to measure it

The MQTT "online" status could not detect outages: the broker only noticed a dead connection when the stick reconnected, so "offline" and "online" arrived in the same second. Gateway health is therefore measured from **radio traffic**:

| Point | Source | Purpose |
|---|---|---|
| Last RX | MQTT sensor on the `/rx` topic, timestamped on every message | Time since the last RF packet |
| **Receiving** | Template binary sensor: last RX < 120 s ago | The real "gateway working" signal |
| MQTT online | `RAMSES/GATEWAY/<id>` (online/offline) | Connection state only |
| Firmware | `/info/version` | Version actually running |
| On Wi-Fi + signal | Router integration (AsusRouter) tracker and its RSSI | Separates a Wi-Fi drop from a hang |
| Gap and recovery counters, logbook entries | Automations | A record of every outage and its length |

Config: [sensors](../config/ha-gateway-monitoring.yaml) · [automations](../config/ha-gateway-automations.yaml) · [dashboard card](../config/ha-gateway-card.yaml).

## 3. The RF stall (updated firmware)

| Observation during a stall | Meaning |
|---|---|
| No `/rx` messages at all | Radio receive path stopped |
| MQTT connected; Wi-Fi connected at −62 to −64 dBm | **Not Wi-Fi, not signal, not MQTT** |
| Solid green LED | Matches another user's report (upstream #48); the maintainer separates this from a TX stall (blue LED, PR #44) |
| `cmd` published to the command topic returns `ESP_OK` | **CPU and MQTT task alive** |
| `reset` published to the command topic restarts it; RF resumes within about a minute | **Soft restart cures it**: no power cycle needed |
| Same fault on a PC USB port and on a wall adapter | **Not the power supply** |
| Wi-Fi dropped and rejoined several times during one stall, RF stayed dead | The Wi-Fi fix works; the radio side is separate |

**Timing pattern:** every stall so far began shortly after a reconnect or a burst of host activity (an HA restart, Wi-Fi access-point changes, a Wi-Fi rejoin), and the stick can **re-stall within minutes of a reset**. Event log: [data/gateway-rf-stalls.csv](../data/gateway-rf-stalls.csv).

Reported upstream as IndaloTech/ramses_esp **#50**, cross-referenced to #48 (same symptom) and #49 (MQTT reconnect memory leak).

## 4. Automatic recovery (watchdog)

An automation publishes `reset` when **Receiving** has been off for 5 minutes **while MQTT is still connected** (the stall pattern), waits up to 5 minutes for traffic, then reports success or asks for a power cycle. A separate alert fires only if traffic has been missing for 15 minutes, i.e. the watchdog failed.

**Lesson from the first night:** a 15-minute "don't repeat" guard blocked the second reset when the stick re-stalled within minutes. The guard was unnecessary: the trigger is a **change** to "not receiving", so the watchdog can't loop on a stick that stays dead. It was removed.

## 5. Next steps

1. Review the first full night of watchdog traces (stall count, minutes between stalls, every reset successful?) and update #50.
2. Try any test build the maintainer publishes for the green-LED stall; keep the watchdog for a week after a fix.
3. If asked for serial logs: disable the watchdog, catch a stall, connect USB before resetting.
4. Gateway location: now at the central landing position on a wall adapter (−62 to −64 dBm through the nearest mesh node).

## Lessons

- **Measure the service, not the connection.** "Connected" was true during every outage; only traffic told the truth.
- **Separate the variables:** supply (PC vs wall adapter), Wi-Fi (router RSSI and presence), MQTT (online status, command replies) and radio (RX) each have their own point.
- **A cheap test while it's broken is worth more than a restart.** One command (`cmd`) during a stall proved the CPU and MQTT were alive.
- **A workaround is a control, not a fix.** The watchdog keeps the heating integration working; the fault stays open upstream.
