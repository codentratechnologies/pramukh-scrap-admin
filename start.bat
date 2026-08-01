@echo off
echo Starting Backend and Frontend servers...

echo Starting Backend...
start "Backend" cmd /k "cd backend && pip install -r requirements.txt && uvicorn main:app --reload"

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting in separate windows.
