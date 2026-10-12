#!/bin/bash
# Installs dependencies so Claude Code cloud sessions can run lint, typecheck and tests.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
pnpm install
