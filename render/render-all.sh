#!/usr/bin/env bash
# Renders every frame the journey needs, then encodes them for the site. Takes hours on a laptop GPU.
# Each chapter is one Blender session (the scene is built once and Cycles keeps it warm between frames);
# a failed job is logged and the batch carries on, so a single job can be re-run on its own (see run.py).
#   bash render/render-all.sh            everything
#   bash render/render-all.sh stills     stills, line drawings and anchors only
set -u
cd "$(dirname "$0")/.."
B="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.3/blender.exe}"
LOG=render/out/render.log
mkdir -p render/out
run() {
  echo "== $* ($(date +%H:%M:%S))" | tee -a "$LOG"
  "$B" -b -y --factory-startup -P render/journey/run.py -- "$@" >> "$LOG" 2>&1 || echo "!! failed: $*" | tee -a "$LOG"
}
walk() { [ "${1:-all}" != "stills" ]; }

run anchors + lines 0 + lines 1 + lines 2 + lines 3 + lines 4 + lines 5
run still 0 0 day c0-after
for c in 1 2 3 4; do
  if walk "${1:-all}"; then
    run still "$c" $((c - 1)) day "c$c-before" + still "$c" "$c" day "c$c-after" + travel "$c" 0 11
  else
    run still "$c" $((c - 1)) day "c$c-before" + still "$c" "$c" day "c$c-after"
  fi
done
if walk "${1:-all}"; then
  run still 5 4 day c5-before + still 5 5 day c5-after + still 5 5 dusk c5-dusk + still 5 5 night c5-night + travel 5 0 11
else
  run still 5 4 day c5-before + still 5 5 day c5-after + still 5 5 dusk c5-dusk + still 5 5 night c5-night
fi
grep -E "RENDERED|LINES|ANCHORS|JOB FAILED|Traceback" "$LOG" | tail -n 60
node render/encode.mjs | tee -a "$LOG"
