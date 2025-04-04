@echo off
echo Starting TripWise Keep-Alive Service...
start /B pythonw keep_alive.py
echo Service started in background. Check keep_alive.log for status.
pause
