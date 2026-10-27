# 05 · Fix Procedure

[← Back to README](../README.md)

Zone by zone, on the controller, with no factory reset.

## Radiator zones (upstairs controller)

1. **Record** the zone's name, type, devices and schedule first.
2. **Delete** the zone in the controller's zone configuration.
3. **Re-add** it with the same name. Spelling matters if anything references it by name, for example an integration schema.
4. **Bind the TRV(s):** put the controller in bind mode for the zone's actuators, then trigger bind on each HR92.
5. **Bind the wall stat as the zone sensor.** The **T87RF** has no bind button: binding is started from its touch zones, following Honeywell's binding instructions. Select it as the zone's **remote sensor**, so the controller uses its temperature but still drives the TRV.
6. **Re-enter the schedule.**
7. **Verify** at the next switchpoint: the zone follows its schedule, and there's no Override or sun-and-thermometer icon.

Completed for all 12 upstairs zones.

## Underfloor zones (downstairs controller + HCC80R)

Steps 1-3, 5 and 6 as above. Then the actuator bind goes to the **HCC80R** instead of a TRV:

1. On the HCC80R, use the **transmit (signal) button** to enter bind mode. All LEDs go yellow, and each further press steps to the next zone, whose LED **flashes green**. The **mode** button isn't used.
2. With the right zone's LED flashing green, select **bind actuator** on the controller.
3. **Real confirmation:** the HCC80R zone LED changes to **solid amber**.

> **Trap:** the controller can report "success" while the HCC80R zone LED is still flashing green, meaning the HCC80R hasn't accepted the bind. Trust the HCC80R LED, not the controller's message.

Completed for all 6 downstairs zones.

## Verification

- Every zone followed its schedule through multiple switchpoints.
- No sun-and-thermometer icons; no zones at 5 °C.
- Heat demand returns as expected (also visible in ramses_cc once the gateway was back).
