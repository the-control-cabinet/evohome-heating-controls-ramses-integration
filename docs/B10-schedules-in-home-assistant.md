# B10 · Schedules in Home Assistant: Read, Write, Verify

[← Back to README](../README.md)

**Status (16 Nov 2026): reading the hubs' schedules from Home Assistant works and is verified against the hubs' own data. Writing zone schedules is blocked until it can be verified the same way; writing hot water schedules is off permanently until the library is fixed. Reported upstream as ramses_cc issue #1427.**

## 1. What was built (14 Nov)

| Part | What it does |
|---|---|
| `config/evohome-schedule-card.js` | Custom Lovelace card: every zone and both cylinders grouped by hub, today's bar per row, the full week on tap; colour by setpoint; edit, undo and restore for zones |
| `config/evohome_schedule_backup.yaml` | Snapshot of all 20 schedules (18 zones + 2 cylinders) into one sensor; restore script; write log; write guards; gateway-health sensor; confirm-from-hub script (v4) |
| `config/evohome_schedule_card_loader.yaml` | Loads the card via `frontend: extra_module_url` (versioned `?v=` to force browsers to reload it) |
| `config/evohome-schedule-card-dashboard.yaml` | Card settings: cylinder display names, radiators group collapsed |

Write guards (all must pass): master editing switch; gateway healthy (online, receiving for 10+ minutes, packet in the last 60 s); a fresh read just before writing, compared with what was edited; one write at a time; every write logged; and a round-trip test (an unchanged write) before any real change.

## 2. The first real write and a red herring (15 Nov)

The card wrote a weekend hot water change (Sat/Sun 06:00-10:00) to the downstairs controller and reported it verified. The controller screens still showed 06:00-07:30. Immediately afterwards every zone screen on both controllers showed a title ending **"– OVERRIDE"**, and app saves failed for a while.

The response escalated (controller restarts with batteries out, `evohome.reset_system` on both cloud integrations) before the title was checked against the Resideo manual: **"&lt;ZONE&gt; – OVERRIDE" is simply the name of the zone adjust screen**. A real override offers *Cancel Override* or *Cancel Permanent*; these screens offered neither, RAMSES showed every zone in `follow_schedule`, and zones changed at their switchpoints. Nothing was wrong with the controllers. Costs: the guest zones' permanent 12 °C overrides had to be set again after the resets, and two "reset_system is deprecated" repair notices.

**Lesson:** check a symptom against the manual before acting on it, especially when the last incident (the 5 °C fault, [C1](C1-fault-case-study.md)) primes you to see a repeat.

## 3. Why the write "succeeded" but changed nothing

Packet log of the two hot water writes (masked IDs):

```
I --- 01:000002 18:000001 --:------ 0404 007 00230008290103   <- fragment 1 echoed
I --- 01:000002 18:000001 --:------ 0404 007 00230008290203   <- fragment 2 echoed
I --- 01:000002 18:000001 --:------ 0404 007 002300080C03FF   <- final ack ends FF
```

A zone write the day before ended `...0300` (`00`). Reading: **`FF` = rejected, `00` = accepted**. ramses_rf 0.61.4 ignores that byte, reports success, and then stores what it sent as its own synchronised copy, so a read-back returns the cache and "verifies" anything.

Decoding the controller's own hot water schedule (after a cache-clearing read, §4) against the library's blob, record by record (5 × uint32 LE: flag, index, day, minutes, on/off):

| | Byte 0 | Everything else |
|---|---|---|
| Controller's own DHW blob (both controllers, all 28 records) | `01` | — |
| ramses_rf 0.61.4 DHW write | `00` | identical |
| Zone blobs (controller and library) | `00` | — |

The library packs byte 0 as padding (`_STRUCT_FMT = "<xxxxBxxxBxxxHxxHH"`) and also discards it when parsing. That single byte is the likely reason the controller rejects hot water writes.

Reported as **ramses_cc issue #1427** (with redacted diagnostics). A third point in the original report (a refresh fetching only fragment 1) was withdrawn after a later read showed the library re-fetching all fragments once the controller's change counter moved: the earlier read had simply happened before the change reached the controller.

## 4. Proving the read path (16 Nov)

Two traps had to be cleared first:

1. **Sending was still disabled.** `disable_sending: true` had been set during the 15 Nov incident and not reversed. With sending off, a read is impossible (a read is an RQ the controller answers), so the card's refresh could only return the cache, and every polled RAMSES value froze for ~24 h (the right cylinder's heat demand "stuck at 100 %" was this). **Lesson:** keep a register of every setting changed during an incident and reverse it explicitly ([C6](C6-lessons-and-controls.md) style).
2. **The library cache.** Reloading the integration clears it.

With sending on, a reload, then the card's refresh: `RP 0006` (change counter) and three `RP 0404` fragments came back from the controller. Decoded, they showed the real schedule, including that the downstairs **Saturday** was still 06:00-07:30 (the Sunday change made on the controller had stuck; the Saturday one had not). After fixing it on the controller, the next read confirmed it, along with the weekday change (06:00-08:30, both cylinders). This is the first schedule change verified from the controllers' own data.

## 5. Card v5 / v5.1 and package v4 (16 Nov)

- **Hot water is read-only** in the card and in the restore script (skipped). Chip: *Hot water: read-only (app/hub)*.
- **No "verified" from a read-back.** A zone write is logged as **sent – not confirmed**, with a **Confirm from hub** button: the script reloads RAMSES (clearing the cache), waits 2 minutes, reads the schedule from the controller and compares (normalised: day, time, setpoint) → **confirmed from hub** or **NOT CONFIRMED**. Writes then pause ~10 minutes (gateway guard).
- **Round trip** passes only on a *confirmed* unchanged write; further writes to a room wait until its pending write is confirmed (undo still allowed).
- **v5.1:** rows of zones in a temporary or permanent override show a marker (e.g. *permanent 12°*), because the schedule bar is not what the zone is doing while overridden.

## 6. Still open

- Maintainer feedback on #1427; then, with agreement, either a local patch (DHW byte 0 = `01`, treat `FF` as failure) or the fixed release.
- One zone test write on an unused zone with the packet log on: final ack `00`, Confirm from hub, controller screen.
- A weekly high-temperature hot water heat from HA (`set_dhw_params`) only after the write path is proven; until then both controllers hold 60 °C ([B12](B12-hub-settings-and-change-log.md)).
