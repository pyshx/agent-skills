#!/usr/bin/env bash
set -eu
skill="$(cd "$(dirname "$0")/../../skills/eval-review" && pwd)"
mkdir -p "examples"
cp "$skill/examples/golden_model_a.csv" "examples/golden_model_a.csv"
mkdir -p "examples"
cp "$skill/examples/golden_model_b.csv" "examples/golden_model_b.csv"
