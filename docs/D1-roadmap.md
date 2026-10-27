# D1 · Roadmap and Open Items

[← Back to README](../README.md)

## Priority: safety
- [ ] **Verify the unvented cylinders' high-limit cut-outs** are fitted, sensing, and wired in series with each zone valve ([A3](A3-dhw-cylinders-and-sensor-placement.md#️-open-safety-check-unvented-cylinder-high-limit-cut-out)).

## RAMSES-II gateway
- [ ] **Connectivity on a wall adapter: open issue.** Stable on a PC's USB port, unreliable on a wall adapter. Separate supply from Wi-Fi location ([B6](B6-gateway-reliability.md)), then move the stick to a central position.
- [ ] Update the issue raised with the firmware maintainer with the results (no response yet).
- [ ] Copy the September packet logs to permanent storage; review retention.
- [ ] Confirm the upstairs boiler-demand BDR91 (13:000002) is seen in captures.
- [ ] Optional: "accept packets from known devices only".
- [ ] Optional: alert for any zone at or below 5.5 °C, or the sun-and-thermometer override state.

## OpenTherm and advanced boiler control (planned)

**Decision:** a **DIYLESS OpenTherm shield** on an ESP32 (ESPHome) acts as the boiler's **OpenTherm master**, with **Home Assistant running the boiler logic**. The RAMSES-II data (zone demands, setpoints, temperatures, DHW state) is the input.

| Element | Plan |
|---|---|
| Why not Evohome's OpenTherm bridge | Two controllers, but a boiler has one OpenTherm master |
| Control | HA computes the flow-temperature setpoint and on/off from the RAMSES zone demands; ESPHome sends it over OpenTherm |
| Evohome's role | Continues to run zones, TRVs, UFH and DHW scheduling; its BDR91 states and demands become **inputs** |
| Switched lives | Disconnected from the boiler so only one control path is active (no BDR91 vs OpenTherm conflict) |
| Logic | Weather compensation, load compensation from zone demand, then **advanced PID** (anti-windup, rate limits, minimum on and off times) |
| Safety | Boiler-side work done by a competent person and Gas Safe where required; a documented way back to BDR91 control |
| Portfolio links | #8 PID control, #4 optimum start/stop, #6 alarm and trend strategy |

## Plant room: physical works (to do soon)

| # | Item | Purpose |
|---|---|---|
| P1 | **Replace both DHW expansion vessels and both pressure/expansion relief valves** (plumber) | The tundishes drip when hot water is used, which points to failed vessels or relief valves. It also tells us whether the pressure swings seen on the mains are thermal expansion |
| P2 | **Pressure gauges on both cylinders' cold inlets** (0-150 PSI transducers, 0.5-4.5 V) | Logs each unvented cylinder's working pressure. Pressure rising towards the relief setting while heating is a **second, independent diagnosis** alongside the tundish drip sensors |
| P3 | **Tundish drip sensors** on both tundishes (leak plates) | Detect discharge as it happens, and correlate it with cylinder pressure and DHW heating |
| P4 | **Complete the missing pipe lagging** | Cut primary and DHW losses identified in the heat-loss review |
| P5 | **Diagnose the slow heating-system pressure loss** using the newly installed **boiler pressure gauge** | The boiler's own expansion vessel was recharged and its diaphragm isn't leaking, so the loss is elsewhere. Trend the decay rate, then isolate circuits (radiators, UFH, primaries to the cylinders) one at a time to locate it |

## Plant room: monitoring (to do soon)

| # | Item | Purpose |
|---|---|---|
| M1 | **CT clamp on the boiler switched live / supply** into HA | Distinct current levels reveal boiler states (standby, pump only, firing, DHW), independent of what the controllers say |
| M2 | **Opto-isolated inputs on all four BDR91 switched lives** (and the boiler's switched live), installed and set up | Shows exactly which controller and function is calling for heat at any moment. Needed as inputs for the OpenTherm/PID control above |
| M3 | **Strap-on NTC probes on both DHW cylinders' hot outlets**, added to a plant-room ESP32 (board and pins to be allocated) | Measures the actual delivered hot-water temperature, independent of Evohome. Compared with the CS92 (lower pocket) reading it shows the **top-of-cylinder overshoot** expected with a lower probe, confirms each reheat, and supports a weekly check that stored water reaches 60 °C |
| M4 | Flow/return temperatures, pressures and leak plates on the plant-room ESP32s | A full picture of the boiler and primary circuits |

These are being built on dedicated ESP32 boards in the control room and understairs plant space. The monitoring build will be documented in its **own repository** once installed. The items are listed here because they diagnose and feed this heating system.
