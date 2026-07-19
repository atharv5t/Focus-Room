#!/bin/bash
set -e

# Resolve this project's folder dynamically, so moving or renaming the project
# does not break local startup.
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

killall python3 uvicorn node 2>/dev/null || true

# Open the backend listening to the local network on port 8000.
osascript -e "tell application \"Terminal\" to do script \"cd \\\"$PROJECT_DIR/backend\\\" && python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload\""

# Run the frontend in this terminal.
cd "$PROJECT_DIR/frontend"
npx yarn start
