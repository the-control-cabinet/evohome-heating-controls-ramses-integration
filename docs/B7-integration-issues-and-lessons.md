# 07 · Issues and Lessons Learned

[← Back to README](../README.md)

Each issue is written up as symptom → cause → fix → lesson.

### 1. Serial console wouldn't cooperate
- **Symptom:** PuTTY wouldn't open the port; Tera Term showed no prompt.
- **Cause:** port contention; local echo off; wrong line ending.
- **Fix:** Tera Term, 115200 8N1, local echo on, CR+LF.
- **Lesson:** a device printing live data isn't hung. Seeing RF packets was the proof the radio worked.

### 2. Integration set-up errors
- **Symptom:** "expected a mapping", "not a valid option", "failed to connect".
- **Cause:** wrong mode and serial field format.
- **Fix:** MQTT broker mode with an `mqtt://` port URL.

### 3. In-development mode on a live system
- **What happened:** the in-development "HA MQTT broker" option was used first. The two-controller 5 °C fault followed. It wasn't proven to be the cause, but there's been no recurrence on the released mode.
- **Lesson:** released software only on live plant ([case study](C1-fault-case-study.md)).

### 4. Flat, partial device list
- **Fix:** a schema built from captured packets.
- **Lesson:** discovery finds devices; it doesn't know your plant. Model the structure explicitly.

### 5. Zone names not matching
- **Fix:** copy the controller's spelling exactly, typo included.

### 6. UFH zones with no heat demand
- **Cause:** ramses_cc defect #1154 in 0.60.4.
- **Fix:** upgrade to 0.60.10.
- **Lesson:** check the vendor's issue tracker before re-engineering your configuration.

### 7. Entity ID clashes
- **Fix:** a registry script renaming the RAMSES copies to `rf_*`, with a backup and HA stopped.

### 8. Phantom gateway 18:000002
- **Fix:** deleted; the schema prevents its return.

### 9. Null system mode
- **Cause:** the controllers don't answer `2E04`.
- **Fix:** use the cloud entity for mode.

### 10. Gateway offline after hours
- See [B6](B6-gateway-reliability.md): evidence gathered, issue filed, test in progress.

## Lessons for BMS work

1. **Read-only commissioning first.** Prove you understand the network before writing to it.
2. **Every write must be attributable.** Keep logs and audit them.
3. **Model the plant explicitly.** A schema or points schedule beats auto-discovery.
4. **Coexistence needs naming discipline** when two supervisors see the same plant.
5. **Write down operating rules** for any system that can command live plant.
