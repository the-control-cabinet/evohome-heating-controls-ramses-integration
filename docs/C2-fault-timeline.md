# 02 · Timeline

[← Back to README](../README.md) · Data: [`data/timeline.csv`](../data/fault-timeline.csv)

| When | What happened | Source |
|---|---|---|
| 18 Sep | RAMSES-II gateway set up; ramses_cc configured via the in-development HA MQTT bridge | Notes |
| 18 Sep 23:48 | Gateway sends `W 2349` to the upstairs controller: one zone 21.50 °C, mode 01 (temporary until next switchpoint) | Packet log |
| 19 Sep 11:12 | Downstairs controller broadcasts `2309` setpoints: zone 00 **5.00 °C**, zones 01-05 12.00 °C | Packet log |
| 19 Sep 17:28 | All zones on both controllers at 5 °C; not in Away or frost | Notes |
| 19 Sep 17:32 | Gateway unplugged | Notes |
| 19 Sep 18:10 | Zones set by hand; at the next switchpoint all revert to 5 °C. From here on, the zones were overridden by hand every evening to get heat | Notes |
| 21 Sep | 24 h after unplugging and disabling ramses_cc: still OVERRIDE 5 °C everywhere. A controller power cycle helps only until the next switchpoint | Notes |
| 22 Sep | Hypotheses widened to controller state, TRVs and wall stats | Notes |
| 25 Sep | Cloud integration checked: same as the standard Evohome integration, nothing rogue | Notes |
| 2 Oct (am) | Cloud integration commented out of configuration.yaml; ramses_cc deleted. No change | Notes |
| 2 Oct (pm) | Icon comparison: clock + Cancel for a deliberate override; sun-and-thermometer, no Cancel for faulted zones | Notes |
| 3 Oct | Single-zone test: delete, re-add, re-bind TRV and T87RF | Notes |
| Early Oct | Both controllers rebuilt zone by zone, so the fault is cleared. Downstairs needed the HCC80R actuator bind, which has a confirmation trap | Notes |
| 9 Oct | Gateway back, standalone MQTT mode, Tx off: no recurrence over about 48 h. Packet-log audit. Tx enabled with audit | Notes / packet log |

The gateway was out of service from 19 Sep (unplugged) until it came back on 9 Oct. The fault persisted and was fixed while it was absent.
