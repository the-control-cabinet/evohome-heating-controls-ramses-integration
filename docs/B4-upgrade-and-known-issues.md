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

## Known issues to work around

| Issue | Effect | Workaround |
|---|---|---|
| ramses_cc **#1241** | A `get_zone_schedule` timeout can silently stop Tx until a full HA restart | Don't use that service |
| ramses_cc **#1242** | An integration reload can show the wrong hub mode | Restart rather than reload |
| `2E04` not answered | System mode null in ramses_cc | Use the cloud integration's mode |

## Rejected tools

- **evohome-async CLI** (schedule export): hit Honeywell's HTTP 429 rate limit, so it was abandoned.
- **Ramses Extras:** mostly HVAC (ventilation) features; only its debugger/log explorer would be relevant. Not installed.
