# 06 · Lessons and Controls

[← Back to README](../README.md)

## Controls now in place

| Control | Why |
|---|---|
| Only the released (standalone MQTT broker) mode of ramses_cc on the live system | No in-development code paths on live plant |
| Gateway introduced **read-only first** (Tx off), then Tx enabled deliberately after a stable period | Prove listening before allowing writes |
| Audit command for every non-read packet from the gateway | Every write is visible and attributable |
| Packet logs retained, with the fault-period logs kept separately | Evidence for any future incident |
| Never use HVAC *off*, *Heating Off* or *Day Off* presets from HA | Avoid system-wide writes from a supervisor |
| Avoid ramses_cc's schedule-download service | Known to stall transmit until a full HA restart |
| Watch for a sun-and-thermometer icon or any zone at 5 °C | Early detection |

## Lessons (BMS relevance)

1. **The same word can hide different mechanisms.** "Override" covered a user override and a stuck stored state. On a BMS head-end, an operator override, a priority-array write and a controller fallback can all look like "manual". Check which priority or mechanism is in force.
2. **Test at the trigger event.** The fault only appeared at switchpoints, so every test had to wait for one. Commissioning schedules, optimum start and occupancy logic is the same: verify at the transition.
3. **Audit before you accuse.** The newest device was the obvious suspect; its transmit log showed it never sent the offending command.
4. **Least-invasive fix first.** A one-zone trial, then all zones, and never a full factory reset.
5. **Trust the field device's acknowledgement.** The HCC80R's LED, not the controller's "success".
6. **Change control on live plant:** released software, read-only commissioning, logged writes, rollback options.
7. **Separate proven from unproven in the write-up.** It keeps the record useful, and honest, for whoever deals with the next incident.
