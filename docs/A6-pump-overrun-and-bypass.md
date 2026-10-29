# A6 · Pump Overrun and the Missing Automatic Bypass (Likely Non-Compliance)

[← Back to README](../README.md)

Raised by the Resideo course (TRVs, bypasses, pump overrun) and checked against the boiler's own installation manual.

## The boiler
**Ideal Logic+ System S30**, GC 41-750-68, manufactured **11/05/2017**: the **first-generation** Logic+ System (not the later System2, which lists an automatic bypass among its features). Installation and servicing manual: July 2016, UIN 215353.

## What the manual requires
- Where the system has **TRVs on all radiators or two-port valves**, **a bypass circuit with an automatic bypass valve must be fitted**.
- The alternative it gives: radiators totalling **at least 10 % of the boiler's minimum output** (6.1 kW, so about **0.6 kW**) left permanently open on twin lockshield valves.
- Standard features listed: frost protection and a daily pump exercise, with **no** built-in automatic bypass.
- Pump overrun: **2 minutes** after the burner stops.

## This system
| Factor | State |
|---|---|
| Radiators | **HR92 on every radiator** (none permanently open) |
| Zone valves | **Five two-port valves**. TF and MF latched open; UF and both cylinder valves close when satisfied |
| Automatic bypass valve | **None found** in the plant room |

**As built (2017-18):** at the end of every heating period **all five valves closed** and the pump overran into a closed system. The bypass requirement applied from day one.

**Now:** better, not solved. With TF and MF latched open, the radiator circuits stay open unless **every HR92 is shut at once** (a warm house, or hot water only in summer). A latched valve may also not be fully open ([F14](https://github.com/the-control-cabinet/fdd-rules-heating-plant/blob/main/docs/01-rules.md)).

## Evidence still to gather
1. **Boiler fault history** (function + RESTART held 5 s shows the last three faults): look for **L1** (overheat / no-flow lockout). Needs power.
2. A search along the boiler's **flow and return** pipework (and airing cupboard, manifold area) for an ABV.
3. The **Benchmark checklist**, if it survives.

## Remedy (Gas Safe engineer, at the next service)
- Fit an **automatic bypass valve** between flow and return, set per the boiler's minimum flow, **or**
- Put **twin lockshields on one radiator of at least about 0.6 kW** (remove its HR92), ideally one in the hall or landing.

Pre-Evohome radiator valve types (whether a landing radiator was originally TRV-free) are unknown and not recoverable.

## Monitoring hook
FDD rule **F13 (overrun with no flow path)** watches for flow temperature rising during overrun, or a lockout shortly after a call ends, using the boiler flow NTC and the boiler switched-live opto input.
