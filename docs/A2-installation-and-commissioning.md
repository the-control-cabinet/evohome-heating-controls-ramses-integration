# A2 · Installation and Commissioning (2018)

[← Back to README](../README.md)

Self-installed in 2018. The same procedures were used again in October 2026 to recover from the [5 °C fault](C1-fault-case-study.md).

## Order of work

1. **Relays first:** fitted the BDR91s at the external junction box in place of the old timer and room-stat switching (230 V; isolated, tested dead). One per controller for boiler demand; one per controller from each DHW kit for the cylinder zone valve.
2. **Controllers:** sited, powered, zones created and named.
3. **Bind each zone's actuators and sensor** (below).
4. **Bind the system devices:** each controller's boiler-demand BDR91, DHW BDR91 and CS92.
5. **Schedules** entered per zone and DHW; cloud (Total Connect Comfort) linked.
6. **Verify:** each zone calls for heat at a switchpoint; the relays click; the boiler fires; DHW heats and stops at setpoint.

## Binding reference

| Device | How it binds | Trap |
|---|---|---|
| **HR92 TRV** | Controller in "bind actuator" for the zone, then trigger bind on the TRV | Zones with two TRVs need both bound |
| **T87RF wall stat** | No bind button: binding is started from its **touch zones**. In zone settings choose it as **remote sensor** (not the controller's own sensor) | Without "remote sensor" the controller keeps using the TRV's reading |
| **BDR91** | Start the bind from the controller's system or DHW device menu, then press the BDR91's bind button (per Honeywell's instructions) | Each DHW kit's BDR91 belongs to the DHW function, not heating |
| **CS92** | Bind from the controller's DHW set-up | n/a |
| **HCC80R zone actuator** | Transmit button on the HCC80R: all LEDs yellow, then each press selects the next zone (its LED **flashes green**). Then "bind actuator" on the controller | The controller says **"success" before the HCC80R accepts**. The real confirmation is the zone LED going **solid amber** |

## Zone settings used

| Setting | Value | Why |
|---|---|---|
| Local override | **Enabled** (all zones) | Lets a wall stat set a temporary setpoint until the next switchpoint (shown with a clock icon) |
| Sensor | Remote (T87RF) where fitted | Measured room temperature, not radiator-side |

## Challenges met

| Challenge | Resolution |
|---|---|
| Two controllers in one house | Treated as two independent systems, each with its own boiler call, DHW and zones |
| Underfloor controller forgotten after years | Rediscovered the HCC80R and HCS80 at the manifold; re-learned its binding (above) |
| Old controls in the junction box | BDR91s wired into the existing switched-live terminals; boiler untouched |
| Cylinder sensor position | Lower pocket chosen, with reasoning in [A3](A3-dhw-cylinders-and-sensor-placement.md) |
| Zone names | Later found to matter: integrations matched zones by the controller's exact spelling |
