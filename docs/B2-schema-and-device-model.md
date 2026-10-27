# 02 · Schema and Device Model

[← Back to README](../README.md) · Schema: [`config/ramses-schema.yaml`](../config/ramses-schema.yaml) · Inventory: [`data/device-inventory.csv`](../data/device-inventory.csv)

## Why a schema

Left to discovery alone, ramses_cc only finds devices as they talk, and it can't always tell which zone a TRV or wall stat belongs to. The result was a flat, partial list. The **system schema** tells it the structure: controller → DHW and system relays → zones → actuators and sensor, plus the UFH controller's circuits. It's the RF equivalent of a BMS points schedule.

## How it was built

1. **Listened** with Tx off and collected packets from every device.
2. **Grouped** them by controller. Each controller is the hub its devices talk to (e.g. `I --- 04:000001 --:------ 01:000001 3150` = TRV → upstairs controller, heat demand).
3. **Mapped devices to zones** from zone-indexed packets (setpoints, demand), cross-checked with the Evohome app's zone names and, downstairs, the HCC80R's physical zone order (1 Lounge … 6 Utility).
4. **Identified the relays:** BDR91s by their role in `stored_hotwater` (DHW valve) and `system.appliance_control` (boiler demand).
5. **Loaded** it via Ramses RF → Configure → System schema, restarted, and checked each zone.

## Structure

| | Upstairs 01:000001 | Downstairs 01:000002 |
|---|---|---|
| Zones | 12 × `radiator_valve` | 6 × `underfloor_heating` |
| Actuators | HR92 TRVs per zone | HCC80R 02:000001, circuits 00-05 → zones 00-05 |
| Zone sensors | T87RF wall stats (one zone uses its own TRV) | T87RF wall stats (Kitchen uses the controller's sensor) |
| DHW | sensor 07:000001, valve BDR 13:000001 | sensor 07:000002, valve BDR 13:000003 |
| Boiler demand | BDR 13:000002 | BDR 13:000004 |

`main_tcs` is the upstairs controller.

## Rules and assumptions

- **Zone names must match the controller exactly**, including the controller's own spelling. One controller zone name had a one-letter typo, and the schema had to copy it.
- Two assumptions the schema accepted: Kitchen's sensor is the controller itself; the HCC80R circuit numbers map one-to-one to zone numbers.
- The UFH circuit key changed name between versions (`zone_index` → `zone_idx`). Use the one your version expects.
- Three TRVs had no `_class` set in the final schema; ramses_cc filled them from traffic.
- A **phantom gateway** (18:000002, not a real device here) had been learned. It was deleted, and the schema prevents it returning.

## After loading

1. Restart HA.
2. Check each zone appears once, with the right name.
3. No schema errors in the log.
4. The HCC80R appears under its controller; its circuits appear under it.
5. 18:000002 doesn't return.
6. Optional, once stable: enable **"accept packets from known devices only"**.

Published zone names are anonymised.
