# Changelog

## [1.2.1] - 2026-10-29
- A8: terminal-level wiring schematics (SVG) for all three stages, alongside the control-logic views.

## [1.2.0] - 2026-10-29
### Added
- A4 Junction box survey and wiring: safe isolation, the four demand paths, 9-way / 6-way / switched-live terminal maps, cable core colours, BDR91 terminals, cylinder panels, colour-misuse findings and the planned tidy-up.
- A5 As-built controls vs Evohome, with a reversal procedure and commissioning tests (from the 2018 notes, corrected by the survey).
- A6 Pump overrun and the missing automatic bypass (Ideal Logic+ System S30 manual requirement, evidence to gather, remedy).
- A7 Immersion backup: Cotherm swap procedure with a bench continuity pre-check.
- A8 Wiring schematics in three stages: as built (2017-18), Evohome (2018 to now, as surveyed), planned 2026 tidy-up with opto taps.
- data/junction-box-terminal-map.csv; survey photos in docs/images (metadata stripped).
### Changed
- Cylinder high-limit cut-out safety check closed (verified in series on both cylinders).
- Design record corrected: UFH relay drives the UF zone valve; TF/MF heads fitted but disconnected with override latched; hot-water relays switch the TS715Si output, so the timer gates hot water.
- A3: CS92 location (top pocket of the element head), heat paste, Cotherm history, cylinder stats as an upper limit.
- Roadmap: bypass, valve position, re-energisation checks and the junction box tidy-up; opto inputs re-scoped. "Center Store" corrected to "Centre Store".

## [1.1.1] - 2026-10-28
- Links to the now-published heating plant monitoring repo.

## [1.1.0] - 2026-10-28
- Roadmap: OpenTherm section replaced by links to the supervisory layer, optimum start/stop, PID rig and OpenTherm control repos.

## [1.0.1] - 2026-10-27
- Gateway firmware version removed from the public docs (fingerprinting hygiene).

## [1.0.0] - 2026-10-26
### Added
- Part A: system design, 2018 installation and commissioning (binding reference), DHW cylinders and sensor placement with an open safety check.
- Part B0: cloud Evohome integration (Aug 2026), two-controller `evohome_1` workaround, cloud limitations, RTL-SDR exploration leading to RAMSES-II.
- Part B: RAMSES-II integration (gateway set-up, schema, HA entities, upgrade, Tx audit, reliability investigation, issues).
- Part C: permanent 5 °C override fault case study (timeline, hypotheses, packet-log audit, fix, RCA, lessons).
- Roadmap: plant-room works (expansion vessels and relief valves, cylinder inlet pressure gauges, tundish sensors, lagging, slow pressure-loss diagnosis), monitoring (boiler CT clamp, BDR91 opto inputs, DHW outlet NTCs), cylinder cut-out verification, gateway connectivity, OpenTherm via DIYLESS/ESPHome with HA logic and PID, plant-room monitoring (separate repo).
### Notes
- RAMSES device IDs masked with consistent placeholders; firmware issue referenced without its number.
- Replaces the planned separate repos `evohome-ramses-rf-integration` and `evohome-5c-override-fault-case-study`.
