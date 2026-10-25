@echo off
title Xizmatchi - Platforma va Telegram Botlar
echo ===================================================
echo   Xizmatchi platformasi va Telegram Botlar ishga tushmoqda...
echo   Mijoz boti:  @xizmatchiuz_Uzbekistan_bot
echo   Egasi boti:  @xizmatchiuz_Uzbekistan_ownerbot
echo   Rasmiy sayt: https://xizmatchi.vercel.app
echo   Lokal dev:   http://localhost:3000
echo ===================================================
echo.
start "Xizmatchi Mijoz Boti" cmd /k "node bot.mjs"
start "Xizmatchi Egasi Boti" cmd /k "node bot_owner.mjs"
timeout /t 2 /nobreak >nul
start https://xizmatchi.vercel.app
npm run dev
pause
