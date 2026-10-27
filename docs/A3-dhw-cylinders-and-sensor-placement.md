# A3 · DHW Cylinders and Sensor Placement

[← Back to README](../README.md)

## The cylinders

| Item | Detail |
|---|---|
| Model | **Center Store** unvented indirect, **250 L**, product code 176705 (× 2: left and right) |
| Heat source | Boiler primary circuit through the indirect coil, switched by a 2-port zone valve per cylinder |
| Backup | Immersion heater (normally off; for boiler failure only) |
| Terminal boxes | Two on the front: one at about **¼ height** (immersion element and its thermostat pocket) and one at about **⅗ height** (pocket, no electrics connected) |
| Controlled by | Left cylinder: upstairs controller · Right cylinder: downstairs controller |

## Where the CS92 sensor went, and why

The Evohome **CS92** probe went into the **lower pocket** (about ¼ height), in place of the probes that were already there.

**Reasoning: stratification.** The coil is at the bottom. Water warmed by the coil rises, so hot water collects at the **top first** and the hot layer grows **downwards** as the reheat continues. During a reheat the top is always the hottest part, and the region just above the coil is the last to reach temperature. Water below the coil stays cool.

| Probe position | When it reads "at setpoint" | Result | Side effect |
|---|---|---|---|
| **Lower (¼)** ✅ | **Last**, once the hot layer has reached down to it | The controller only stops when **most of the cylinder** is at temperature, giving full usable volume | The **top can go above setpoint** while the lower part catches up. Keep the DHW setpoint sensible (about 55-60 °C); the high-limit cut-out is the safety backstop |
| Upper (⅗) | **Early**, because the top heats first | The controller stops while the **lower part is still cool**, giving less usable hot water | n/a |

A probe sitting very close to the coil can also be warmed locally, satisfy the controller briefly, then cool as the water mixes, which causes a little zone-valve cycling near the end of a reheat. It's harmless, and it isn't the reason for the lower position.

The lower position matches common guidance to place the DHW sensor about ¼ to ⅓ up the cylinder.

The upper box also has pockets. They were left unused.

## Consequences recorded

- **Immersion backup:** the probes removed from the lower pocket were assumed to belong to the immersion heater circuit. If so, the immersion shouldn't be used as a backup until its own thermostat is correctly refitted.
- **Before Evohome,** cylinder temperature appears to have been controlled by the cylinder's own installer-set thermostat; the occupant only had a timer.

## Open safety check: unvented cylinder high-limit cut-out

> ⚠️ **Safety item:** verify before relying on the system.

An unvented cylinder heated indirectly must have an **overheat (high-limit) cut-out** that shuts the primary zone valve if the water overheats, **whatever** thermostat or controller is in charge. It's usually a manual-reset thermostat that interrupts the zone valve's supply, separate from the temperature-and-pressure relief valve.

**Status:** believed to be still in the zone-valve circuit after the Evohome DHW kit was fitted, but **not yet verified**, and it's not known whether the cut-out is built into the cylinder or a separate device.

**To verify (by a competent person):**
1. Identify the cylinder's high-limit cut-out: usually in a cylinder control box, often with a red **manual reset** button.
2. Confirm its sensing bulb is in a cylinder pocket, not left loose.
3. Confirm it's wired **in series** with the supply to the cylinder's 2-port zone valve, so tripping it closes the valve regardless of the BDR91.
4. Record the result here.

This is a safety item and stays at the top of the [roadmap](D1-roadmap.md) until verified.

## Planned cylinder instrumentation

- **Inlet pressure gauge** on each cylinder's cold feed (0-150 PSI transducer into HA): working pressure, and any rise towards the relief setting during reheat.
- **Tundish drip sensor** on each tundish: catches relief discharge as it happens.
- **Outlet temperature** on each cylinder's hot outlet (strap-on NTC into a plant-room ESP32): the real temperature at the top of the cylinder. Comparing it with the CS92 shows how far the top overshoots the setpoint, and confirms the stratification reasoning above with data.

The pressure gauges and drip sensors together diagnose the current tundish drips (expansion vessels and relief valves, which are being replaced) and give lasting protection monitoring for the unvented system.
