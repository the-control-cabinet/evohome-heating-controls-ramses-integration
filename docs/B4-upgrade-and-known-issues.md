# 04 · Upgrade and Known Issues

[← Back to README](../README.md)

## 0.60.4 → 0.60.10

| | 0.60.4 | 0.60.10 |
|---|---|---|
| UFH zone heat demand | Missing (ramses_cc issue **#1154**) | ✅ All zones report demand |
| ramses-rf library | matching | pinned `ramses-rf==0.60.10` in the manifest |

**Method:** HACS → ramses_cc → Redownload → choose 0.60.10, then a full restart. Check with:

```
grep '"version"' /config/custom_components/ramses_cc/manifest.json
```

**Lesson:** the symptom (UFH zones with no demand) looked like a schema or binding problem. Checking the integration's issue tracker first found it was a known defect with a fix already released.

## Gateway firmware update (USB, browser flasher)

Done on 2 Nov 2026 with the browser-based esptool flasher (Chrome/Edge on Windows), stick on USB:

| File | Address |
|---|---|
| bootloader | `0x0` |
| partition table | `0x8000` |
| OTA data (initial) | `0xd000` |
| application | `0x10000` |

**Check the partition table first:** the addresses above match a layout with the factory app at `0x10000` (2 MB) and OTA slots at `0x210000` / `0x410000`. A different layout needs different addresses.

**After flashing:** confirm the version on the `info/version` topic, Tx working, RF traffic flowing. Then monitor it ([B6](B6-gateway-reliability.md)): the update fixed Wi-Fi reconnection but exposed an RF stall.

## Known issues to work around

| Issue | Effect | Workaround |
|---|---|---|
| ramses_cc **#1241** | A `get_zone_schedule` timeout can silently stop Tx until a full HA restart | Don't use that service |
| ramses_cc **#1242** | An integration reload can show the wrong hub mode | Restart rather than reload |
| `2E04` not answered | System mode null in ramses_cc | Use the cloud integration's mode |
| `!V` command not recognised | On every reconnect ramses_cc sends `!V` (an evofw3 version query); the ESP gateway replies `ESP_ERR_NOT_FOUND` | Harmless; ignore |
| Gateway RF stall (upstream #50) | RF stops while Wi-Fi and MQTT stay up | Auto-restart watchdog over MQTT ([B6 §4](B6-gateway-reliability.md#4-automatic-recovery-watchdog)) |

## Rejected tools

- **evohome-async CLI** (schedule export): hit Honeywell's HTTP 429 rate limit, so it was abandoned.
- **Ramses Extras:** mostly HVAC (ventilation) features; only its debugger/log explorer would be relevant. Not installed.
