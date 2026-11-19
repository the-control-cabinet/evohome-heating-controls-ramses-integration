# B12 · Controller Settings and Change Log

[← Back to README](../README.md)

One change at a time, each with a time stamp, so the data can say what each change did. Change points are reviewed against boiler starts, burn lengths and room temperatures.

## Current settings (19 Nov 2026)

| Setting | Upstairs (radiators, left cylinder) | Downstairs (UFH, right cylinder) |
|---|---|---|
| Cycle rate / minimum on time | 3/h / 5 min (was 6/h / 1 min) | 3/h / 5 min |
| Advanced load scaling | Disabled (review parked) | **Disabled** (since 17 Nov 09:14; Partial from 7 Nov) |
| Optimum start / stop | On, max 2 h / on | On, max 3 h / on |
| Hot water setpoint / differential / overrun | **60 °C** (was 58) / 5 K / 5 min | **60 °C** (was 58) / 5 K / 5 min (was 0) |
| Hot water priority | **Disabled** (was enabled) | Disabled |
| Warm weather saver | **All zones** | Lounge, Family, Utility, Dining |
| Sunny rooms | **Master Bedroom, Bedroom 3, Guest Bath** | Off (Family/Lounge to enable after the morning watch) |
| Cold weather boost | Off | Off |
| Hot water windows | Mon-Fri **06:00-09:30** + 18:30-21:00 (since 19 Nov); Sat/Sun 06:00-10:00 + 18:30-21:00 | Mon-Fri 06:00-08:30 + 18:30-21:00; Sat/Sun 06:00-10:00 + 18:30-21:00 |

## Change log

| When | Change | Why |
|---|---|---|
| 14 Nov 22:45 | Upstairs cycle rate 6 → 3/h, min on 1 → 5 min; downstairs hot water overrun 0 → 5 min | Fewer, longer burns; give the pump overrun somewhere to go (no bypass yet) |
| 15 Nov | Weekend hot water 06:00-10:00 (app/controller) | Later showers at weekends; the downstairs Saturday did not stick until 16 Nov |
| 16 Nov ~10:22 | Weekday hot water morning end 07:30 → 08:30 (both) | Showers ~07:20 emptied the right cylinder and the window closed mid-reheat |
| 16 Nov 12:07-12:11 | Hot water 58 → 60 °C (both); upstairs priority disabled; upstairs warm weather saver on (all zones); upstairs sunny rooms (three rooms) | HSE storage guidance (≥ 60 °C); weekly high-temperature heat not yet possible from HA; ~£5-8/yr extra standing loss estimated |
| 17 Nov 09:14 | **Downstairs advanced load scaling Partial → Disabled** | ALS cut the UFH relay to ~49 % duty with zones asking ~78 %; first result: relay on 195 vs 96 min, rooms warmer by 08:38 ([B9](B9-ufh-and-radiator-behaviour.md#addendum-17-18-nov-2026-als-off-and-the-hcc80r-bindings)) |
| 17 Nov ~09:57-12:13 | HCC80R: stray zones 7/8 cleared; zone 6 re-bound to Utility (after a wrong first bind to the Family room); ramses_cc system state cleared | Old sensor bindings were driving outputs 7/8 ([B8](B8-ufh-demand-decoding.md#7-addendum-14-17-nov-2026-new-output-map-and-a-broadcast-that-got-shorter)) |
| 17 Nov 16:50-21:08 | Junction box isolated; Stage 1a Wago rewire, opto board connected, clamp 2 turns | [A4 §8](A4-junction-box-survey-and-wiring.md#8-stage-1a-as-built-17-nov-2026); boiler states v3 live the same day (plant monitoring repo) |
| 19 Nov ~10:58 | **Upstairs (left cylinder) weekday morning window 06:00-08:30 → 06:00-09:30** | A big draw at ~08:38 (showers as late as ~09:00) left the left cylinder's probe at 11 °C after the window had closed |
| 19 Nov ~11:00 | HA: RAMSES not-heard threshold 6 → 3 h | Longest normal silence over the first nights was ~2 h ([B11 §6](B11-rf-health-and-hub-checks.md#6-per-device-not-heard-monitoring-16-nov)) |
| 19 Nov 13:35-15:27 | Lounge override 22 °C; HCC80R powered off ~13:52 and ~14:50-15:05 | Lounge actuator diagnosis ([B9](B9-ufh-and-radiator-behaviour.md#addendum-19-nov-2026-the-lounge-door-end-loop-a-failed-actuator)). **Excluded window** for UFH data |
| 19 Nov 14:41 → | Lounge door-end UFH loop **open, uncontrolled** (failed actuator removed) | Until the replacement is fitted; used as an open-load trial |
| 19 Nov ~15:40-22:13 | Left hot water BDR91 **unpowered** (off its backplate after mounting work); evening reheat missed; 1-hour boost from ~22:15 | [B11 §7](B11-rf-health-and-hub-checks.md#7-a-hot-water-relay-left-unpowered-19-nov). **Excluded window** for left cylinder data |
| 19 Nov ~19:15 ± 30 min → | Far-end Landing radiator **fully open** (HR92 and adapter removed; HR92 left powered nearby; zone still on its T87RF) | Open-load (bypass radiator) trial against radiators-only short cycling |

## Decisions and reasoning

- **60 °C rather than 58 °C + weekly boost:** at 58 °C with a 5 K differential a cylinder can sit near 53 °C before reheating; the weekly heat would need HA to write hot water parameters, which is not proven ([B10](B10-schedules-in-home-assistant.md)). Differential 5 K and overrun 5 min kept (smaller differential = more boiler starts; overrun matters without a bypass).
- **Cold weather boost stays off:** radiators recover quickly and optimum start already brings starts forward; a boost mainly adds early-morning starts. Considered for the Family room/Dining room only if they stay short after the morning watch.
- **Sunny rooms downstairs** was switched on and straight back off: the Family room is under a morning-shortfall watch, and a new variable would make the result ambiguous.
- **Review (Sat 21 Nov):** treat 14 Nov 22:45 and 16 Nov 12:11 as separate change points; on 19 Nov, judge the Landing radiator on radiators-only burns and the Lounge loop on UFH-only burns, never on periods when both call.

## Controller review, first pass (14 Nov 2026)

- **Guest Bedroom, Guest Bathroom and Studio** are in permanent override at 12 °C (intentional for unused rooms; the schedule card now marks them).
- **The Kitchen zone's sensor is the downstairs controller itself**, which explains a 27.6 °C Kitchen spike at 17:00 (cooking/sun near the controller). Options: move the controller or bind a separate T87RF to the Kitchen.
- **One en-suite uses its HR92 as the zone sensor** (reads warm near the radiator).
- All zones: open-window function on, local override on, multiroom off; both controllers in Auto. Optimum start/stop, ALS and relay settings are not exposed over RAMSES-II, so they were photographed from the installer screens.

## Other trials and observations

- **Play room schedule trial (from 12 Nov):** 18.5 °C 06:00-08:30 and 16:30-22:00 (was 17 °C from 18:00), plus a Sat/Sun period overlapping the Dining room's midday UFH (15 Nov), to cut heat loss up the open stairs from the Dining room. Review ~Wed 18 Nov.
- **UFH manifold dial gauge** (pump outlet to flow manifold) read 1.15 bar running vs ~1.27 bar at the boiler two floors above; expected ~1.8 bar static plus pump head: likely reading low or stuck. Check with the pump off against HA's boiler pressure; a manifold pressure sensor will replace it.
