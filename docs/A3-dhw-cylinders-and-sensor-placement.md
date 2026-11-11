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

## Update, 11 Nov 2026: paste, stratification and the cylinders' settings

- **Heat-transfer paste** added to both CS92 probes: the pockets are wider than the probes, so the gap was air. A thin coat on the probe, pushed home and nudged against the pocket wall, makes the probe follow the water faster (visible during reheats, not at steady temperature).
- **Stratification** is now measured: plant-monitoring outlet NTCs at the top, the CS92 at the bottom. After morning showers: top ~45-49 °C, bottom ~14-15 °C. The CS92's low position means Evohome reheats by **volume used**, and the reheat itself mixes the cylinder back to ~58 °C. Overnight loss at the bottom probe ~5 K in ~10 h.
- **Left vs right:** the left cylinder's bottom peaked ~51 °C against ~56 °C on the right. Being checked: probe contact (paste) versus the cylinder's own stat (dial 1-5 = 30-70 °C, position 4 ≈ 60 °C) cutting off before Evohome's 58 °C. Test: relay still on while that cylinder stops warming.
- **Centre Store Unvented Indirect 250 L settings** (installation manual): PRV **3.5 bar**, vessel pre-charge **3.5 bar** (24 L), expansion relief **6 bar**, T&P **90 °C / 10 bar**. Intermittent expansion-valve discharge on warm-up = vessel charge below 3.5 bar. Both vessels and relief valves replaced 11 Nov.
- **Probe leads** extended ~2 m (18 AWG twin, Wagos; out of Honeywell's 1.5 m spec but electrically negligible for a resistive probe), transceivers on backplates near the cylinders.

## Addendum, 11 Nov 2026 (evening): probe position, stratification readings and legionella

Cross-reference: [plant monitoring, doc 14](https://github.com/the-control-cabinet/heating-plant-monitoring-esphome/blob/main/docs/14-hot-water-stratification.md).
from heating-plant-monitoring-esphome docs/14).

### Context
- Two Centre Store Unvented Indirect 250 L cylinders. Each has one usable sensor pocket, low down
  (about a quarter of the way up). The upper panel has a sensor housing but no pocket behind it.
- The Evohome CS92A probes (07:045307 left, 07:040975 right) took over the pockets used by the
  immersion thermostats, so the immersions were isolated and labelled "disconnected".
- Probes refitted with heat-transfer paste on 11 Nov 2026.
- The top of each cylinder is observed with a strap-on, lagged NTC on the hot outlet pipe
  (left GPIO9, right GPIO8 after the 11 Nov swap). At rest it reads below the water; during and just
  after a draw it reads the true top within about 1-2 K.

### Evidence (11 Nov 2026)
- After a full reheat (setpoint 58 C) the bottom probes read 59.1-60.3 C (1-2 K overshoot from the
  heat left in the coil and primary pipework after the valve closed).
- Single draws captured the tops at about 56.1 C (left) and 55.0 C (right) on the strap-on NTCs,
  i.e. roughly 57-58 C (left) and 56-57 C (right) in the water.
- Conclusion: the low pocket satisfies the cylinders close to setpoint (top within about 1-2 K).
  To be confirmed on a normal evening reheat.

### Pros of the low pocket
- Notices draws early (cold water enters at the bottom), so the cylinder is reheated before much
  hot water has gone while a window is open.
- Reheats end close to setpoint (top within about 1-2 K).
- Good thermal contact with paste.
- Works with the windows: evening reheat (18:30-21:00) brings the cylinder up, the morning window
  (06:00-08:30) tops up overnight use.

### Cons of the low pocket
- Sits in the coil's warm plume while heating, so it reads hotter than the cylinder as a whole and
  can stop a reheat slightly early, leaving the top 1-2 K below the probe.
- More, shorter reheats: a modest draw in a window drops the probe below 53 C (58 C minus the 5 K
  differential) and triggers a top-up (while there is no bypass, overlapping with the heating
  actually helps the boiler).
- Small overshoot after each reheat (1-2 K), harmless.
- An early stop is not corrected by mixing: mixing lowers the probe by only 1-3 K, below the 5 K
  differential, so only a draw triggers a restart. The cylinder therefore settles a little below
  setpoint at the top (relevant to legionella, below).

### Alternatives considered and rejected
- Higher pocket: none exists on these cylinders.
- Feeding the hub a faked CS92 (RAMSES impersonation) from the outlet NTC: rejected, as the pipe
  lags without flow, so the hub would overshoot well past setpoint.
- Remedy if tops settle consistently below about 55 C: raise the setpoint by 2 C, not move the probe.

### Stratification readings
- Hotter water cannot sit stably below cooler water, so a negative "top minus bottom" is not real
  layering. It appears (a) during reheats, as the probe sits in the coil plume and the outlet pipe
  lags with no flow, and (b) after a reheat until the first draw.
- Fix (hot water package v3): stratification is calculated from the "top used" value (the larger of
  the live outlet and the top captured after the cylinder's last draw, valid 6 h), not the live
  outlet. It is then correct after every draw (positive as cold water comes in at the bottom);
  it can still read negative during a reheat with no draw, and 1-2 K high after hours standing.
- Draw capture (v3): each cylinder detects its own draws from its outlet (cooling faster than
  0.15 K/min for 30 s after a rise of more than 1 K in 10 min) and captures the highest reading of
  the last 3 min: the peak after a short draw, or the end value of a long one (no over-estimate when
  a shower or bath runs the cylinder down). Verified 11 Nov on both sides.

### Legionella
- Guidance is to store hot water at 60 C or above. With a 58 C setpoint and the low probe, the tops
  settle at about 56-58 C and never reach 60 C throughout.
- Decision pending (on the to-do list):

| | Raise Evohome setpoint (60-61 C) | 58 C + weekly HA/RAMSES pasteurising reheat (~65 C) |
|---|---|---|
| Depends on | Evohome only (works if HA is down) | HA and the RAMSES gateway that evening |
| Failure mode | None of note | Missed cycle (Sunday alert reports it); if HA fails mid-cycle the setpoint can be left at 65 C, so a failsafe reset is required |
| Whole cylinder >= 60 C | Mostly (61-62 C safer, as the probe reads high) | Yes, weekly, with margin |
| Standing loss / gas | A little more every day | Minimal |
| Scale | Slightly faster every day | Only during the weekly cycle |
| Scald risk | Slightly higher every day (check mixing valves) | Only that evening |
| Boiler efficiency | Slightly lower on every reheat | Only weekly |

- Recommendation: raise the setpoint to about 60-61 C (robust); the weekly HA cycle is optional and
  only with a failsafe. The Sunday "weekly hot water temperature" alert checks either way.

### Hot water windows (11 Nov 2026)

Both hubs: **06:00-08:30** (overlapping the heating's start, so no extra early boiler noise) and **18:30-21:00** (overlapping the evening heating start: the combined load avoids short cycling while there is no bypass; long enough for a cold cylinder; covers evening baths). A reheat ends by itself at setpoint, so a longer window costs nothing; while open, a draw that drops the probe below 53 °C triggers a top-up. A late-afternoon reheat becomes the better option once the bypass is fitted. The old evening window cut the right cylinder off part-heated after a cold refill.

### Evohome naming

The hot water zone is fixed as "Hot Water" on the controller and in the app, so the hub **locations** can be renamed to say which cylinder each serves; HA names carry the cylinder. Which hub, BDR91 and CS92 belongs to which cylinder is to be verified by test (boost one hub outside its windows and watch the cylinders' inlet pressures; a long draw drops that cylinder's probe).
