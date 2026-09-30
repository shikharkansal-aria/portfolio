#!/bin/sh
# Generate the Recruiter-view hero clip with Higgsfield (Seedance 2.0, fast, 8 s, 720p, no audio),
# then encode small web versions + a poster frame into public/video/.
# Cost: ~20 credits. Usage: sh scripts/hero-video.sh   (or pass a local .mp4 to skip generation)
set -eu
cd "$(dirname "$0")/.."
HF="${HF:-$HOME/.local/bin/higgsfield}"
OUT=public/video
mkdir -p "$OUT"

PROMPT='Slow cinematic dolly-in across a warm wooden desk at golden hour. An open laptop glows with abstract ember-orange voice waveforms and a few softly connected nodes, nothing readable on screen. Beside it a paper notebook with hand-drawn flow arrows and a cup of chai with gentle steam; fine dust drifts through a beam of window light. Cream, charcoal and ember-orange palette, shallow depth of field, calm premium 35mm film look. One continuous steady camera move, no cuts, no people, no text, no logos.'

SRC="${1:-}"
if [ -z "$SRC" ]; then
  URL=$("$HF" generate create seedance_2_0 --prompt "$PROMPT" \
        --mode fast --duration 8 --resolution 720p --aspect_ratio 16:9 --generate_audio false \
        --wait --wait-timeout 20m | grep -Eo 'https://[^ ]+\.mp4[^ ]*' | head -n 1)
  [ -n "$URL" ] || { echo "No video URL returned" >&2; exit 1; }
  SRC="$OUT/hero-source.mp4"
  curl -fsSL "$URL" -o "$SRC"
fi

# Short GOP (-g 6) so scroll-scrubbing can seek smoothly; no audio track; faststart for streaming.
ffmpeg -y -loglevel error -i "$SRC" -an -vf "scale=1280:-2,fps=24" \
  -c:v libx264 -preset slow -crf 30 -g 6 -pix_fmt yuv420p -movflags +faststart "$OUT/hero.mp4"
# Poster: first frame, shown on phones, reduced motion, data saver, and before the video loads.
ffmpeg -y -loglevel error -ss 0.15 -i "$SRC" -frames:v 1 -vf "scale=1280:-2" "$OUT/hero-poster.png"
node -e "require('sharp')('$OUT/hero-poster.png').webp({ quality: 72 }).toFile('$OUT/hero-poster.webp')"
rm -f "$OUT/hero-poster.png"

rm -f "$OUT/hero-source.mp4"
ls -lh "$OUT"
