@echo off
echo Starting Backend and Frontend servers...

echo Starting Backend...
start "Backend" cmd /k "cd backend && pip install -r requirements.txt && python -m uvicorn main:app --reload --host 0.0.0.0"

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev -- --host"

echo Both servers are starting in separate windows.
