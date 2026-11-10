#!/usr/bin/env bash
set -eu
skill="$(cd "$(dirname "$0")/../../skills/eval-review" && pwd)"
mkdir -p "examples"
cp "$skill/examples/factcheck.csv" "examples/factcheck.csv"
