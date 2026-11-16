/*
 * Evohome schedule card (RAMSES RF) - v5.1, 16 Nov 2026: view + edit with write guards.
 * v5.1: rows of zones in a temporary or permanent override show an "override" marker (setpoint, until),
 *       because the schedule bar is not what the zone is doing while overridden.
 * v5: hot water is READ-ONLY (ramses_rf DHW writes are rejected by the hub: ramses_cc issue #1427);
 *     a zone write is shown as "sent - not confirmed" until "Confirm from hub" (reload RAMSES = cleared
 *     cache, then a full read from the hub) matches; only a confirmed unchanged write passes the round trip.
 *
 * Shows and edits the weekly schedules the Evohome hubs hold, through ramses_cc:
 *   - zones:     climate entities with a zone_index attribute (switchpoints: time_of_day, heat_setpoint)
 *   - hot water: water_heater entities with a schedule attribute (switchpoints: time_of_day, enabled)
 * Grouped by hub (hot water, underfloor, radiators); tap a group heading to collapse it.
 * One compact row per zone/cylinder with today's bar; tap a row to expand the full week.
 *
 * Reading: the refresh button (or "Refresh all") reads from the hub (get_zone_schedule / get_dhw_schedule).
 * Until a schedule has been read since HA started, the last snapshot (sensor.evohome_schedule_snapshot,
 * from the backup package) is shown, marked "snapshot".
 *
 * Editing (zones only; week view, pencil on a day): change, add or delete switchpoints (max 6 a day, 10-minute steps;
 * setpoints 5-35 C in 0.5 steps), optionally copy the day to other days, then Save:
 * the whole week is written with set_zone_schedule (JSON). The result is "sent - not confirmed" until
 * "Confirm from hub" (script.evohome_confirm_schedule_from_hub) reads it back from the hub itself.
 * Editing needs a live (just-read) schedule, so a hub-side change since the snapshot is never overwritten.
 * Per room: "Restore" writes that room's schedule from the snapshot (script.evohome_restore_zone_schedules);
 * also "sent - not confirmed" until confirmed. Hot water: no edit, undo or restore (change it in the app or on the hub).
 * Header: "Snapshot" saves all schedules (script.evohome_snapshot_zone_schedules).
 * Day numbering in RAMSES schedules: 0 = Monday ... 6 = Sunday.
 *
 * Write guards (every save, undo and restore):
 *   1. input_boolean.evohome_schedule_editing must be on (header switch);
 *   2. binary_sensor.evohome_gateway_healthy_for_writes must be on (gateway online, receiving 10+ min, recent packet);
 *   3. the schedule is read from the hub again just before writing; if it differs from what was edited, no write;
 *   4. one write at a time;
 *   5. every write is logged (script.evohome_record_schedule_write -> logbook + sensor.evohome_schedule_last_write),
 *      and the last card write can be undone;
 *   6. until an unchanged zone write has been CONFIRMED FROM THE HUB, only unchanged saves are allowed
 *      (input_boolean.evohome_zone_roundtrip_passed, set only by the confirm script);
 *   7. hot water: never written from here.
 * Why "confirm from hub": after a write, ramses_rf returns its own cached copy of what it sent, so a plain
 * read-back proves nothing. The confirm script reloads the RAMSES integration (clears that cache), waits
 * 2 min, reads the schedule from the hub and compares. Writes are then blocked for ~10 min (gateway guard).
 *
 * Card config:
 *   type: custom:evohome-schedule-card
 *   title: Heating and hot water schedules      (optional)
 *   entities: [climate.rf_lounge, ...]          (optional; default: all found automatically)
 *   names: { water_heater.stored_hw: Right cylinder }   (optional display names)
 *   collapsed: [Radiators (upstairs hub)]       (optional groups to start collapsed)
 */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SNAPSHOT = "sensor.evohome_schedule_snapshot";
const MAX_SP = 6;
const EDITING = "input_boolean.evohome_schedule_editing";
const GATEWAY = "binary_sensor.evohome_gateway_healthy_for_writes";
const RT_ZONE = "input_boolean.evohome_zone_roundtrip_passed";
const RT_DHW = "input_boolean.evohome_dhw_roundtrip_passed";
const LAST_WRITE = "sensor.evohome_schedule_last_write";
const CONFIRM_SCRIPT = "evohome_confirm_schedule_from_hub";
const DHW_READONLY = "Hot water schedules are read-only here: change them in the Evohome app or on the hub (ramses_cc issue #1427).";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x ?? null));

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function toMin(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}
function fmtMin(m) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

// Heating setpoint colours: <= 12 C setback muted; 15 C cyan -> 17 green -> 19 yellow -> 20 orange -> 21+ red.
function tempHue(t) {
  return 200 - 200 * Math.max(0, Math.min(1, (t - 15) / 6));
}
function tempColour(t) {
  if (t == null) return "var(--disabled-text-color, #888)";
  if (t <= 12) return "rgba(120, 140, 170, 0.35)";
  return `hsl(${tempHue(t)}, 75%, 50%)`;
}
function textColour(t) {
  if (t == null || t <= 12) return "#fff";
  const h = tempHue(t);
  return h > 40 && h < 115 ? "rgba(0, 0, 0, 0.8)" : "#fff";
}
function sameSchedule(a, b) {
  const norm = (s) => JSON.stringify((s || []).map((d) => [d.day_of_week,
    (d.switchpoints || []).map((p) => [p.time_of_day, p.heat_setpoint ?? null, p.enabled ?? null])
      .sort((x, y) => toMin(x[0]) - toMin(y[0]))]).sort((x, y) => x[0] - y[0]));
  return norm(a) === norm(b);
}

class EvohomeScheduleCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._expanded = new Set();
    this._busy = new Set();
    this._collapsed = new Set(this._config.collapsed || []);
    this._edit = null;       // { id, day, sps: [{min, v}], copy: Set, error }
    this._status = {};       // id -> { text, kind }
    this._writing = false;   // one write at a time
    this._lastKey = null;
  }

  getCardSize() {
    return 2 + Math.ceil(this._entities().length * 0.6);
  }
  getGridOptions() {
    return { columns: "full", rows: "auto" };
  }
  getLayoutOptions() {
    return { grid_columns: 4, grid_rows: "auto" };
  }

  connectedCallback() {
    this._timer = setInterval(() => { if (!this._edit) this._render(true); }, 60000);
  }
  disconnectedCallback() {
    clearInterval(this._timer);
  }

  set hass(hass) {
    this._hass = hass;
    // While the editor is open, don't redraw on every state update (it would reset the inputs),
    // except when a guard changes (editing switch, gateway, round-trip helpers): keep the typed values.
    if (!this._edit) { this._render(false); return; }
    const gk = [EDITING, GATEWAY, RT_ZONE, RT_DHW].map((e) => hass.states[e]?.state).join("|");
    if (gk !== this._guardKey) {
      this._guardKey = gk;
      this._readEditorInputs();
      this._render(true);
    }
  }

  // ---------- data ----------
  _entities() {
    if (!this._hass) return [];
    if (Array.isArray(this._config.entities) && this._config.entities.length) {
      return this._config.entities.filter((e) => this._hass.states[e]);
    }
    const zones = [];
    const dhw = [];
    for (const [id, st] of Object.entries(this._hass.states)) {
      const a = st.attributes || {};
      if (id.startsWith("climate.") && a.zone_index !== undefined) zones.push(id);
      else if (id.startsWith("water_heater.") && "schedule" in a) dhw.push(id);
    }
    const key = (id) => String(this._hass.states[id].attributes.id || id);
    zones.sort((a, b) => key(a).localeCompare(key(b)));
    dhw.sort();
    return [...dhw, ...zones];
  }

  _name(id) {
    const names = this._config.names || {};
    if (names[id]) return names[id];
    const fn = String(this._hass.states[id]?.attributes?.friendly_name || id);
    const m = fn.match(/^Evohome (?:Zone|Hot Water) \((.*)\)$/);
    return m ? m[1] : fn;
  }

  _group(id) {
    if (id.startsWith("water_heater.")) return "Hot water";
    const hub = String(this._hass.states[id]?.attributes?.id || "");
    if (hub.startsWith("01:000002")) return "Underfloor (downstairs hub)";
    if (hub.startsWith("01:000001")) return "Radiators (upstairs hub)";
    return "Other";
  }

  _live(id) {
    const s = this._hass.states[id]?.attributes?.schedule;
    return Array.isArray(s) && s.length ? s : null;
  }

  _snapshot(id) {
    const snap = this._hass.states[SNAPSHOT];
    const s = snap?.attributes?.schedules?.[id];
    return Array.isArray(s) && s.length ? { sched: s, when: snap.state } : null;
  }

  _schedule(id) {
    const live = this._live(id);
    if (live) return { sched: live, source: "live" };
    const snap = this._snapshot(id);
    if (snap) return { sched: snap.sched, source: "snapshot", when: snap.when };
    return { sched: null, source: "none" };
  }

  _daySps(sched, day) {
    const d = (sched || []).find((x) => Number(x.day_of_week) === day);
    return (d?.switchpoints || []).slice().sort((a, b) => toMin(a.time_of_day) - toMin(b.time_of_day));
  }

  _segments(sched, day, isDhw) {
    const val = (sp) => (isDhw ? !!sp.enabled : Number(sp.heat_setpoint));
    let carry = null;
    for (let k = 1; k <= 7 && carry === null; k++) {
      const prev = this._daySps(sched, (day - k + 7) % 7);
      if (prev.length) carry = val(prev[prev.length - 1]);
    }
    const segs = [];
    let start = 0;
    let value = carry;
    for (const sp of this._daySps(sched, day)) {
      const t = toMin(sp.time_of_day);
      if (t > start) segs.push({ start, end: t, value });
      start = t;
      value = val(sp);
    }
    segs.push({ start, end: 1440, value });
    return segs.filter((s) => s.end > s.start);
  }

  _bar(sched, day, isDhw, showNow) {
    let html = '<div class="bar">';
    for (const s of this._segments(sched, day, isDhw)) {
      const left = (s.start / 1440) * 100;
      const width = ((s.end - s.start) / 1440) * 100;
      let colour;
      let label;
      let fg = "#fff";
      if (isDhw) {
        colour = s.value ? "hsl(28, 90%, 52%)" : "rgba(120, 140, 170, 0.25)";
        label = s.value ? "On" : "Off";
      } else {
        colour = tempColour(s.value);
        fg = textColour(s.value);
        label = s.value == null ? "?" : `${s.value}\u00B0`;
      }
      const tip = `${fmtMin(s.start)}-${fmtMin(s.end)} ${label}`;
      const text = width > 4.5 && (isDhw ? s.value : s.value > 12) ? label : "";
      html += `<div class="seg" style="left:${left}%;width:${width}%;background:${colour};color:${fg}" title="${esc(tip)}">${esc(text)}</div>`;
    }
    if (showNow) {
      const d = new Date();
      html += `<div class="now" style="left:${((d.getHours() * 60 + d.getMinutes()) / 1440) * 100}%"></div>`;
    }
    return html + "</div>";
  }

  // ---------- actions ----------
  _domain(id) {
    return id.startsWith("water_heater.") ? "dhw" : "zone";
  }

  async _refresh(id, quiet) {
    if (this._busy.has(id)) return;
    this._busy.add(id);
    if (!quiet) this._render(true);
    try {
      await this._hass.callService("ramses_cc", `get_${this._domain(id)}_schedule`, { entity_id: id });
    } catch (e) {
      this._status[id] = { text: `Read failed: ${e.message || e}`, kind: "err" };
    }
    await new Promise((r) => setTimeout(r, 8000));
    this._busy.delete(id);
    if (!this._edit) this._render(true);
  }

  async _refreshAll() {
    for (const id of this._entities()) {
      await this._refresh(id);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  async _snapshotAll() {
    if (!confirm("Save a snapshot of every zone and hot water schedule? This replaces the previous snapshot.")) return;
    try {
      await this._hass.callService("script", "evohome_snapshot_zone_schedules", {});
      this._status._top = { text: "Snapshot running (a few minutes)...", kind: "ok" };
    } catch (e) {
      this._status._top = { text: `Snapshot failed: ${e.message || e}`, kind: "err" };
    }
    this._render(true);
  }

  // ---------- guards ----------
  _gatewayReason() {
    const g = this._hass.states[GATEWAY];
    if (!g) return "gateway health sensor missing (install the v3 backup package)";
    return g.state === "on" ? "" : `gateway not ready: ${g.attributes.reason || g.state}`;
  }

  // Returns "" if a write may go ahead, otherwise the reason it may not.
  _guard(id, roundTrip, isUndo) {
    if (this._writing) return "Another schedule write is in progress.";
    if (this._hass.states[EDITING]?.state !== "on") return "Schedule editing is switched off (header switch).";
    const gw = this._gatewayReason();
    if (gw) return `Blocked: ${gw}.`;
    if (id.startsWith("water_heater.")) return DHW_READONLY;
    if (this._pending(id) && !isUndo) return "The last write to this room is not confirmed yet: tap \u201cConfirm from hub\u201d first.";
    const passed = this._hass.states[RT_ZONE]?.state === "on";
    if (!passed && !roundTrip) {
      return "Changes are blocked until an unchanged save on one room has been confirmed from the hub (round-trip test).";
    }
    return "";
  }

  async _record(id, days, source, result, before, after) {
    try {
      await this._hass.callService("script", "evohome_record_schedule_write",
        { zone: id, days, source, result, before: before || [], after: after || [] });
    } catch (e) {
      console.error("evohome-schedule-card: write log failed", e);
    }
  }

  // Shared write path for save and undo. Assumes the guards have passed.
  async _write(id, next, before, daysText, source) {
    this._writing = true;
    const roundTrip = sameSchedule(next, before);
    this._status[id] = { text: "Writing to the hub...", kind: "ok" };
    this._render(true);
    let result = "error";
    try {
      if (id.startsWith("water_heater.")) throw new Error(DHW_READONLY);
      await this._hass.callService("ramses_cc", "set_zone_schedule",
        { entity_id: id, schedule: JSON.stringify(next) });
      result = "sent";
      this._status[id] = { text: `Sent to the hub (${daysText}) \u2013 not confirmed yet. Tap \u201cConfirm from hub\u201d (reloads RAMSES, about 3 min), or check the hub screen.`, kind: "ok" };
    } catch (err) {
      this._status[id] = { text: `Write failed: ${err.message || err}. Check the app before trying again.`, kind: "err" };
    }
    await this._record(id, daysText, source, result, before, next);
    this._writing = false;
    this._render(true);
  }

  async _restore(id) {
    const snap = this._snapshot(id);
    if (!snap || id.startsWith("water_heater.")) return;
    const isRound = sameSchedule(snap.sched, this._live(id));
    const why = this._guard(id, isRound) || (this._live(id) ? "" : "Read the live schedule first (refresh button).");
    if (why) { this._status[id] = { text: why, kind: "err" }; this._render(true); return; }
    if (!confirm(`Restore ${this._name(id)} from the snapshot taken ${new Date(snap.when).toLocaleString()}?\nThis overwrites the schedule on the hub.`)) return;
    this._writing = true;
    this._status[id] = { text: "Restoring from snapshot (the script reads it back)...", kind: "ok" };
    this._render(true);
    try {
      await this._hass.callService("script", "evohome_restore_zone_schedules", { zones: [id] });
      await sleep(20000);
      const lw = this._hass.states[LAST_WRITE]?.attributes || {};
      const ok = lw.entity_id === id && lw.result === "sent";
      this._status[id] = ok
        ? { text: "Restore sent \u2013 not confirmed yet. Tap \u201cConfirm from hub\u201d.", kind: "ok" }
        : { text: "Restore did not complete: check the logbook (Evohome schedule).", kind: "err" };
    } catch (e) {
      this._status[id] = { text: `Restore blocked or failed: ${e.message || e}`, kind: "err" };
    }
    this._writing = false;
    this._render(true);
  }

  // Last write to this entity that has been sent but not yet confirmed from the hub.
  _pending(id) {
    const lw = this._hass.states[LAST_WRITE];
    const a = lw?.attributes || {};
    if (a.entity_id !== id || a.result !== "sent" || !Array.isArray(a.after)) return null;
    return { expected: a.after, before: a.before || [], days: a.days, source: a.source, when: lw.state,
      roundTrip: sameSchedule(a.before, a.after) };
  }

  async _confirm(id) {
    const p = this._pending(id);
    if (!p || this._writing) return;
    if (!confirm(`Confirm ${this._name(id)} from the hub?\nThis reloads the RAMSES integration (its entities go briefly unavailable), waits 2 minutes and reads the schedule from the hub. Writes are then blocked for about 10 minutes.`)) return;
    this._writing = true;
    const before = this._hass.states[LAST_WRITE]?.state;
    this._status[id] = { text: "Confirming: reloading RAMSES and reading from the hub (about 3 min)...", kind: "ok" };
    this._render(true);
    try {
      await this._hass.callService("script", "turn_on", { entity_id: `script.${CONFIRM_SCRIPT}`,
        variables: { zone: id, expected: p.expected, before: p.before, days: p.days, source: p.source, roundtrip: p.roundTrip } });
      let lw = null;
      for (let i = 0; i < 72; i++) {           // up to 6 min
        await sleep(5000);
        const st = this._hass.states[LAST_WRITE];
        if (st && st.state !== before && st.attributes.entity_id === id) { lw = st.attributes; break; }
      }
      if (!lw) this._status[id] = { text: "No result yet: check the logbook (Evohome schedule) in a few minutes.", kind: "err" };
      else if (lw.result === "confirmed from hub") this._status[id] = { text: `Confirmed from the hub (${lw.days}).${p.roundTrip ? " Round trip passed: room changes allowed." : ""}`, kind: "ok" };
      else this._status[id] = { text: "NOT confirmed: the hub holds something different. Check the hub screen; nothing else will be written until you decide.", kind: "err" };
    } catch (e) {
      this._status[id] = { text: `Confirm failed to start: ${e.message || e}`, kind: "err" };
    }
    this._writing = false;
    this._render(true);
  }

  _undoInfo(id) {
    const lw = this._hass.states[LAST_WRITE];
    const a = lw?.attributes || {};
    if (id.startsWith("water_heater.")) return null;
    if (a.entity_id !== id || a.source === "undo" || !Array.isArray(a.before) || !a.before.length) return null;
    if (sameSchedule(a.before, a.after)) return null;
    return { before: a.before, after: a.after, when: lw.state, days: a.days };
  }

  async _undo(id) {
    const u = this._undoInfo(id);
    if (!u) return;
    const why0 = this._guard(id, false, true);
    if (why0) { this._status[id] = { text: why0, kind: "err" }; this._render(true); return; }
    // Fresh read; undo only if the hub still holds exactly what that write put there.
    try {
      await this._hass.callService("ramses_cc", `get_${this._domain(id)}_schedule`, { entity_id: id });
      await sleep(2000);
    } catch (err) {
      this._status[id] = { text: `Could not read the hub first: ${err.message || err}. Nothing written.`, kind: "err" };
      this._render(true);
      return;
    }
    if (!sameSchedule(this._live(id), u.after)) {
      this._status[id] = { text: "Undo not possible: the schedule has changed since that write.", kind: "err" };
      this._render(true);
      return;
    }
    const why = this._guard(id, false, true);
    if (why) { this._status[id] = { text: why, kind: "err" }; this._render(true); return; }
    if (!confirm(`Undo the last write to ${this._name(id)} (${u.days})?`)) return;
    await this._write(id, clone(u.before), clone(this._live(id)), `undo ${u.days}`, "undo");
  }

  // ---------- editor ----------
  _openEditor(id, day) {
    if (id.startsWith("water_heater.")) {
      this._status[id] = { text: DHW_READONLY, kind: "err" };
      this._render(true);
      return;
    }
    const live = this._live(id);
    if (!live) {
      this._status[id] = { text: "Read the live schedule first (refresh button), then edit.", kind: "err" };
      this._render(true);
      return;
    }
    const isDhw = id.startsWith("water_heater.");
    const sps = this._daySps(live, day).map((p) => ({
      min: toMin(p.time_of_day),
      v: isDhw ? !!p.enabled : Number(p.heat_setpoint),
    }));
    this._edit = { id, day, isDhw, sps, copy: new Set(), error: "", base: clone(live) };
    this._render(true);
  }

  _closeEditor() {
    this._edit = null;
    this._render(true);
  }

  _readEditorInputs() {
    const e = this._edit;
    this.querySelectorAll(".ed-row").forEach((row) => {
      const i = Number(row.dataset.i);
      const t = row.querySelector(".ed-time").value;
      if (t) e.sps[i].min = toMin(t);
      const vEl = row.querySelector(".ed-val");
      e.sps[i].v = e.isDhw ? vEl.value === "on" : Number(vEl.value);
    });
  }

  _validate() {
    const e = this._edit;
    if (!e.sps.length) return "A day needs at least one switchpoint.";
    if (e.sps.length > MAX_SP) return `Evohome allows at most ${MAX_SP} switchpoints a day.`;
    const mins = e.sps.map((s) => s.min);
    if (mins.some((m) => !Number.isFinite(m) || m < 0 || m >= 1440)) return "Each switchpoint needs a time.";
    if (mins.some((m) => m % 10 !== 0)) return "Times must be on 10-minute steps (e.g. 06:30, 06:40).";
    if (new Set(mins).size !== mins.length) return "Two switchpoints have the same time.";
    if (!e.isDhw && e.sps.some((s) => !(s.v >= 5 && s.v <= 35) || Math.round(s.v * 2) !== s.v * 2)) {
      return "Setpoints must be 5-35 \u00B0C in 0.5 steps.";
    }
    return "";
  }

  async _save() {
    this._readEditorInputs();
    const e = this._edit;
    e.error = this._validate();
    if (e.error) { this._render(true); return; }
    const days = [e.day, ...[...e.copy].filter((d) => d !== e.day)].sort();
    const daySps = e.sps.slice().sort((a, b) => a.min - b.min).map((s) => (e.isDhw
      ? { time_of_day: fmtMin(s.min), enabled: !!s.v }
      : { time_of_day: fmtMin(s.min), heat_setpoint: s.v }));
    const next = [0, 1, 2, 3, 4, 5, 6].map((d) => (days.includes(d)
      ? { day_of_week: d, switchpoints: daySps.map((p) => ({ ...p })) }
      : { day_of_week: d, switchpoints: this._daySps(e.base, d) }));
    const roundTrip = sameSchedule(next, e.base);
    e.error = this._guard(e.id, roundTrip);
    if (e.error) { this._render(true); return; }

    // Fresh read just before writing: stop if the hub no longer holds what was edited.
    e.error = "Checking the hub's current schedule...";
    this._render(true);
    try {
      await this._hass.callService("ramses_cc", `get_${this._domain(e.id)}_schedule`, { entity_id: e.id });
      await sleep(2000);
    } catch (err) {
      e.error = `Could not read the hub first: ${err.message || err}. Nothing written.`;
      this._render(true);
      return;
    }
    if (!sameSchedule(this._live(e.id), e.base)) {
      e.error = "The hub's schedule has changed since you opened the editor. Nothing written: cancel and reopen.";
      this._render(true);
      return;
    }
    e.error = "";
    const what = days.map((d) => DAYS[d]).join(", ");
    const msg = roundTrip
      ? `Round-trip test: write ${this._name(e.id)} back to the hub unchanged?`
      : `Write ${this._name(e.id)} (${what}) to the hub?`;
    if (!confirm(msg)) { this._render(true); return; }
    const id = e.id;
    const base = e.base;
    this._edit = null;
    await this._write(id, next, base, roundTrip ? `round trip (${what})` : what, "card");
  }

  _editorHtml() {
    const e = this._edit;
    const rows = e.sps.map((s, i) => {
      const val = e.isDhw
        ? `<select class="ed-val"><option value="on" ${s.v ? "selected" : ""}>On</option><option value="off" ${s.v ? "" : "selected"}>Off</option></select>`
        : `<input class="ed-val" type="number" min="5" max="35" step="0.5" value="${esc(s.v)}"> \u00B0C`;
      return `<div class="ed-row" data-i="${i}">
        <input class="ed-time" type="time" step="600" value="${fmtMin(s.min)}">
        ${val}
        <button class="ed-del" data-i="${i}" title="Delete">\u2715</button>
      </div>`;
    }).join("");
    const copy = DAYS.map((d, i) => (i === e.day ? "" :
      `<label class="ed-day"><input type="checkbox" data-copy="${i}" ${e.copy.has(i) ? "checked" : ""}>${d}</label>`)).join("");
    return `<div class="editor">
      <div class="ed-title">Edit ${esc(this._name(e.id))} \u2013 ${DAYS[e.day]}</div>
      ${rows}
      <div class="ed-actions">
        <button class="ed-add" ${e.sps.length >= MAX_SP ? "disabled" : ""}>+ Add switchpoint</button>
      </div>
      <div class="ed-copy"><span>Also apply to:</span> ${copy}
        <button class="ed-quick" data-q="wd">Weekdays</button>
        <button class="ed-quick" data-q="we">Weekend</button>
        <button class="ed-quick" data-q="all">All</button>
        <button class="ed-quick" data-q="none">None</button>
      </div>
      ${e.error ? `<div class="msg err">${esc(e.error)}</div>` : ""}
      <div class="ed-actions">
        <button class="ed-cancel">Cancel</button>
        <button class="ed-save primary">Save to hub</button>
      </div>
    </div>`;
  }

  // ---------- render ----------
  _render(force) {
    if (!this._hass || !this._config) return;
    const ids = this._entities();
    const key = JSON.stringify([
      ids.map((id) => {
        const a = this._hass.states[id].attributes;
        return [id, a.schedule, a.current_temperature, a.temperature];
      }),
      this._hass.states[SNAPSHOT]?.state,
      [...this._expanded], [...this._busy], [...this._collapsed], this._status,
      [EDITING, GATEWAY, RT_ZONE, RT_DHW].map((e) => this._hass.states[e]?.state),
      this._hass.states[LAST_WRITE]?.state,
    ]);
    if (!force && key === this._lastKey) return;
    this._lastKey = key;

    const today = (new Date().getDay() + 6) % 7;
    const title = this._config.title ?? "Heating and hot water schedules";
    const order = ["Hot water", "Underfloor (downstairs hub)", "Radiators (upstairs hub)", "Other"];
    const groups = {};
    for (const id of ids) (groups[this._group(id)] ||= []).push(id);

    let body = "";
    for (const g of order) {
      const members = groups[g];
      if (!members || !members.length) continue;
      const shut = this._collapsed.has(g);
      body += `<div class="group" data-group="${esc(g)}"><span class="chev">${shut ? "\u25B8" : "\u25BE"}</span>${esc(g)} <span class="count">${members.length}</span></div>`;
      if (shut) continue;
      for (const id of members) {
        const a = this._hass.states[id].attributes;
        const isDhw = id.startsWith("water_heater.");
        const { sched, source, when } = this._schedule(id);
        const open = this._expanded.has(id);
        const busy = this._busy.has(id);
        const now = isDhw
          ? `${a.current_temperature ?? "?"}\u00B0`
          : `${a.current_temperature ?? "?"}\u00B0 / ${a.temperature ?? "?"}\u00B0`;
        let note = "";
        if (source === "snapshot") note = ` <span class="note" title="from snapshot ${esc(new Date(when).toLocaleString())}">snapshot</span>`;
        if (source === "none") note = ' <span class="note">not read</span>';
        if (this._pending(id)) note += ' <span class="note">sent \u2013 not confirmed</span>';
        const zm = a.mode && typeof a.mode === "object" ? a.mode : null;
        if (!isDhw && zm && /override/.test(String(zm.mode || ""))) {
          const perm = String(zm.mode).startsWith("permanent");
          const until = zm.until ? ` until ${new Date(zm.until).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}` : "";
          note += ` <span class="ovr" title="${esc(zm.mode)}">${perm ? "permanent" : "override"} ${esc(zm.setpoint ?? "")}\u00B0${esc(until)}</span>`;
        }
        const todayBar = sched ? this._bar(sched, today, isDhw, true) : '<div class="bar empty"></div>';
        body += `<div class="row ${open ? "open" : ""}" data-id="${esc(id)}">
          <div class="line main">
            <div class="who"><div class="name">${esc(this._name(id))}</div><div class="sub">${esc(now)}${note}</div></div>
            <div class="track">${todayBar}</div>
            <button class="icon" data-refresh="${esc(id)}" title="Read from hub" ${busy ? "disabled" : ""}>${busy ? "\u2026" : "\u21BB"}</button>
          </div>`;
        const st = this._status[id];
        if (st) body += `<div class="msg ${st.kind}">${esc(st.text)}</div>`;
        if (open && sched) {
          const editable = source === "live" && !isDhw;
          for (let d = 0; d < 7; d++) {
            body += `<div class="line wk ${d === today ? "today" : ""}"><div class="who dl">${DAYS[d]}</div>
              <div class="track">${this._bar(sched, d, isDhw, d === today)}</div>
              ${isDhw ? '<span class="pad"></span>' : `<button class="icon edit" data-edit="${esc(id)}" data-day="${d}" title="${editable ? "Edit this day" : "Read the live schedule first"}">\u270E</button>`}</div>`;
            if (this._edit && this._edit.id === id && this._edit.day === d) body += this._editorHtml();
          }
          const snap = isDhw ? null : this._snapshot(id);
          const undo = this._undoInfo(id);
          const pend = this._pending(id);
          let hint = "";
          if (isDhw) hint = '<span class="hint">Read-only: change hot water in the Evohome app or on the hub.</span>';
          else if (!editable) hint = '<span class="hint">Showing the snapshot: tap \u21BB to read the live schedule before editing.</span>';
          body += `<div class="row-actions">
            ${hint}
            ${pend ? `<button class="primary" data-confirm="${esc(id)}" title="Sent ${esc(new Date(pend.when).toLocaleString())}">Confirm from hub</button>` : ""}
            ${undo ? `<button class="undo" data-undo="${esc(id)}" title="Last write ${esc(new Date(undo.when).toLocaleString())}">Undo last write</button>` : ""}
            ${snap ? `<button class="restore" data-restore="${esc(id)}" title="Snapshot ${esc(new Date(snap.when).toLocaleString())}">Restore from snapshot</button>` : ""}
          </div>`;
        }
        body += "</div>";
      }
    }

    const axis = `<div class="line axis"><div class="who"></div><div class="track ticks">
      ${[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => `<span style="left:${(h / 24) * 100}%">${String(h).padStart(2, "0")}</span>`).join("")}
    </div><span class="pad"></span></div>`;
    const snapState = this._hass.states[SNAPSHOT]?.state;
    const snapText = snapState && !["unknown", "unavailable"].includes(snapState)
      ? `Snapshot: ${new Date(snapState).toLocaleString()}` : "No snapshot yet";
    const top = this._status._top;
    const editingOn = this._hass.states[EDITING]?.state === "on";
    const gwReason = this._gatewayReason();
    const rtZone = this._hass.states[RT_ZONE]?.state === "on";
    const guardsBar = `<div class="guards">
      <button class="edit-toggle ${editingOn ? "on" : ""}" title="Master switch for writing schedules">Editing: ${editingOn ? "ON" : "off"}</button>
      <span class="chip ${gwReason ? "bad" : "good"}">${gwReason ? esc(gwReason) : "Gateway ready"}</span>
      <span class="chip ${rtZone ? "good" : "warn"}">Rooms: ${rtZone ? "changes allowed" : "round trip needed"}</span>
      <span class="chip warn" title="ramses_cc issue #1427">Hot water: read-only (app/hub)</span>
    </div>`;

    this.innerHTML = `
      <ha-card>
        <style>
          .wrap { padding: 12px 12px 10px; }
          .top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
          .title { font-size: 1.2em; font-weight: 500; margin-right: auto; }
          .snapinfo { font-size: 0.75em; color: var(--secondary-text-color); }
          button { font: inherit; font-size: 0.8em; padding: 2px 10px; border-radius: 12px; cursor: pointer;
                   border: 1px solid var(--divider-color); background: var(--secondary-background-color);
                   color: var(--primary-text-color); }
          button.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
          button:disabled { opacity: 0.5; cursor: default; }
          button.icon { width: 26px; height: 22px; padding: 0; border-radius: 6px; flex: none; }
          .group { margin: 8px 0 2px; padding: 4px 0; font-size: 0.85em; font-weight: 600; cursor: pointer;
                   color: var(--secondary-text-color); border-bottom: 1px solid var(--divider-color); user-select: none; }
          .chev { display: inline-block; width: 14px; }
          .count { font-weight: 400; opacity: 0.7; }
          .row { padding: 1px 0; }
          .row.open { background: var(--secondary-background-color); border-radius: 6px; padding: 2px 0 6px; }
          .line { display: flex; align-items: center; gap: 8px; min-height: 22px; }
          .line.main { cursor: pointer; padding: 2px 0; }
          .who { width: var(--who-w, 170px); flex: none; overflow: hidden; box-sizing: border-box; }
          .name { font-size: 0.9em; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .sub { font-size: 0.72em; color: var(--secondary-text-color); white-space: nowrap; }
          .note { color: var(--warning-color, #c80); }
          .ovr { color: var(--info-color, #039be5); font-weight: 600; }
          .dl { text-align: right; font-size: 0.75em; color: var(--secondary-text-color); padding-right: 4px; }
          .wk.today .dl { color: var(--primary-text-color); font-weight: 600; }
          .track { position: relative; flex: 1; min-width: 0; }
          .pad { width: 26px; flex: none; }
          .bar { position: relative; height: 16px; border-radius: 4px; overflow: hidden; background: var(--secondary-background-color); }
          .row.open .bar { background: var(--card-background-color, #fff); }
          .bar.empty { opacity: 0.5; }
          .seg { position: absolute; top: 0; bottom: 0; font-size: 0.68em; line-height: 16px; text-align: center;
                 overflow: hidden; white-space: nowrap; border-right: 1px solid var(--card-background-color, #fff); }
          .now { position: absolute; top: -2px; bottom: -2px; width: 2px; background: var(--primary-text-color); }
          .ticks { height: 14px; font-size: 0.68em; color: var(--secondary-text-color); }
          .ticks span { position: absolute; transform: translateX(-50%); }
          .ticks span:first-child { transform: none; }
          .ticks span:last-child { transform: translateX(-100%); }
          .msg { font-size: 0.78em; margin: 2px 0 2px var(--who-w, 170px); padding-left: 8px; }
          .msg.ok { color: var(--success-color, #4caf50); }
          .msg.err { color: var(--error-color, #db4437); }
          .row-actions { display: flex; gap: 8px; align-items: center; justify-content: flex-end; margin: 4px 34px 0 0; flex-wrap: wrap; }
          .hint { font-size: 0.75em; color: var(--warning-color, #c80); margin-right: auto; padding-left: 8px; }
          .editor { margin: 4px 34px 6px var(--who-w, 170px); padding: 8px 10px; border-radius: 6px;
                    background: var(--card-background-color, #fff); border: 1px solid var(--divider-color); font-size: 0.85em; }
          .ed-title { font-weight: 600; margin-bottom: 6px; }
          .ed-row { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
          .editor input, .editor select { font: inherit; padding: 2px 4px; border-radius: 4px; border: 1px solid var(--divider-color);
                    background: var(--secondary-background-color); color: var(--primary-text-color); }
          .ed-val[type=number] { width: 64px; }
          .ed-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px; }
          .ed-actions:first-of-type { justify-content: flex-start; }
          .ed-copy { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }
          .ed-day { display: inline-flex; align-items: center; gap: 2px; }
          .guards { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 0 0 6px; font-size: 0.85em; }
          .edit-toggle.on { background: var(--warning-color, #ff9800); color: #000; border-color: var(--warning-color, #ff9800); }
          .chip { font-size: 0.75em; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--divider-color); }
          .chip.good { color: var(--success-color, #4caf50); }
          .chip.warn { color: var(--warning-color, #c80); }
          .chip.bad { color: var(--error-color, #db4437); }
          @media (max-width: 500px) { .wrap { --who-w: 112px; } .editor { margin-left: 0; margin-right: 0; } .msg { margin-left: 0; } }
        </style>
        <div class="wrap">
          <div class="top">
            <span class="title">${esc(title)}</span>
            <span class="snapinfo">${esc(snapText)}</span>
            <button class="snap-all" title="Save every schedule to the snapshot (a few minutes)">Snapshot</button>
            <button class="refresh-all" title="Read every schedule from the hubs (a few minutes)">Refresh all</button>
          </div>
          ${guardsBar}
          ${top ? `<div class="msg ${top.kind}" style="margin-left:0">${esc(top.text)}</div>` : ""}
          ${axis}
          ${body || '<div class="note">No RAMSES zones or cylinders found.</div>'}
        </div>
      </ha-card>`;

    this._bind();
  }

  _bind() {
    this.querySelectorAll(".line.main").forEach((el) =>
      el.addEventListener("click", (ev) => {
        if (ev.target.closest("button")) return;
        const id = el.parentElement.dataset.id;
        if (this._expanded.has(id)) this._expanded.delete(id); else this._expanded.add(id);
        if (this._edit && this._edit.id === id) this._edit = null;
        this._render(true);
      }));
    this.querySelectorAll(".group").forEach((el) =>
      el.addEventListener("click", () => {
        const g = el.dataset.group;
        if (this._collapsed.has(g)) this._collapsed.delete(g); else this._collapsed.add(g);
        this._render(true);
      }));
    this.querySelectorAll("[data-refresh]").forEach((el) =>
      el.addEventListener("click", () => { delete this._status[el.dataset.refresh]; this._refresh(el.dataset.refresh); }));
    this.querySelectorAll("[data-edit]").forEach((el) =>
      el.addEventListener("click", () => {
        if (this._edit && this._edit.id === el.dataset.edit && this._edit.day === Number(el.dataset.day)) this._closeEditor();
        else this._openEditor(el.dataset.edit, Number(el.dataset.day));
      }));
    this.querySelectorAll("[data-confirm]").forEach((el) =>
      el.addEventListener("click", () => this._confirm(el.dataset.confirm)));
    this.querySelectorAll("[data-undo]").forEach((el) =>
      el.addEventListener("click", () => this._undo(el.dataset.undo)));
    this.querySelector(".edit-toggle")?.addEventListener("click", () =>
      this._hass.callService("input_boolean", "toggle", { entity_id: EDITING }));
    this.querySelectorAll("[data-restore]").forEach((el) =>
      el.addEventListener("click", () => this._restore(el.dataset.restore)));
    this.querySelector(".refresh-all")?.addEventListener("click", () => this._refreshAll());
    this.querySelector(".snap-all")?.addEventListener("click", () => this._snapshotAll());

    if (!this._edit) return;
    const e = this._edit;
    this.querySelectorAll(".ed-del").forEach((b) => b.addEventListener("click", () => {
      this._readEditorInputs();
      e.sps.splice(Number(b.dataset.i), 1);
      this._render(true);
    }));
    this.querySelector(".ed-add")?.addEventListener("click", () => {
      this._readEditorInputs();
      const last = e.sps.length ? Math.max(...e.sps.map((s) => s.min)) : 360;
      const min = Math.min(1430, last + 60 - ((last + 60) % 10));
      e.sps.push({ min, v: e.isDhw ? false : 12 });
      this._render(true);
    });
    this.querySelectorAll("[data-copy]").forEach((c) => c.addEventListener("change", () => {
      const d = Number(c.dataset.copy);
      if (c.checked) e.copy.add(d); else e.copy.delete(d);
    }));
    this.querySelectorAll(".ed-quick").forEach((b) => b.addEventListener("click", () => {
      this._readEditorInputs();
      const q = b.dataset.q;
      const set = q === "wd" ? [0, 1, 2, 3, 4] : q === "we" ? [5, 6] : q === "all" ? [0, 1, 2, 3, 4, 5, 6] : [];
      e.copy = new Set(set.filter((d) => d !== e.day));
      this._render(true);
    }));
    this.querySelector(".ed-cancel")?.addEventListener("click", () => this._closeEditor());
    this.querySelector(".ed-save")?.addEventListener("click", () => this._save());
  }
}

customElements.define("evohome-schedule-card", EvohomeScheduleCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "evohome-schedule-card",
  name: "Evohome schedule card",
  description: "View Evohome zone and hot water schedules and edit zone schedules via RAMSES RF (v5).",
});
