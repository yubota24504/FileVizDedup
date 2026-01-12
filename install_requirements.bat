@echo off
echo Installing dependencies...
REM Prefer online install via requirements.txt or use the offline wheels in backend/vendor/wheels
if exist requirements.txt (
	pip install -r requirements.txt
) else (
	pip install fastapi uvicorn pydantic
)
echo Installation complete.
pause
