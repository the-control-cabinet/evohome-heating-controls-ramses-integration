# Changelog

## [1.10.0] - 2026-11-19
- B8 §8: the steep zone-to-relay demand curve is Evohome's own: same curve on both controllers and both relay roles with load scaling disabled, following the highest zone; binding ruled out (masked evidence). D1: 19 Nov update and OpenTherm design input (HA decides the UFH relay from real zone demands, Evohome as fallback).
- B9 addendum: the Lounge door-end loop traced to a failed thermal actuator (swap test between zone 2's ports, then open circuit at the bare cores); the HCC80R's red-flashing resync after power-on; output sensor IDs vs names.
- B11 §7: the left hot water relay left unpowered (~15:40-22:13): the controller's fault at 18:40, why nothing alerted, the new hub-fault alert; not-heard threshold 3 h.
- B12: settings 19 Nov (left weekday hot water 06:00-09:30); change log for 19 Nov including the excluded windows and the two open-load trials.
- A6 addendum: the bypass adds flow, not load; flow-starved vs load-limited cycling; the TPI floor.
- README: short version, known issues, roadmap.

## [1.9.0] - 2026-11-18
- A4 §8: junction box Stage 1a as built (17 Nov): Wago bars and joints W1-W8, the W + joint + slot marker scheme, W8 built early so IN8 works now, re-energising and the relays' behaviour after the power cut; open earth-bar items. New data/junction-box-wago-map.csv.
- B8 §7: the 14 Nov output map; stray zones 7/8 identified from the setpoint message and fitted to two wall stats; the per-output broadcast shortening from 016 to 012 (and stopping when idle), and the decoder now reading any length. config/ha-ufh-hcc80r-demand.yaml updated (masked IDs).
- B9 addendum: downstairs advanced load scaling disabled (17 Nov 09:14) with the evidence and the first morning's result; HCC80R binding lessons (green/red slots, a hub binding fills both, the wrong first re-bind caught in the packet log); the Lounge door-end loop.
- B11 §6: per-device "not heard" monitoring (new config/ha-ramses-device-not-heard.yaml and ha-ramses-device-health-card.yaml).
- B12: settings 18 Nov; change log for ALS, the HCC80R clean-up and the junction box isolation.
- D1 update; device inventory (HCC80R outputs since 14 Nov); README short version.

## [1.8.0] - 2026-11-16
- 12-13 Nov detail: docs 02/03/04/05/08/13 addenda (NTC offset, clamp AC check, GPIO6 boiler gauge and gauge boxes, long-term statistics and the daily cold-minimum decay check, inlet span checks with a tyre gauge, ADC-pin filtering lesson, 5 V decoupling, outlet NTC position, mains and inlet-group losses, tundish counter history, GPIO21); hardware/gauge-box; hot water card v4.
- New B10: schedules in Home Assistant: the schedule card, snapshot/restore package and write guards; the 15 Nov hot water write that reported success but was rejected (final ack `FF` vs `00`); the controllers' own DHW record (byte 0 = `01`) vs ramses_rf's (`00`); the "– OVERRIDE" screen title red herring; the read path proven after re-enabling sending and clearing the cache; reported upstream as ramses_cc #1427; card v5/v5.1 (hot water read-only, "sent – not confirmed" + Confirm from hub, override marker) and package v4.
- New B11: RF health: gateway moved to the landing (12 Nov) and signal before/after; the CS92 transceiver hung on the wall (−102 → −67 dBm); single-packet "very weak" readings are glitches; the controllers' own RF comms check (every link tested 5/5 or Excellent) and both fault logs (battery entries; the upstairs controller's ordinary AA cells); jc1 ten-day result (one stall, auto-recovered); radio-gap logger 60 → 120 s.
- New B12: controller settings and change log: 14 Nov (upstairs TPI, downstairs overrun) and 16 Nov (hot water 60 °C both; upstairs priority off, warm weather saver, sunny rooms); hot water windows verified from the controllers' data; decisions and the Sat 21 review.
- B9 addendum: the Lounge/Family loop-label swap confirmed and fixed by rebinding (12 Nov), the stored-schema UFH circuit mapping fix (14 Nov), Utility warmth from the manifold, Hall vs Landing, Family/Dining morning shortfall watch.
- config: evohome-schedule-card.js (v5.1), evohome_schedule_backup.yaml (v4), loader (?v=6), card settings; ha-gateway-automations.yaml gap threshold 120 s. data: rf-comms-check-2026-11-16.csv.
- README: status, short version, document map; D1 roadmap updated.

