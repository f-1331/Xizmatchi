@echo off
title Xizmatchi.uz - Unified Server & Render HA Watchdog
cd /d "%~dp0"
echo =======================================================
echo   Xizmatchi.uz - Local Backup Server + Auto Failback
echo   Mijoz boti:  @xizmatchiuz_Uzbekistan_bot
echo   Egasi boti:  @xizmatchiuz_Uzbekistan_ownerbot
echo   Rasmiy sayt: https://xizmatchi.vercel.app
echo =======================================================
start "Xizmatchi Render HA Watchdog" /min python render_failback_watchdog.py
python run_unified_server.py
pause
