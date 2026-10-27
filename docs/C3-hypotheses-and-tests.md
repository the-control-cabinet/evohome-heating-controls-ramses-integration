# 03 · Hypotheses and Tests

[← Back to README](../README.md)

The fault re-asserted itself at **schedule switchpoints**, so each test was judged at the *next switchpoint* after the change, not straight away.

### H1: System mode
- **Idea:** Away, Heating Off or a frost mode would legitimately set low setpoints.
- **Test:** checked the system mode on both controllers.
- **Result:** normal mode. **Ruled out.**

### H2: Schedules corrupted
- **Idea:** a schedule rewritten with 5 °C periods.
- **Test:** inspected every zone's schedule.
- **Result:** schedules correct, and never 5 °C. **Ruled out.**

### H3: The gateway actively sending commands
- **Idea:** the new RF gateway sending setpoint or mode commands.
- **Test:** unplugged on 19 Sep, ramses_cc disabled, observed for more than 24 h across several switchpoints.
- **Result:** fault unchanged. **Not an ongoing cause.** (Whether it caused a lasting change is addressed in [C4](C4-packet-log-analysis.md).)

### H4: Home Assistant integration or automation
- **Idea:** something in HA writing to the system.
- **Test:** confirmed there were no automations touching heating. Cloud Evohome (TotalComfort) integration commented out of `configuration.yaml`; ramses_cc deleted completely (not just disabled).
- **Result:** fault unchanged with HA fully detached. **Ruled out.**

### H5: Cloud service pushing commands
- **Idea:** the Honeywell cloud re-applying a stored override.
- **Reasoning:** cloud-originated commands would be expected at arbitrary times. The fault appeared exactly and only at each zone's own switchpoint, which is controller-local timing.
- **Result:** **Unlikely.**

### H6: An ordinary local (wall-stat) override
- **Idea:** "Local override" was enabled on every zone, so perhaps wall stats were overriding.
- **Test:** made a deliberate wall-stat override on one zone and compared it with the faulted zones.
- **Result:** the deliberate override showed a **clock** icon with **Cancel**; faulted zones showed a **sun and thermometer** with no Cancel. **Different mechanism.**

### H7: Corrupted zone state or bindings in the controller
- **Idea:** the controller held bad stored state for its zones, re-applied at each switchpoint.
- **Test:** on 3 Oct, deleted one zone, re-added it, re-bound its TRV and T87RF, and re-entered the schedule.
- **Result:** the zone followed its schedule through subsequent switchpoints. **Confirmed fix path.**

### H8: Corrupted TRVs or wall stats
- **Idea:** the field devices themselves holding a stuck override.
- **Test:** the rebuilt zones were re-bound to the **same** devices.
- **Result:** recovered with no hardware changed. **Devices not at fault.** If the corruption had been in the devices, re-binding them unchanged would not have cleared it.

### Options considered but not needed
- **Factory reset** of a controller: re-pairing everything. Held as a last resort.
- **Battery pulls** on individual TRVs: superseded by the zone-rebuild result.
- **Manufacturer support:** deliberately deferred until local options were exhausted.
