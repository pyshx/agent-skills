#!/usr/bin/env bash
set -eu
skill="$(cd "$(dirname "$0")/../../skills/eval-review" && pwd)"
mkdir -p "examples"
cp "$skill/examples/experiment_baseline.csv" "examples/experiment_baseline.csv"
mkdir -p "examples"
cp "$skill/examples/experiment_cond_a.csv" "examples/experiment_cond_a.csv"
mkdir -p "examples"
cp "$skill/examples/experiment_cond_b.csv" "examples/experiment_cond_b.csv"
mkdir -p "examples"
cp "$skill/examples/experiment_cond_c.csv" "examples/experiment_cond_c.csv"
