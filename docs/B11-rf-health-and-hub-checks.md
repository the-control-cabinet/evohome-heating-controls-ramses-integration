# B11 · RF Health: Gateway Position, Signal Strength and the Controllers' Own RF Check

[← Back to README](../README.md)

**Status (16 Nov 2026): every controller-to-device link tested is excellent. The weak signals seen in Home Assistant are the path to the RAMSES gateway only. Gateway on firmware 0.5.3-jc1: one RF stall in ten days, recovered automatically.**

## 1. Gateway moved to a central position (12 Nov)

The gateway left the dining-room laptop for the first-floor landing, stand-alone on a USB charger (Wi-Fi/MQTT). Wi-Fi improved from −60…−70 to −48 dBm. Signal at the gateway (ramses_cc `best_rssi` / `last_known_rssi`), selected devices:

| Device | Before | After |
|---|---|---|
| Upstairs controller | — | −47 |
| Radiator BDR91 (13:000002) | −76 | −61 |
| Office wall stat | −80 | −60 |
| Bedroom 3 TRV | −77 | −60 |
| HCC80R | — | −60…−62 |
| Downstairs controller | — | −86 |
| Left hot water BDR91 (13:000001) | — | −84 |

The right cylinder's CS92 transceiver, temporarily lying on the floor, was hung on the wall where its pattress box will go: **−102 → −67 dBm** (~35 dB). Lesson: height, an upright antenna and clearance from joists and pipes matter far more than distance.

## 2. Reading the signal numbers

- **Single-packet readings of −95 to −105 dBm are glitches.** ramses_cc's device-health notifications (3, then 7 "very weak" devices on 15 Nov) came from single packets; a minute later the same devices read −54 to −69.
- **Consistently weak at the gateway** (across a day): Dining T87RF (−72…−82), Play Room T87RF (−76…−83), Master En-suite T87RF (~−87), Lounge T87RF (~−78), downstairs controller, Family room T87RF. The Master Bedroom wall stat stays where it is (owner's decision).
- These figures are **gateway-side**. They decide how well HA hears the system, not how well the heating works (§3).

## 3. The controllers' own RF check (16 Nov)

Installer menu → **RF COMMS CHECK** → *RF test zones / heat demand / hot water*. The controller keeps sending while the screen shows "An RF test message is being sent"; mains devices answer on their LED (1-5 flashes), and the controller summarises two-way actuators as Excellent / Good / Poor / Not received. Battery devices must first be put into their own test mode (HR92: button, turn the dial to *rf check*, press); otherwise they read "Not received" because they are asleep. **Never press DELETE on these screens** (it unbinds the device), and avoid the T87RF's long-press menu (*bnd* = binding).

| Controller | Device | Result |
|---|---|---|
| Downstairs | HCC80R (zone test; all 8 LEDs) | 5 / 5 |
| Downstairs | UFH / boiler BDR91 (heat demand) | 5 (red LED variant) |
| Downstairs | Right hot water BDR91 | 5; hot water test: *Actuator (two-way) total 2, Excellent 2* |
| Upstairs | Radiator BDR91 (heat demand) | 5 |
| Upstairs | Left hot water BDR91 | 5 |
| Upstairs | Master Bedroom HR92 (in its own rf check) | Excellent |

The left hot water BDR91 reads −84 dBm at the gateway but 5/5 from its controller: **the heating's own radio is healthy**; only the gateway's view is marginal. Data: [data/rf-comms-check-2026-11-16.csv](../data/rf-comms-check-2026-11-16.csv).

## 4. Fault logs

- **Downstairs:** only *BATTERY LOW, 00* (3 Nov → cleared 4 Nov; 12 Nov 11:13 → cleared 13:46). Its controller has rechargeable cells and no battery symbol, so 00 is most likely the zone 00 wall stat (Lounge): batteries to replace. **Nothing on 15 Nov**, consistent with §2 of [B10](B10-schedules-in-home-assistant.md).
- **Upstairs:** *BATTERY LOW, 00* active since 15 Nov 11:01, with a crossed-battery (not charging) symbol: the controller's own pack. Ordinary AA cells had been fitted after the batteries-out restart; the controller only charges **rechargeable NiMH** cells. Older entries (30 Oct comms faults on the heat-pump/appliance relay, hot water valve and an actuator, all restored the same afternoon) date from the October re-setup.

## 5. Gateway firmware and monitoring

- **0.5.3-jc1** (local build: PR #44 TX refill fix + TX limits + watchdog reboot): ~6-16 Nov, **one RF stall** (15 Nov 19:34), recovered by the HA watchdog's soft `reset` within ~16 s. Two longer outages on 8 and 10 Nov were the laptop it was then plugged into losing power, not the stall.
- **Radio-gap logger threshold raised 60 → 120 s** (16 Nov), matching the *receiving* sensor; a 60 s silence is normal on a quiet system and had inflated the counter (213). Counter reset.
- The serial logging script (resending debug commands after a reboot) is retired: the stick no longer has a serial connection. An upstream update for #50 is drafted but not posted.

## 6. Per-device "not heard" monitoring (16 Nov)

Package [config/ha-ramses-device-not-heard.yaml](../config/ha-ramses-device-not-heard.yaml) and card [config/ha-ramses-device-health-card.yaml](../config/ha-ramses-device-health-card.yaml):
- Once a minute, every `ramses_cc` device status entity with a `last_seen` attribute (controllers, BDR91s, CS92s, wall stats, TRVs, HCC80R; 37 devices) is checked: hours since the gateway last heard it, last-known and best signal. Built from `integration_entities`, so new devices join automatically.
- A device silent for longer than a threshold helper (6 h to start, **3 h since 19 Nov**) is written to the logbook at once; a **phone message at 08:05 only when the list of silent devices has changed** (one message per problem), and a clear when they recover.
- A statistics sensor keeps the **longest silence over 72 h**: after night 1 it was 1.98 h (the CS92s are the quietest, ~1-2 h). The threshold gets tightened just above that ceiling after a few nights.
- After the junction box was re-energised (17 Nov) every device was heard again within 0.34 h.

## 7. A hot water relay left unpowered (19 Nov)

- **What happened:** the left cylinder's hot water BDR91 (`13:000001`) was taken off its backplate during mounting work (~15:40) and not refitted. Off its backplate a BDR91 has no mains and no radio. The upstairs controller noticed only when it next needed the relay: at the 18:30 evening window it got no reply and logged **`dhw_actuator_communication_lost` at 18:40**. The left cylinder sat at a 17-20 °C bottom probe all evening; the 21:30 digest showed it at 39 %.
- **Why nothing alerted:** the RAMSES not-heard check needs 3 hours of silence and then messages the phone only at 08:05. The controller's own fault was visible in Home Assistant through the **cloud integration** (`status.activeFaults` on the hot water entity), but nothing watched it.
- **Fix:** relay refitted 22:13; it was heard at once, the fault cleared, and a 1-hour boost reheated the cylinder. A new **Evohome hub faults** alert now passes on any fault either controller reports (relay lost, battery, sensor) within one cloud update: [plant doc 15](https://github.com/the-control-cabinet/heating-plant-monitoring-esphome/blob/main/docs/15-alerts.md#changes-19-nov-2026). Its first "all cleared" message arrived after the refit.
- **Lesson:** the controller that depends on a device knows first. Radio-silence monitoring stays as the second line (it covers devices the controller only hears occasionally).
