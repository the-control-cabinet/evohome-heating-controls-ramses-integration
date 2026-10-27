#!/bin/sh
# List every ramses_cc device: RAMSES ID | user name | default name (from the HA device registry)
python3 -c "import json;[print(next(i[1] for i in x['identifiers'] if i[0]=='ramses_cc'),'|',x.get('name_by_user'),'|',x.get('name')) for x in json.load(open('/config/.storage/core.device_registry'))['data']['devices'] if any(i[0]=='ramses_cc' for i in x['identifiers'])]"
# Installed ramses_cc version
grep '"version"' /config/custom_components/ramses_cc/manifest.json
