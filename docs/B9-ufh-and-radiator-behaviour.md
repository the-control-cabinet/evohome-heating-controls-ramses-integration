# B9 · UFH and Radiator Behaviour: ALS, Optimum Start and the Lounge Fault

[← Back to README](../README.md)

With trustworthy UFH demand ([B8](B8-ufh-demand-decoding.md)) and the plant-monitoring boiler states, the two hubs' behaviour can be measured rather than guessed.

## Advanced load scaling: Normal → Partial (downstairs hub, 7 Nov 2026)

ALS is set **per hub** and learns **per zone** (heat capacity), adapting over up to a week. Changed on the downstairs (UFH) hub only, with nothing else changed for a week.

| Observation | Normal (before) | Partial (after) |
|---|---|---|
| F9 UFH valve demand at HCC80R ~51% | - | ~16% |
| at ~64-71% | ~30% | ~26-35% |
| at ~75-78% | ~44% | ~52-55% |
| at ~84% | ~70% | ~65% |
| Optimum start lead (Lounge, weekday) | 30 min | 50 min |
| Dining room lead | 10 min | 30 min |

Optimum start (also per hub, learning per zone from heat-up rate, using predicted outside temperature) did **not** reset with the ALS change. Morning shortfalls remain (Dining 17.6-17.9 °C, Family 19.1-19.4 °C in 1-1.5 h windows): candidates are a longer morning period, a longer optimum-start limit (up to 3 h), or a higher setback (a one-zone test is planned, compared on heating degree days and gas use).

## The Lounge fault (from 8 Nov)

Floor stone cold all evening, although:
- the Lounge zone demand was **100%** for hours, HCC80R outputs **1 and 2** at 100% with LEDs on,
- the UFH relay was on continuously, with F9 at 100%, and the boiler firing.

So the controller, the HCC80R's commands and the hot water at the manifold are fine; the fault is **after** the HCC80R, or in its bindings. Two leads:

1. **A direct sensor binding:** during the 3 Nov rebuild, the Lounge T87RF's bind was caught by output 1's **sensor slot** (LED 1 flashing, then solid **red**). A red slot gives that output a second control source. Check: installation mode, step to LED 1's red slot, clear it, re-test.
2. **Heat going elsewhere:** the Family room kept rising after its own demand ended (to 21.1 °C on 9 Nov, 20.7 °C on 8 Nov) while the Lounge was calling. If outputs 1/2 actually open Family loops, the Lounge stays cold and the Family room overshoots. Check: with only the Lounge calling, follow which loops warm at the manifold.

### Evening of 11 Nov: a sharper lead

- The Lounge was at **93-100% demand from 18:00** (HCC80R and F9 at 100%, boiler firing) and rose only **18.0 → 18.7 °C** against 20 °C.
- **Leading hypothesis: the installer's loop labels are swapped between the Lounge and the Family room**, so each zone's outputs drive the other room's loops. That explains the Family room overshooting while the Lounge calls, and the Lounge's slow creep later from the Family room's earlier demand.
- **The Utility room** warmed ~19.3 → 21.2 °C (2.7 K over its 18.5 °C setpoint) with **zero demand all evening**: a second mislabelled loop, heat from the Kitchen, or appliances.
- Kitchen and Family room kept rising after their demand ended (UFH slab lag, partly).

![Evening of 11 Nov: boiler relays and flow/return, the UFH demand chain, zone demand, temperature and setpoint (Lounge calling all evening; Utility warming with no demand)](images/ufh-evening-lounge-utility-2026-11-11.png)

**Test:** one zone at a time (others at minimum, ~20 min each): Lounge, then Family room, then Utility; note which loops' flow pipes warm at the manifold and which rooms they serve. **Fix:** swap the bindings or the actuator plugs, then re-check that the Lounge warms.

Status: open (loop test next).


## Addendum (12-16 Nov 2026)

