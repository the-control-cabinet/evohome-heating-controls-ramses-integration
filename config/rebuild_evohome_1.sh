#!/bin/sh
# Rebuild custom_components/evohome_1 (the second-hub copy of the core Evohome integration) from
# Home Assistant 2026.11.2's own Evohome code, so both hubs use evohome-async 3.1.0 after the update.
# Run in the HA Terminal IMMEDIATELY BEFORE clicking the HA 2026.11.2 update (the new code needs 2026.11).
# Only change made to the core files: DOMAIN "evohome" -> "evohome_1" (as in the current copy), plus a
# custom-component manifest. The current copy is kept at /config/evohome_1_backup_2026.10 for rollback.
set -e
SRC=https://raw.githubusercontent.com/home-assistant/core/2026.11.2/homeassistant/components/evohome
DST=/config/custom_components/evohome_1
BAK=/config/evohome_1_backup_2026.10
FILES="__init__.py button.py climate.py const.py coordinator.py entity.py helpers.py icons.json services.py services.yaml storage.py strings.json water_heater.py"

[ -d "$BAK" ] || cp -r "$DST" "$BAK"
echo "Backup: $BAK"

TMP=$(mktemp -d)
for f in $FILES; do
  curl -fsSL -o "$TMP/$f" "$SRC/$f" || { echo "Download failed: $f - nothing changed"; rm -rf "$TMP"; exit 1; }
done
grep -q '^DOMAIN: Final = "evohome"$' "$TMP/const.py" || { echo "const.py not as expected - nothing changed"; rm -rf "$TMP"; exit 1; }
sed -i 's/^DOMAIN: Final = "evohome"$/DOMAIN: Final = "evohome_1"/' "$TMP/const.py"

cat > "$TMP/manifest.json" <<'EOF'
{
  "version": "0.0.2",
  "domain": "evohome_1",
  "name": "Honeywell Total Connect Comfort (Europe)",
  "codeowners": ["@zxdavb"],
  "documentation": "https://www.home-assistant.io/integrations/evohome",
  "iot_class": "cloud_polling",
  "loggers": ["evohomeasync", "evohomeasync2"],
  "quality_scale": "legacy",
  "requirements": ["evohome-async==3.1.0"]
}
EOF

rm -rf "$DST/__pycache__"
for f in $FILES manifest.json; do cp "$TMP/$f" "$DST/$f"; done
rm -rf "$TMP"

echo "--- check ---"
grep -n '^DOMAIN' "$DST/const.py"
grep -n 'requirements' "$DST/manifest.json"
ls "$DST"
echo "Done. Now update Home Assistant to 2026.11.2 (Settings > System > Updates)."
