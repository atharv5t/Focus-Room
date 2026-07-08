#!/bin/bash
killall python3 uvicorn node 2>/dev/null

# Open the backend listening to the local network on port 8000
osascript -e 'tell application "Terminal" to do script "cd \"/Users/ushakiran/Documents/Focus Room Clean/backend\" && python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload"'

# Run the frontend
cd "/Users/ushakiran/Documents/Focus Room Clean/frontend"
npx yarn start
