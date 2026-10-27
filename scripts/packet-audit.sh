#!/bin/sh
# RAMSES-II packet-log checks for ramses_cc (run in the HA terminal / SSH add-on).
# Logs: /config/ramses_rf_logs/packet_log.log (+ rotated packet_log.log.*)
# Gateway (HGI) address: SET THIS to your own gateway's ID (the repo uses masked placeholder IDs)
GW=18:000001
LOG=/config/ramses_rf_logs/packet_log.log

echo "== 1. Anything the gateway sent that is NOT a read request (expect empty, or only deliberate writes)"
awk -v gw="$GW" '$5==gw && $3!="RQ"' $LOG

echo "== 2. Gateway traffic by verb and code (all logs)"
awk -v gw="$GW" '$5==gw{print $3,$8}' /config/ramses_rf_logs/packet_log* | sort | uniq -c | sort -rn

echo "== 3. Every zone-mode write (W 2349) the gateway ever sent"
grep -h " W --- $GW" /config/ramses_rf_logs/packet_log* | cut -c1-120

echo "== 4. Gateway writes addressed to the downstairs controller"
awk -v gw="$GW" '$5==gw && $6=="01:000002"{print $3,$8}' $LOG | sort | uniq -c

echo "== 5. Packets per hour (gaps = gateway offline / Wi-Fi or MQTT drop)"
cat /config/ramses_rf_logs/packet_log.log* | cut -c1-13 | sort | uniq -c | tail -48

echo "== 6. System-mode packets (2E04) - controllers here never answer/broadcast it"
grep -h "2E04" $LOG | cut -c1-120 | tail -10
