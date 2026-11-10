#!/usr/bin/env bash
set -eu
skill="$(cd "$(dirname "$0")/../../skills/eval-review" && pwd)"
mkdir -p "examples"
cp "$skill/examples/feedback.csv" "examples/feedback.csv"
