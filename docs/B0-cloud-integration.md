# B0 · Cloud Integration and the Road to RAMSES-II (August-September 2026)

[← Back to README](../README.md)

Before the radio gateway, Evohome reached Home Assistant through Honeywell's cloud. This was the first integration step, and its limits are the reason for everything in B1-B7.

## Step 1: HA's built-in Evohome (cloud) integration (August 2026)

| Item | Detail |
|---|---|
| Integration | Home Assistant core **`evohome`**, using Honeywell's Total Connect Comfort cloud API |
| Configuration | **YAML only**: an `evohome:` block in `configuration.yaml`, with the account credentials held in `secrets.yaml` |
| Entities | A climate entity per zone, a system (controller) entity with modes, and a water-heater entity for DHW |
| Services | System mode and zone override services (`evohome.set_system_mode`, `evohome.set_zone_override`, …) |

```yaml
# configuration.yaml (credentials via !secret, never inline)
evohome:
  username: !secret evohome_username
  password: !secret evohome_password
```

### Challenge: only one of the two controllers appeared
The integration connects to **one location/controller** per configuration, so only one of the two Evohome systems showed in HA.

**Workaround:** a copy of the core integration was installed as a **custom component with a different domain** (`evohome_1`), configured for the second controller. Both systems then appeared in HA.

```bash
# copy the core integration matching your HA version, then change its domain to evohome_1
# (manifest.json "domain" and const.py DOMAIN), and add an evohome_1: block in configuration.yaml
```

**Trade-off:** a copied core component doesn't update with Home Assistant, so it must be refreshed by hand after HA upgrades.

### Challenge: "TotalComfort", not set up via the UI
HA listed a "Total Connect Comfort" entry that it said *wasn't set up via the UI*. Investigation showed this is the same YAML-configured cloud Evohome integration, not a separate or rogue one. That mattered later, when every integration had to be ruled out during the [5 °C fault](C1-fault-case-study.md).

## What the cloud integration couldn't do

| Limitation | Effect |
|---|---|
| Cloud dependency | No data or control if the internet or Honeywell's service is down |
| Polling | Changes appear minutes late |
| Rate limits | Honeywell's API returns **HTTP 429** under load (hit when trying a bulk schedule export) |
| No device-level data | No TRV heat demand, BDR91 relay states, UFH circuit detail or wall-stat battery/signal |
| One controller per configuration | Needed the `evohome_1` workaround |

## Step 2: looking at the radio directly (late August 2026)

With an **RTL-SDR** receiver running `rtl_433`, the 868 MHz band showed Evohome's devices transmitting constantly, at around 868.1 MHz. But `rtl_433`'s Honeywell decoders cover devices such as the CM921 wireless thermostat, **not Evohome's RAMSES-II traffic**, so the packets could be seen but not decoded.

That confirmed two things: the data was there locally, and a purpose-built **RAMSES-II gateway** was needed to decode it, and potentially transmit.

## Step 3: RAMSES-II gateway (September 2026 onwards)

The gateway was added on 18 Sep, running **alongside** the cloud integration, not replacing it:

| | Cloud `evohome` / `evohome_1` | `ramses_cc` (RAMSES-II) |
|---|---|---|
| Path | Internet → Honeywell → controllers | Local 868 MHz radio |
| Still used for | System mode (the controllers don't broadcast it over RF), app-level view | Device-level data, fast updates, controlled writes |
| Entity names | Plain (`climate.<zone>`) | `climate.rf_<zone>` ([B3](B3-home-assistant-entities.md)) |

Continue with [B1 · Gateway set-up](B1-gateway-setup.md).
