# 03 · Home Assistant Entities

[← Back to README](../README.md)

## Device tree

With the schema loaded, zones and UFH circuits appear in HA as **child devices** of their controller (and the circuits under the HCC80R). TRVs, wall stats and BDRs stay **top-level** devices. That's by design in ramses_cc and only cosmetic.

## Two integrations side by side

| | Cloud `evohome` | `ramses_cc` |
|---|---|---|
| Source | Honeywell cloud | Local RF |
| Climate entities | `climate.<zone>` (plain names kept) | `climate.rf_<zone>` |
| System mode | ✅ | Shows **null** (see below) |
| Heat demand, TRV/BDR detail | ❌ | ✅ |

Both controllers needed to appear from the cloud too. The standard integration showed only one of the two controllers, so a copy of the core integration (`evohome_1`) was added as a custom component for the second.

### Entity ID clash fix

Both integrations wanted the same IDs (e.g. `climate.hall`), so ramses_cc's copies became `climate.hall_2`. [`scripts/rename_rf_entities.py`](../scripts/rename_rf_entities.py) renames every ramses_cc `*_2` entity whose base ID belongs to another integration to `rf_*`:

```
ha core stop
python3 rename_rf_entities.py     # writes a .bak of the registry first
ha core start
```

Delete `core.entity_registry.bak` once HA is confirmed healthy.

## Known display behaviours

| Behaviour | Explanation |
|---|---|
| Hub `system_mode` is null | These controllers never answer or broadcast `2E04` (system mode). Read the mode from the cloud entity |
| Zone modes *unknown* after a restart | They fill in as the controllers answer `RP 2349` |
| UFH heat demand *unknown* after a restart | Known behaviour; refills |
| Window-open entities on UFH zones | Meaningless for underfloor heating; disabled |

## Useful templates and commands

```jinja
{# all ramses_cc climate entities #}
{{ integration_entities('ramses_cc') | select('match', 'climate\.') | list }}
```

Device listing: [`scripts/list_ramses_devices.sh`](../scripts/list_ramses_devices.sh)
