# ramses_esp 0.5.3-jc1 (local test build, not an official release)

[← Gateway reliability (B6)](../../docs/B6-gateway-reliability.md)

**Base:** IndaloTech/ramses_esp commit `c922579` (= v0.5.3-testb), built with ESP-IDF v6.0.3 for the ESP32-S3, same partition table (factory app at `0x10000`). The binary isn't published here: build it from the base commit with [`jc1-changes.patch`](jc1-changes.patch).

| # | Change | Log line if it ever fires |
|---|---|---|
| 1 | **PR #44 TX fix** (lexbrugman): queue a refill event if the CC1101 TX FIFO is already below threshold after priming or refilling, so a missed GDO0 edge can't leave TX stuck mid-frame | - |
| 2 | **TX timeout:** abort a frame not finished within 500 ms and return to RX | `# FRAME: TX timeout - aborting frame and returning to RX` |
| 3 | **Bounded CC1101 mode-change loops** (IDLE/RX/TX) | `# CC1101: state change timeout (...)` |
| 4 | **Bounded TX prime loop** | `# FRAME: TX prime did not reach FIFO threshold` |
| 5 | `CONFIG_ESP_TASK_WDT_PANIC=y`: any other radio-task stall reboots the stick after ~5 s | (reboot banner) |

**Flash** (browser flasher, *Erase all* unticked): `0xd000` ota_data_initial.bin, `0x10000` the jc1 binary. The boot banner reads `# ramses_esp 0.5.3-jc1`.

**Result:** two nights (13 h 35 min and 13 h 40 min, ~3,300 transmissions) with no stalls and none of the lines above, so change 1 alone prevents the stall.
