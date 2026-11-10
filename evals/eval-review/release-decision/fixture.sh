#!/usr/bin/env bash
set -eu
skill="$(cd "$(dirname "$0")/../../skills/eval-review" && pwd)"
mkdir -p "examples"
cp "$skill/examples/release_current.csv" "examples/release_current.csv"
mkdir -p "examples"
cp "$skill/examples/release_cand_b.csv" "examples/release_cand_b.csv"
mkdir -p "examples"
cp "$skill/examples/release_cand_c.csv" "examples/release_cand_c.csv"
mkdir -p "examples"
cp "$skill/examples/release_cand_d.csv" "examples/release_cand_d.csv"
