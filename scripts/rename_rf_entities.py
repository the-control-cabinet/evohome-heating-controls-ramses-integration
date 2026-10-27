# Rename ramses_cc entities that clashed with the cloud Evohome integration.
# When both integrations create e.g. climate.hall, ramses_cc's copy becomes climate.hall_2.
# This renames every ramses_cc "<name>_2" whose base ID belongs to ANOTHER integration to "rf_<name>".
# USAGE (HA OS terminal):  ha core stop ; python3 rename_rf_entities.py ; ha core start
# A backup of the registry is written first (core.entity_registry.bak) - delete it once HA is confirmed healthy.
import json, shutil
p = '/config/.storage/core.entity_registry'
shutil.copy(p, p + '.bak')
d = json.load(open(p))
ents = d['data']['entities']
plat = {e['entity_id']: e.get('platform') for e in ents}
n = 0
for e in ents:
    eid = e['entity_id']; dom, obj = eid.split('.', 1)
    if e.get('platform') != 'ramses_cc' or not obj.endswith('_2'):
        continue
    base = dom + '.' + obj[:-2]
    new = dom + '.rf_' + obj[:-2]
    if plat.get(base) not in (None, 'ramses_cc') and new not in plat:
        print(eid, '->', new)
        e['entity_id'] = new; n += 1
json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False)
print('renamed', n)
