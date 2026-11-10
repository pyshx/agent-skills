#!/usr/bin/env bash
# Run one skill's eval suite: scripts/eval.sh <skill> [claude plugin eval options...]
# claude plugin eval needs the skill and its evals inside one plugin, so this assembles one under .eval-plugins/<skill>/.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
skill="${1:?usage: scripts/eval.sh <skill> [claude plugin eval options...]}"
shift
[[ -f "$root/skills/$skill/SKILL.md" ]] || { echo "no such skill: $skill" >&2; exit 1; }
[[ -d "$root/evals/$skill" ]] || { echo "no evals for skill: $skill" >&2; exit 1; }

plugin="$root/.eval-plugins/$skill"
rm -rf "$plugin"
mkdir -p "$plugin/.claude-plugin" "$plugin/skills"
printf '{"name":"%s","version":"0.0.0-eval"}\n' "$skill" > "$plugin/.claude-plugin/plugin.json"
cp -R "$root/skills/$skill" "$plugin/skills/$skill"
rsync -a --exclude results/ "$root/evals/$skill/" "$plugin/evals/"

exec claude plugin eval "$plugin" --output-dir "$root/evals/$skill/results/$(date -u +%Y-%m-%dT%H-%M-%SZ)" "$@"