- **Loop test (12 Nov):** with the Lounge at 25 °C and the Family room held at 12 °C, the *Family room* floor warmed and the Lounge stayed cold: the installer's "Lounge" and "Family room" loop labels were swapped. Fixed without mains work by clearing and rebinding the HCC80R zones (Lounge → outputs 3-4, Family room → 1-2), relabelling, and re-testing (zones 3-4 opened, 1-2 stayed off). The Lounge then warmed 18.4 → 19.4 °C on its first evening and now reaches 20 °C. Optimum start and ALS re-learn by themselves (global settings, no reset).
- **Stored schema (14 Nov):** ramses_cc re-applied an old 1:1 UFH circuit mapping at every restart; the corrected mapping (circuit 00→zone 02 Kitchen, 01→00 Lounge, 02→03 Dining, 03→04 Hall, 04→01 Family, 05→05 Utility) was written into the schema and verified after a restart.
- **Utility room:** warm with no demand and its HCC80R LED off: its own loops are closed; the heat comes from the adjacent manifold and pipework (lagging will cut it).
- **Hall vs Landing:** the Landing (radiators) is always 1-3 K warmer than the Hall below and never falls below ~19.5 °C at its 12 °C setback: heated from below. A Landing setpoint trial (20 → 18 °C) follows the current changes.
- **Morning shortfall watch (from 16 Nov):** Kitchen reaches setpoint; Hall close; **Family room** (19.0 → 19.5 °C vs 20) and **Dining room** (17.6 → 18.4 °C vs 19) fall short after ~3 h at 85-95 % demand. Watched for 3-4 mornings before changing anything (options: earlier start, cold weather boost for those zones, the Dining room's stairwell loss). Both cylinders now reheat until 08:30 in the same period, which is part of the picture.

## Addendum (17-18 Nov 2026): ALS off, and the HCC80R bindings

### Advanced load scaling: Partial → Disabled (downstairs, 17 Nov 09:14)

Two mornings of clean data (16-17 Nov) showed ALS cutting the UFH relay demand progressively as zone demand fell below ~90 %: zones at ~80 % gave a relay demand of ~50 %, zones at ~65 % about 25 %. The relay cycled ~10 minutes on, ~10 off: **49 % duty** while the Dining room asked for ~78 %. Screed UFH responds over hours, so starving the pump and manifold just lengthened the shortfalls.

| Morning | Hub UFH valve demand | UFH relay on, 04:00-08:38 | Family / Dining / Kitchen / Hall at 08:38 |
|---|---|---|---|
| 17 Nov (ALS Partial) | max 56 % | 96 min | 19.4 / 18.1 / 19.9 / 18.9 °C |
| **18 Nov (ALS Disabled)** | **100 %** 04:04-06:21, then following the zones | **195 min** | **20.0 / 18.8 / 20.1 / 18.9 °C** |

On 18 Nov the rooms also started 1-1.6 °C colder (the junction box had been isolated the evening before) and still finished warmer. Shortfall at the end of each morning period: Family −0.4, Dining −0.3, Hall −0.2 °C. A second morning (19 Nov) confirms before the next change.

### HCC80R binding lessons (17 Nov)

- **Each HCC80R zone has two bindings:** in installation mode the zone LED steps through **green** (time program / room setpoint) and **red** (temperature sensor). Clearing a zone means clearing the colour that holds the binding.
- **Zones 7 and 8** held only old **red** (sensor) bindings to the Hall and Utility wall stats. Clearing red removed them completely; outputs 7 and 8 went to 0 and dropped out of the broadcast ([B8](B8-ufh-demand-decoding.md#7-addendum-14-17-nov-2026-new-output-map-and-a-broadcast-that-got-shorter)).
- **A binding made from the hub on green also fills red.** Clearing red on zone 6 (as a test of whether zones 1-6 had leftovers) disconnected Utility completely. Zones 1-5 were left alone: they held only the hub binding.
- **Check the hub's zone before binding.** The first re-bind of zone 6 went to the **Family room** (the hub's bind offer carries its zone index: 01 = Family, 05 = Utility), so the Utility loop would have followed the Family room. Caught in the packet log within minutes, cleared and re-bound to Utility; LED 6 then followed the Utility override.
- After any re-bind: ramses_cc *Clear system state*, then verify from the messages, not the LEDs alone.

### The Lounge (closed 19 Nov: see below)

One of the two Lounge loops (door / front-window end) got **no heat at its actuator** while the other opened. On 18 Nov the Lounge was the only UFH room cooling during its morning (17.9 → 17.7 °C).

## Addendum (19 Nov 2026): the Lounge door-end loop: a failed actuator

**Result:** the door-end loop's thermal actuator had failed **internally**: intermittent first, then open circuit. The HCC80R, its binding, both zone 2 terminal pairs, the plug, the ferrules and the valve were all proven good.

### How it was narrowed down

| Step | Observation | Ruled out |
|---|---|---|
| Lounge override 22 °C (13:35), HA output sensors | Zone demand 100 %; **only output 2** demanded. The Lounge is zone 2 on the 14 Nov map; **both** Lounge actuators land on zone 2's two terminal pairs | Binding. (The output sensors' **entity IDs** still carry pre-14 Nov labels: `…output_1_demand_lounge` is the Kitchen. Read the names, not the IDs.) |
| HCC80R LEDs | On new demand LEDs 1-6 lit briefly, then settled to LED 2 only (matching HA) | A controller fault |
| At the manifold, ~7 min on | One actuator pin up and warm; the door-end one **no pin, cold** | A valve or flow problem: the actuator wasn't opening |
| Resistance, power off, wires out | ~10 kΩ and ~6.5-7 kΩ (PTC heaters, the warm one still cooling) | A broken coil or cable *at rest* |
| Swap the two actuators between zone 2's ports | Both opened… then **the same actuator dropped again** ~40 min later, now in the port the good one had used | The terminal pair and the plug: **the fault followed the actuator** |
| Resistance again, plug removed; then ferrules cut off | **OL** on the bare cores, no change when the cable was flexed at the head | The crimps and the cable entry: the heater inside the head had failed open |

The valve pin was free and the valve dry with the actuator removed. While the actuators were off, one valve's **adapter ring** was found very loose and re-tightened hand-tight.

### The HCC80R after a power cycle

After each power-off the zone LEDs **flash red for several minutes** (no RF contact yet), then settle as the controller's demand messages arrive (power-on ~13:52, settled to zone 2 green by 14:17). The red flashing is expected: no rebinding or button presses needed. Allow for it in any HCC80R work.

### Then (19 Nov)

- **Replacement:** a generic 230 V AC, normally closed, M30 × 1.5, 2-wire actuator of the same style. To fit with fresh ferrules; then check both pins rise and stay up ≥ 30 min with the zone calling, and that the loop shows no flow when the zone is off.
- **Until then** the door-end valve is open and uncontrolled (heats whenever any UFH zone calls). The plant monitoring uses this as an open-load trial: [plant doc 18](https://github.com/the-control-cabinet/heating-plant-monitoring-esphome/blob/main/docs/18-bypass-trials-open-loads.md).

### Lessons

1. **A thermal actuator can read normal cold and still fail warm.** A resistance check at rest isn't proof; watch it open and *stay* open.
2. **Swap test before any meter work:** moving the actuators between two ports separated "output" from "actuator" with no live testing.
3. **When an entity's ID and its name disagree, check the name.** The IDs here kept the pre-14 Nov labels until they were renamed to match on 19 Nov (after a search showed nothing else used them).

## Addendum (20-22 Nov 2026): actuator replaced, the open loop closed as a cure, the Dining sensor

### Replacement actuator (21 Nov)
- Fitted ~15:37: a 230 V AC, normally closed, M30 × 1.5, two-wire thermal actuator of the same style (a DIY-store "Warmer System" part), fresh ferrules into the HCC80R's zone 2 outputs.
- Proven: pin dropped (valve open) with the Lounge calling, rose again when the call ended (~16:55); both Lounge actuators working; normal operation overnight.

### Does an open UFH loop help short cycling? No.
- **A/B test:** Test A (21 Nov, loop open, Hall 22 °C, upstairs off) and Test B (22 Nov, meant to be the Hall with the loop closed; the override went on the **Lounge** by mistake, so its loops were open and calling). Both hours were **one continuous ~55-minute burn**: on a frosty afternoon a cooled screed takes everything, so there was no cycling to change.
- **Data check, 19-22 Nov** (UFH-only burns, the Landing radiator open throughout): loop open, 30 burns, median 3.7 min, 37 % under 3 min; loop closed, 16 burns, median 4.1 min, 12 % under 3 min (colder period). No sign the open loop helped.
- **Why:** once the screed is warm the mixing valve lets in only a trickle of boiler water whatever the loops do, and the boiler's minimum output (6.1 kW) is far above it. UFH-only cycling needs control-side answers: HA deciding the UFH relay from real zone demand, then OpenTherm ([D1](D1-roadmap.md); plant [doc 18](https://github.com/the-control-cabinet/heating-plant-monitoring-esphome/blob/main/docs/18-bypass-trials-open-loads.md)).

### The Dining room "shortfall" is partly where its sensor was
- The Dining T87RF sat at the **bottom of the open stairs**, in the cold downdraught from the floor above. The floor was as warm as the other rooms and a draught could be felt, so the sensor read colder than the room.
- **22 Nov 18:17:** moved to an inside wall at ~1.5 m (temporary fixing); **18:28:** weekday morning setpoint back to 19.0 °C (a 19.5 °C trial from 21 Nov ended). One change judged over Mon-Wed mornings; then the Play room (radiators, at the top of those stairs) matched to the other rooms during heating periods only.

### Lessons
4. **An override is only as good as the zone it lands on.** Check the zone's setpoint in HA after setting a test override.
5. **A thermostat measures its own spot.** In a room with an open stairwell, a sensor in the downdraught makes a warm floor look short.

## Addendum (23-26 Nov 2026): the Dining morning plateau, the Play room and 48-second UFH pulses

### The Dining sensor move made no difference
- Judged 23 Nov: the Dining-Hall gap was about −1.0 °C before and after the move (the 19.6 °C just after the move was hand warmth). The Dining room is genuinely colder: the open stairwell and the double-height ceiling. The wall stat stays at its new spot.

### The Play room at 19 °C (from 23 Nov)
- One change: the Play room (radiators, at the top of the Dining room's stairs) set to 19 °C during its heating periods, so less cold air falls down the stairwell.
- **Evenings:** Dining-Hall gap −0.5/−0.7 °C on the first evening (−1.0/−1.2 the night before); by 24 Nov the Dining evening gap had **closed** (19.2 °C by 19:00, 19.7 at 19:53, setpoint 19; 19.4 at 20:30 on 25 Nov).
- **The Play room's own setpoint drops early by a varying amount** (26 Nov 07:32, 25 Nov 08:12, 24 Nov 08:31; evening 21:03 vs 22:00): that is **optimum stop** on the upstairs controller, not a schedule error. Its optimum start begins ~04:02, two hours before 06:00, and brings the radiator relay on for one room.

### The Dining morning plateau
- Mornings at the end of the period (08:30): −0.9, −0.6, −0.4, −0.6 °C (23-26 Nov). On 26 Nov the room sat at 18.4 °C from 07:00 to 08:29 while the UFH relay ran only **4-5 min in every 20**: the steep zone-to-relay curve ([B8 §8](B8-ufh-demand-decoding.md#8-addendum-19-nov-2026-the-curve-is-evohomes-own-not-the-binding-or-load-scaling)) again, the zone asking moderately and getting a fraction of it.
- **Recommendation (pending):** Dining weekday morning setpoint **19.0 → 19.5 °C**, single change. A larger error lifts the zone into the steeper part of the curve so the relay runs longer; an earlier start would not lift the plateau.

### 48-second UFH pulses
- 25 Nov from 21:04 the UFH relay gave **48-s pulses every 20 min** (21:04:30, 21:24:36, 21:44:42, 22:04:48; 96 s at 20:43), each firing the boiler for 23-46 s. Near setpoint the controller's demand is small and the UFH relay, bound as a heating zone valve, gets **no minimum on time** (that applies to the boiler relay). These pulses are one source of the sub-minute burns.
- The upstairs radiator relay, bound as the boiler relay, never goes below 5 min. Why the two differ, and the plan: [B12](B12-hub-settings-and-change-log.md#relay-roles-and-the-binding-plan-26-nov-2026).

### Radiator short calls
- With one room calling (an Office afternoon, a single radiator), the load is far below the boiler's 6.1 kW minimum: the boiler burns 12-15 min to ~71 °C flow, waits ~90 s (anti-cycle), then relights for under a minute, repeatedly. Both controllers are already at Evohome's slowest settings (3 cycles/h, 5 min minimum on), so there is nothing to change there; the levers are load (the towel rail trial), pump speed (trial from 25 Nov) and, later, OpenTherm modulation.
- The Lounge's occasional overshoot after a long call is stored heat in the screed, not a fault.

### Lessons
6. **Read a zone's setpoint changes as the controller's, not the schedule's.** Optimum stop moves the drop earlier by a different amount each day; check before editing a schedule.
7. **Prove a relay's role from its own timing.** "Comes on the same second as the hot water relay and goes off 5 min before it" identified the boiler relay without opening anything.
