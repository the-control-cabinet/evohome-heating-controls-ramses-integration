# 04 · Packet-Log Analysis: Auditing the Suspect

[← Back to README](../README.md)

The fault began the day after the RAMSES-II gateway (HGI **18:000001**) was installed. Before blaming it, its own transmit history was examined. ramses_cc logs every packet seen or sent to `/config/ramses_rf_logs/packet_log.log*`.

## What did the gateway ever send?

All writes and announcements from the gateway (anything that isn't a read request):

```bash
awk '$5=="18:000001" && $3!="RQ"' /config/ramses_rf_logs/packet_log.log*
```

Just the zone-mode writes:

```bash
grep -h " W --- 18:000001" /config/ramses_rf_logs/packet_log* | cut -c1-120
```

## Findings

| Check | Result |
|---|---|
| Packet types sent | **RQ** (read requests) and **W 2349** (zone mode/setpoint) only |
| Any 5 °C setpoint (`01F4` = 500 → 5.00 °C) | **None** |
| Any permanent override (2349 mode `02`) | **None**. All writes were mode `01` (temporary, ends at the next switchpoint) |
| Writes to the downstairs controller 01:000002 | **None**, though that controller faulted too |
| First write | `2026-09-18T23:48:19  W --- 18:000001 01:000001 --:------ 2349 007 00086601FFFFFF` |

## Decoding the first write

```
W --- 18:000001 01:000001 --:------ 2349 007 00 0866 01 FFFFFF
      from gateway  to upstairs ctl      code len zone setpt mode until
```

| Field | Bytes | Meaning |
|---|---|---|
| Zone | `00` | Zone 00 |
| Setpoint | `0866` | 0x0866 = 2150 → **21.50 °C** |
| Mode | `01` | Temporary override, until next switchpoint |
| Until | `FFFFFF` | No explicit end time (uses next switchpoint) |

## The downstairs controller's own broadcast

```
2026-09-19T11:12:01  I --- 01:000002 --:------ 01:000002 2309 018 00 01F4 01 04B0 02 04B0 03 04B0 04 04B0 05 04B0
```

`2309` is the controller announcing its zones' current setpoints, in triplets of zone and value:

| Zone | Value | °C |
|---|---|---|
| 00 | `01F4` | **5.00** |
| 01-05 | `04B0` | 12.00 |

Hours before the fault was noticed, the downstairs controller itself was already holding one zone at 5 °C. The gateway had never written to that controller.

## Conclusion

The gateway was **not** the direct source of a 5 °C or permanent-override command. What it can't rule out is an indirect effect while the system was first probed through the in-development integration path (for example malformed or repeated traffic during Wi-Fi drop-outs). That remains an unproven working theory.

## Ongoing audit (since Tx was enabled on 9 Oct)

```bash
# Anything the gateway sent that isn't a read - expect only deliberate, targeted writes
awk '$5=="18:000001" && $3!="RQ"' /config/ramses_rf_logs/packet_log.log
```

Empty output, or only writes made deliberately, means the gateway is behaving.