## [1.7.0] - 2026-11-11 (evening)
- A3 addendum: the low CS92 pocket assessed (evidence, pros and cons, alternatives rejected), stratification readings (negative = artefact), legionella options (60-61 °C setpoint vs weekly pasteurising reheat), new hot water windows, Evohome naming.
- B9: the Lounge/Family loop-label swap hypothesis and the Utility room warming without demand; one-zone-at-a-time loop test.
- D1: legionella decision, left/right mapping checks, loop test, gateway move raised in priority (missed CS92 reports, delayed hub state), cloud integration stall; notifications done.
- Graphs: the evening's UFH chain and zones (B9), the CS92 reports arriving in steps (D1).
- B0: the cloud integration stalling after repeated HA restarts. README: vessels, inlet gauges, tundishes and paste done.

## [1.6.0] - 2026-11-11
- A6: measured short cycling without a bypass (starts, burn lengths, ΔT by condition) and the Ideal manual's bypass requirement; interim options.
- New B9: advanced load scaling Normal → Partial (F9 valve demand and optimum-start leads before/after); the Lounge UFH fault (red sensor slot and heat-going-elsewhere leads).
- A3: CS92 heat-transfer paste, stratification measured with the plant-monitoring outlet NTCs, left/right reheat difference, Centre Store settings (3.5 bar pressure reducing valve and pre-charge, 6 bar expansion relief valve), probe lead extension.
- D1 roadmap: heating-behaviour items and HA notifications.

## [1.5.0] - 2026-11-06
- B6: gateway RF stall diagnosed and fixed in a local build. Tx-off test (no stalls listen-only); serial capture; 0.5.3 / testb / testc / jc1 comparison; testc's debug lines and decoded backtraces (`tx_fifo_work` polling the TX ISR queue in `FRM_TX`: a stuck transmit, not an RX stall); the solid LED is the TX LED; jc1 (PR #44 + safety nets) two nights, ~3,300 transmissions, no stalls. Watchdog section updated to the multi-retry version.
- firmware/ramses_esp-jc1: patch and notes (binary not published); data/firmware-stall-comparison.csv.
- B8 (new): HCC80R demand decoding: per-zone vs per-output messages, the ramses_cc numbering mix-up, MQTT-decoded zone/output sensors plus zone temperature/setpoint sensors, the F9 valve-demand curve, hot water priority and setback/optimum-start observations.
- config/ha-ufh-hcc80r-demand.yaml (HA package) and config/ha-ufh-dashboard-card.yaml; device inventory: HCC80R output allocation.
- README: status, short version and document map.

## [1.4.0] - 2026-11-02
- B6 rewritten: gateway health measured from RF traffic (the MQTT online status can't see outages); the RF stall on the updated firmware (Wi-Fi and MQTT up, `cmd` answers, soft `reset` cures it; same on PC USB and wall adapter); timing pattern; upstream #50 with #48/#49; auto-restart watchdog and the repeat-guard lesson.
- B4: gateway firmware update over USB (browser flasher, addresses, partition check); `!V` reply and the RF stall added to known issues.
- config/ha-gateway-monitoring.yaml, ha-gateway-automations.yaml, ha-gateway-card.yaml; data/gateway-rf-stalls.csv.

## [1.3.0] - 2026-10-31
- A4: core-level map of the 9-way strip and the switched-live joint (ring markers 00-93, cable codes); HCC80R supply confirmed; boiler flex found to have no earth core; cylinder panel and HW relay cable earths cut at entry; tidy-up plan updated (6-way and SL block → Wagos W1-W7 in printed mounts).
- A6: boiler fault history (F1 ×2 slow leak, FU closed isolation valves, no L1) and the Gas Safe visit list.
- A3/A7: cylinder data plate (pressures, element rating, high limit), Cotherm part and cut-out band, immersions one at a time.
- data/junction-box-core-map.csv.

## [1.2.2] - 2026-10-29
- Cylinder boxes clarified: the lower box has two pockets; the upper box is a circular opening with no pocket.

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
