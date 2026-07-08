#!/bin/bash
killall python3 uvicorn node 2>/dev/null
osascript -e 'tell application "Terminal" to quit'
