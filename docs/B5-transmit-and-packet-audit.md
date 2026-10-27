# 05 · Transmit Enablement and Packet Audit

[← Back to README](../README.md) · Script: [`scripts/packet-audit.sh`](../scripts/packet-audit.sh)

## Principle

**Listen first, write later, and audit always.** A gateway that can transmit on a live heating network can change setpoints and modes on every zone. Tx stayed off until two things were proven: what the gateway had sent in the past, and how the system behaved with it listening only.

## The audit before enabling Tx

```bash
# 1. Everything the gateway sent that isn't a read request
awk '$5=="18:000001" && $3!="RQ"' /config/ramses_rf_logs/packet_log.log

# 2. Gateway traffic by verb and code across all logs
awk '$5=="18:000001"{print $3,$8}' /config/ramses_rf_logs/packet_log* | sort | uniq -c | sort -rn

# 3. Every zone-mode write
grep -h " W --- 18:000001" /config/ramses_rf_logs/packet_log* | cut -c1-120

# 4. Any writes to the downstairs controller
awk '$5=="18:000001" && $6=="01:000002"{print $3,$8}' /config/ramses_rf_logs/packet_log.log | sort | uniq -c
```

| Finding | Result |
|---|---|
| Packet types sent | **RQ** reads and **W 2349** zone-mode writes only |
| Writes in total | 20 × `W 2349`, all temporary setpoints (mode `01`) on single upstairs zones |
| 5 °C (`01F4`) or permanent mode (`02`) | None |
| Writes to the downstairs controller | None |

Logs from the audit period were kept separately (`/config/ramses_rf_logs_keep_2026-10-09`).

### Reading a 2349 write

```
W --- 18:000001 01:000001 --:------ 2349 007 00 0866 01 FFFFFF
```

Zone `00`, setpoint `0x0866` = 2150 → 21.50 °C, mode `01` (until next switchpoint), until `FFFFFF` (none).

## After enabling Tx

- `disable_sending: false` set deliberately. `send_packet` (raw packet service) stays off.
- Check 1 is re-run after any change. **Empty output, or only writes made deliberately, = pass.** The last run was empty.
- **Control test passed:** a temporary 13 °C on the Hall zone from HA, then cancelled. The zone responded as expected; the test write was a deliberate, targeted temporary setpoint.
