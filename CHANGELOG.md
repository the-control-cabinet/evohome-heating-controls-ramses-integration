# Changelog

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
