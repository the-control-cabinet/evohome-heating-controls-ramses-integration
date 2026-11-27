# B12 · Controller Settings and Change Log

[← Back to README](../README.md)

One change at a time, each with a time stamp, so the data can say what each change did. Change points are reviewed against boiler starts, burn lengths and room temperatures.

## Current settings (26 Nov 2026)

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
| Second BDR91 role | **Boiler relay** (13:000002, appliance control) | **Heating zone valve** (13:000004, UFH) |
| Hot water windows | Mon-Fri **06:00-09:30** + 18:30-21:00 (since 19 Nov); Sat/Sun 06:00-10:00 + 18:30-21:00 | Mon-Fri **06:00-09:30** + 18:30-21:00 (since 22 Nov); Sat/Sun 06:00-10:00 + 18:30-21:00 |

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
| 19 Nov ~19:15 ± 30 min → 22 Nov ~17:50 | Far-end Landing radiator **fully open** (HR92 and adapter removed; HR92 left powered nearby; zone still on its T87RF) | Open-load (bypass radiator) trial against radiators-only short cycling: median burn 1.8 → 2.8 min |
| 21 Nov ~11:58-12:05 | Home Assistant 2026.11.2; `evohome_1` rebuilt from that release first ([B4](B4-upgrade-and-known-issues.md#home-assistant-202611-and-the-evohome_1-copy-21-nov-2026)) | Core Evohome moved to evohome-async 3.1.0 |
| 21 Nov ~14:38 | Dining weekday morning 19 → 19.5 °C (trial) | Morning shortfall; ended 22 Nov once the sensor position was found to be the main cause |
| 21 Nov 14:41-15:42 | Test A: upstairs Heating Off, Hall 22 °C override | Lounge loop A/B test. **Excluded window** |
| 21 Nov ~15:37 | Lounge door-end actuator replaced; proven ~16:55 | [B9](B9-ufh-and-radiator-behaviour.md#addendum-20-22-nov-2026-actuator-replaced-the-open-loop-closed-as-a-cure-the-dining-sensor) |
| 22 Nov 14:46-15:46 | Test B: upstairs Heating Off; 22 °C override set on the **Lounge** by mistake (meant the Hall) | **Excluded window** |
| 22 Nov ~17:50 → | Landing HR92 refitted; **master en-suite towel rail fully open** (TRV head off, kept powered in the room) | Second open-load trial (smaller, warmth welcome there) |
| 22 Nov 18:17 | Dining T87RF moved off the bottom of the stairs (inside wall, ~1.5 m, temporary) | It sat in the stairwell downdraught |
| 22 Nov 18:28 | Dining weekday morning back to 19.0 °C | One change at a time: judge the sensor move first |
| 22 Nov 18:29 | **Downstairs (right cylinder) weekday morning window 06:00-08:30 → 06:00-09:30** | Same reason as the left on 19 Nov: late showers; "reheat cut short" at 10:41 |

| 22 Nov evening | Play room schedule: start 05:00 → 06:00, finish 23:00 → 22:00 | Optimum start was firing the radiators (and the boiler) from ~03:00 for one room |
| 22 Nov ~19:03 | Plant alert "boiler failed ignitions" re-enabled (off since 15 Nov) | Plant monitoring repo, doc 15 |
| 23 Nov ~09:20 | **Play room 19 °C** in its heating periods (weekdays 06:00-08:30 + 15:00-22:00; weekends 06:00-08:30, 11:30-14:00, 15:00-22:00), single change | The Play room is at the top of the Dining room's open stairs: a cold room upstairs feeds the downdraught. Judged on Dining mornings and evenings |
| 23 Nov ~09:39 | All 20 schedules read back from the controllers and recorded ([data/evohome-schedules-record-2026-11-23.txt](../data/evohome-schedules-record-2026-11-23.txt)) | Baseline after the 16-23 Nov changes. Dining's weekday morning period is only 07:30-08:30, so optimum start pre-heats from ~04:30 |
| 25 Nov 21:03 | Boiler installer menu: pump minimum speed **P7 (70 %) → P1 (100 %)**, trial | Plant monitoring repo, doc 16 §12. The long-burn flow-return gap fell from 15-17 K to 12-15 K, so the pump had been on 70 %. Revert = select P7 |
| 26 Nov 19:33 | **Dining weekday morning 19.0 → 19.5 °C**, single change | Mornings still plateaued 0.4-0.6 °C short with the UFH relay at 4-5 min per 20 ([B9](B9-ufh-and-radiator-behaviour.md#addendum-23-26-nov-2026-the-dining-morning-plateau-the-play-room-and-48-second-ufh-pulses)). First morning (27 Nov): 19.0 by 07:03, 19.2 held 07:31-08:19 (was 18.4) |
| 26 Nov 14:24-14:50 | **Relay-role test:** left hot water override with no radiator zone calling (first run void: the Office was calling; clean rerun 14:37) | Proved the upstairs radiator BDR91 is the boiler relay ([below](#relay-roles-and-the-binding-plan-26-nov-2026)). **Excluded window** for left cylinder and radiator data |

## Current trials (26 Nov)
- **Master en-suite towel rail fully open** (since 22 Nov ~17:50): radiators-only burns over the first day, median **6.0 min, 27 % under 3 min** (Landing radiator period 2.8 min / 63 %; before 1.8 min / 76 %). Provisional: colder weather lengthens burns, so it is rechecked at like return temperatures.
- **Pump at 100 %** (since 25 Nov 21:03): judged on long-burn flow-return gaps and short-burn counts; the flow temperature test follows it (one change at a time).
- **Play room 19 °C** (since 23 Nov): Dining-Hall gap first evening −0.5/−0.7 °C vs −1.0/−1.2; Dining evening gap closed by 24 Nov (19.2 by 19:00, setpoint 19). Dining **mornings** plateaued ~0.4-0.6 °C short, so the weekday morning setpoint went to **19.5 °C on 26 Nov** (first morning 19.2 held, +0.8 °C on the day before); see [B9](B9-ufh-and-radiator-behaviour.md#addendum-23-26-nov-2026-the-dining-morning-plateau-the-play-room-and-48-second-ufh-pulses).

## Relay roles and the binding plan (26 Nov 2026)

Each controller has a hot water BDR91 for its cylinder's zone valve and a second BDR91 for heating. On an Evohome controller that second relay can be bound as the **boiler relay** (appliance control) or as a **heating zone valve**. The two controllers here differ, and the data showed it.

| | Upstairs (radiators, left cylinder) | Downstairs (UFH, right cylinder) |
|---|---|---|
| Hot water relay | 13:000001 on the left cylinder's zone valve | 13:000003 on the right cylinder's zone valve |
| Second relay | **13:000002 = boiler relay**, wired straight to the boiler switched live (the radiator valve heads are latched open, not live) | **13:000004 = heating zone valve**, on the UFH zone valve; its end switch fires the boiler |
| Switches for hot water calls? | **Yes**: on with the left hot water relay, off 5 min before it (the hot water overrun) | No: on for only 41 % of right hot water time, 0 % on 22-25 Nov |
| Minimum on time applied? | **Yes**: its on-times never go below 5 min | **No**: 48-s pulses seen near setpoint (25 Nov 21:04-22:05), each firing the boiler for 23-46 s |

**How it was proven:**
1. **History, 13-25 Nov:** the left hot water relay came on and the radiator relay came on **the same second**, also outside heating periods (e.g. 18 Nov 08:11:59, 19 Nov 22:16:57); the radiator relay went off **exactly 5 min** before the left one (17 Nov 08:07:58/08:12:58, 19 Nov 23:12:57/23:17:57, 22 Nov 09:36:54/09:41:54). It was on for 92 % of left hot water time (one unexplained 28-min gap, 22 Nov evening). The installer screens read "appliance control: wireless relay box" (14 Nov photos), and the stored schema has `appliance_control: 13:000002`.
2. **Test, 26 Nov:** a left hot water override in the afternoon with no radiator zone calling. The first run was void (the Office zone was calling). Clean rerun: radiator relay on 14:37:50, left relay and its valve end switch 14:38:51; cancelled ~14:44: radiator relay off 14:44:50, the left valve due off 5 min later. In the first run the burner kept firing to 14:35:50, through the 5-min overrun, because the left valve's end switch still calls the boiler: the overrun only works as Evohome intends once firing no longer runs through the end switches.

**Why the rooms don't overheat:** with the radiator valve heads latched open, a left cylinder reheat also runs the radiator pump path; each radiator's HR92 still closes when its room is warm.

**Plan (agreed 26 Nov):**

| Phase | Upstairs | Downstairs |
|---|---|---|
| **Now** | 13:000002 stays **boiler relay**: there is no zone valve to absorb short pulses, and it keeps the 5-min minimum on time | No change: hot water valve + UFH heating zone valve |
| **Phase 2** (automatic bypass fitted, TF/MF radiator valve heads re-powered from 13:000002) | Rebind 13:000002 as a **heating zone valve**, so both controllers use the standard S-plan binding (zone valves, end switches fire the boiler). Expect somewhat more short calls (no minimum on time), partly absorbed by valve travel | No change |
| **Phase 3** (HA / OpenTherm control) | Home Assistant fires the boiler with its **own minimum on time**; the controllers' cycle rate and minimum on time no longer set the burn length | Same |

Dropped: a trial of the UFH relay as boiler relay (it would open the UFH valve and run the manifold pump on every right cylinder reheat), and an upstairs zone-valve trial before Phase 2. Both controllers stay at 3 cycles/h and 5 min minimum on (Evohome's slowest settings).

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
