@echo off
title Xizmatchi - Platforma va Telegram Botlar
echo ===================================================
echo   Xizmatchi platformasi va Telegram Botlar ishga tushmoqda...
echo   Mijoz boti: @xizmatchiuz_Uzbekistan_bot
echo   Egasi boti: @xizmatchiuz_Uzbekistan_ownerbot
echo   Sayt:       http://localhost:3000
echo ===================================================
echo.
start "Xizmatchi Mijoz Boti" cmd /k "node bot.mjs"
start "Xizmatchi Egasi Boti" cmd /k "node bot_owner.mjs"
timeout /t 2 /nobreak >nul
start http://localhost:3000
npm run dev
pause
