# B12 · Controller Settings and Change Log

[← Back to README](../README.md)

One change at a time, each with a time stamp, so the data can say what each change did. Change points are reviewed against boiler starts, burn lengths and room temperatures.

## Current settings (16 Nov 2026)

| Setting | Upstairs (radiators, left cylinder) | Downstairs (UFH, right cylinder) |
|---|---|---|
| Cycle rate / minimum on time | 3/h / 5 min (was 6/h / 1 min) | 3/h / 5 min |
| Advanced load scaling | Disabled (review parked) | Partial (since 7 Nov) |
| Optimum start / stop | On, max 2 h / on | On, max 3 h / on |
| Hot water setpoint / differential / overrun | **60 °C** (was 58) / 5 K / 5 min | **60 °C** (was 58) / 5 K / 5 min (was 0) |
| Hot water priority | **Disabled** (was enabled) | Disabled |
| Warm weather saver | **All zones** | Lounge, Family, Utility, Dining |
| Sunny rooms | **Master Bedroom, Bedroom 3, Guest Bath** | Off (Family/Lounge to enable after the morning watch) |
| Cold weather boost | Off | Off |
| Hot water windows | Mon-Fri 06:00-08:30 + 18:30-21:00; Sat/Sun 06:00-10:00 + 18:30-21:00 (both cylinders, verified from the controllers' data) | same |

## Change log

| When | Change | Why |
|---|---|---|
| 14 Nov 22:45 | Upstairs cycle rate 6 → 3/h, min on 1 → 5 min; downstairs hot water overrun 0 → 5 min | Fewer, longer burns; give the pump overrun somewhere to go (no bypass yet) |
| 15 Nov | Weekend hot water 06:00-10:00 (app/controller) | Later showers at weekends; the downstairs Saturday did not stick until 16 Nov |
| 16 Nov ~10:22 | Weekday hot water morning end 07:30 → 08:30 (both) | Showers ~07:20 emptied the right cylinder and the window closed mid-reheat |
| 16 Nov 12:07-12:11 | Hot water 58 → 60 °C (both); upstairs priority disabled; upstairs warm weather saver on (all zones); upstairs sunny rooms (three rooms) | HSE storage guidance (≥ 60 °C); weekly high-temperature heat not yet possible from HA; ~£5-8/yr extra standing loss estimated |

## Decisions and reasoning

- **60 °C rather than 58 °C + weekly boost:** at 58 °C with a 5 K differential a cylinder can sit near 53 °C before reheating; the weekly heat would need HA to write hot water parameters, which is not proven ([B10](B10-schedules-in-home-assistant.md)). Differential 5 K and overrun 5 min kept (smaller differential = more boiler starts; overrun matters without a bypass).
- **Cold weather boost stays off:** radiators recover quickly and optimum start already brings starts forward; a boost mainly adds early-morning starts. Considered for the Family room/Dining room only if they stay short after the morning watch.
- **Sunny rooms downstairs** was switched on and straight back off: the Family room is under a morning-shortfall watch, and a new variable would make the result ambiguous.
- **Review (Sat 21 Nov):** treat 14 Nov 22:45 and 16 Nov 12:11 as separate change points.

## Controller review, first pass (14 Nov 2026)

- **Guest Bedroom, Guest Bathroom and Studio** are in permanent override at 12 °C (intentional for unused rooms; the schedule card now marks them).
- **The Kitchen zone's sensor is the downstairs controller itself**, which explains a 27.6 °C Kitchen spike at 17:00 (cooking/sun near the controller). Options: move the controller or bind a separate T87RF to the Kitchen.
- **One en-suite uses its HR92 as the zone sensor** (reads warm near the radiator).
- All zones: open-window function on, local override on, multiroom off; both controllers in Auto. Optimum start/stop, ALS and relay settings are not exposed over RAMSES-II, so they were photographed from the installer screens.

## Other trials and observations

- **Play room schedule trial (from 12 Nov):** 18.5 °C 06:00-08:30 and 16:30-22:00 (was 17 °C from 18:00), plus a Sat/Sun period overlapping the Dining room's midday UFH (15 Nov), to cut heat loss up the open stairs from the Dining room. Review ~Wed 18 Nov.
- **UFH manifold dial gauge** (pump outlet to flow manifold) read 1.15 bar running vs ~1.27 bar at the boiler two floors above; expected ~1.8 bar static plus pump head: likely reading low or stuck. Check with the pump off against HA's boiler pressure; a manifold pressure sensor will replace it.
