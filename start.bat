@echo off
title Xizmatchi - Platforma va Telegram Bot
echo ===================================================
echo   Xizmatchi platformasi va Telegram Bot ishga tushmoqda...
echo   Bot: @xizmatchiuz_Uzbekistan_bot
echo   Sayt: http://localhost:3000
echo ===================================================
echo.
start "Xizmatchi Telegram Bot" cmd /c "node bot.mjs"
start http://localhost:3000
npm run dev
pause
