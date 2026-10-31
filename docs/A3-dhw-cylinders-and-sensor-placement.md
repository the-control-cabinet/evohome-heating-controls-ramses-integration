# A3 · DHW Cylinders and Sensor Placement

[← Back to README](../README.md)

## The cylinders

| Item | Detail |
|---|---|
| Model | **Centre Store** unvented indirect, **250 L**, product code 176705 (× 2: left and right) |
| Heat source | Boiler primary circuit through the indirect coil, switched by a 2-port zone valve per cylinder |
| Backup | Immersion heater (normally off; for boiler failure only) |
| Terminal boxes | Two on the front: one at about **¼ height** (immersion element and its thermostat pocket) and one at about **⅗ height** (a circular opening onto the cylinder shell: **no pocket**, no electrics) |
| Controlled by | Left cylinder: upstairs controller · Right cylinder: downstairs controller |

## Where the CS92 sensor went, and why

The Evohome **CS92** probe went into the **lower box** (about ¼ height), in the top of its two pockets, in place of the probes that were already there.

**Reasoning: stratification.** The coil is at the bottom. Water warmed by the coil rises, so hot water collects at the **top first** and the hot layer grows **downwards** as the reheat continues. During a reheat the top is always the hottest part, and the region just above the coil is the last to reach temperature. Water below the coil stays cool.

| Probe position | When it reads "at setpoint" | Result | Side effect |
|---|---|---|---|
| **Lower (¼)** ✅ | **Last**, once the hot layer has reached down to it | The controller only stops when **most of the cylinder** is at temperature, giving full usable volume | The **top can go above setpoint** while the lower part catches up. Keep the DHW setpoint sensible (about 55-60 °C); the high-limit cut-out is the safety backstop |
| Upper (⅗) | **Early**, because the top heats first | The controller stops while the **lower part is still cool**, giving less usable hot water | n/a |

A probe sitting very close to the coil can also be warmed locally, satisfy the controller briefly, then cool as the water mixes, which causes a little zone-valve cycling near the end of a reheat. It's harmless, and it isn't the reason for the lower position.

The lower position matches common guidance to place the DHW sensor about ¼ to ⅓ up the cylinder.

The upper box has **no pocket**: just a circular opening onto the cylinder shell. A sensor there would also read too high for the reason above.

## Where the CS92 physically sits (surveyed Oct 2026)

The lower box is the **immersion element head**, with **two pockets**:

| Pocket | Holds | Notes |
|---|---|---|
| **Top** | The **CS92** since 2018 | Originally the immersion's **Cotherm** element control (rod + capillary). Fitted **without heat-transfer paste**, which slows its response: add paste and plug the pocket mouth with insulation |
| **Bottom** | The **boiler-control module's** stat and **overheat cut-out** probes | Safety-critical; nothing else goes in here |

## Consequences recorded

- **Immersion backup:** the probes removed in 2018 were the immersion's **Cotherm combined thermostat and safety cut-out**. Both Cotherms have been out since then, so the immersions are **disconnected** (switches labelled, the "Water heater" B16 RCBO off). The CS92 and the Cotherm can't share the top pocket, so using the immersion means a **swap**: see [A7](A7-immersion-backup-swap-procedure.md).
- **Before Evohome,** cylinder temperature was set by each cylinder's **boiler-control module** (adjustable stat), enabled by the Danfoss TS715Si timer. Those stats are **still in circuit** in series with the Evohome relays, so the module's dial acts as an upper limit on top of the Evohome DHW setpoint: set it at or above the Evohome setpoint.

## Safety check: unvented cylinder high-limit cut-out ✅ closed

An unvented cylinder heated indirectly must have an **overheat (high-limit) cut-out** that shuts the primary zone valve if the water overheats, **whatever** controller is in charge.

**Verified 29 Oct 2026, both cylinders:** each panel's **boiler-control module** (adjustable stat + **manual-reset** cut-out) is fitted, its probes are in the element head's bottom pocket, and it is wired **in series with the cylinder's valve motor** (HW BDR91 output → panel → zone valve). A tripped cut-out closes the valve regardless of the BDR91. Full trace in [A4](A4-junction-box-survey-and-wiring.md#5-cylinder-wiring-panels).

## Planned cylinder instrumentation

- **Inlet pressure gauge** on each cylinder's cold feed (0-150 PSI transducer into HA): working pressure, and any rise towards the relief setting during reheat.
- **Tundish drip sensor** on each tundish: catches relief discharge as it happens.
- **Outlet temperature** on each cylinder's hot outlet (strap-on NTC into a plant-room ESP32): the real temperature at the top of the cylinder. Comparing it with the CS92 shows how far the top overshoots the setpoint, and confirms the stratification reasoning above with data.

The pressure gauges and drip sensors together diagnose the current tundish drips (expansion vessels and relief valves, which are being replaced) and give lasting protection monitoring for the unvented system.

## Cylinder data plate (both cylinders)

| Item | Value |
|---|---|
| Model | Centre Store unvented indirect 250 L (Wolseley, product code 176705) |
| Max mains pressure | 16 bar |
| Operating pressure / pressure reducing valve | 3.5 bar |
| Rated pressure | 7 bar |
| Expansion vessel charge | **3.5 bar** |
| Expansion relief valve | **6 bar** |
| Temperature/pressure relief valve | 90 °C / 10 bar |
| Max primary circuit pressure | 3 bar |
| Coil rating | 18 kW (primary flow 15 L/min at 80 °C) |
| **Immersion** | **One element: 3 kW at 240 V / 2.8 kW at 230 V** |
| Thermostat high limit | 85 °C (+4 / −6) |
| Heat loss | 2.22 kWh/day at 65 °C |

**Tundish drips:** with the expansion vessel charged at 3.5 bar, a vessel that has lost charge makes the expansion relief valve (6 bar) lift on each heat-up. Check the vessel charge first.

**Immersions share one circuit:** both cylinders' immersions are fed from the **Water heater B16 RCBO** via two double-pole isolators. Each element draws about 12 A, so **use one at a time** (both together would be about 24 A on a 16 A circuit).
