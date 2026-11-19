#!/bin/bash
# Video tools for the TikTok skills (HyperFrames, Remotion, FFmpeg, faster-whisper, yt-dlp, voices)
set -e
command -v ffmpeg >/dev/null || (apt-get update -qq && apt-get install -y -qq ffmpeg)
mkdir -p /tmp/hf && cd /tmp/hf
[ -f package.json ] || npm init -y >/dev/null
npm i --no-audit --no-fund hyperframes@0.9.54 gsap three@0.170.0 esbuild remotion @remotion/cli react react-dom >/dev/null
pip install -q faster-whisper yt-dlp piper-tts kokoro-onnx soundfile shapely scipy
mkdir -p /tmp/hf/voices && cd /tmp/hf/voices
for f in de_DE-thorsten-high.onnx de_DE-thorsten-high.onnx.json; do
  [ -s "$f" ] || curl -sSL -o "$f" "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/high/$f"
done
cd /tmp/hf
./node_modules/.bin/hyperframes telemetry disable >/dev/null 2>&1 || true
./node_modules/.bin/hyperframes tts "Ready." -v am_michael -o /tmp/hf/warmup.wav >/dev/null 2>&1 || true
echo "video tools ready"
