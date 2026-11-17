import asyncio
import json
import logging
import os
import re
import subprocess
import sys
import time
from pathlib import Path
import httpx

BASE_DIR = Path(__file__).resolve().parent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s",
    handlers=[
        logging.FileHandler(BASE_DIR / "watchdog.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("ha_failover_watchdog")

RENDER_URL = "https://xizmatchi-telegram-bots.onrender.com"
RENDER_HEALTH_URL = f"{RENDER_URL}"
LOCAL_HEALTH_URL = "http://127.0.0.1:3050"
OWNER_TELEGRAM_ID = 6707839718
OWNER_BOT_TOKEN = "8668786258:AAE9DHGGB2g6n7RSC29a4o-q4rlYxjRFyBA"
CHECK_INTERVAL_SECONDS = 90  # Check every 90 seconds
STATE_FILE = BASE_DIR / "failover_state.json"


def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "current_target": "UNKNOWN",
        "render_fail_count": 0,
        "render_success_count": 0,
        "last_switch_time": None
    }


def save_state(state: dict):
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        logger.warning(f"Could not save state: {e}")


def get_current_vercel_target() -> str:
    vercel_path = BASE_DIR / "vercel.json"
    if not vercel_path.exists():
        return "UNKNOWN"
    try:
        with open(vercel_path, "r", encoding="utf-8") as f:
            content = f.read()
        if "xizmatchi-telegram-bots.onrender.com" in content:
            return "RENDER"
        elif "trycloudflare.com" in content:
            return "TUNNEL"
    except Exception:
        pass
    return "UNKNOWN"


def get_active_tunnel_url() -> str:
    tunnel_file = BASE_DIR / "tunnel_url.txt"
    if tunnel_file.exists():
        try:
            with open(tunnel_file, "r", encoding="utf-8") as f:
                url = f.read().strip()
                if url.startswith("https://") and "trycloudflare.com" in url:
                    return url
        except Exception:
            pass
    return ""


def update_vercel_route(new_target_url: str, target_name: str) -> bool:
    vercel_path = BASE_DIR / "vercel.json"
    if not vercel_path.exists():
        logger.error("vercel.json does not exist!")
        return False

    try:
        with open(vercel_path, "r", encoding="utf-8") as f:
            content = f.read()

        old_pattern = r'https://[a-zA-Z0-9\.\-]+\.(?:onrender\.com|trycloudflare\.com)'
        new_content = re.sub(old_pattern, new_target_url, content)

        if new_content == content:
            logger.info(f"vercel.json already points to {new_target_url}")
            return True

        with open(vercel_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        logger.info(f"Updated vercel.json target -> {new_target_url}")

        subprocess.run(["git", "add", "vercel.json"], cwd=str(BASE_DIR), check=True)
        subprocess.run(["git", "commit", "-m", f"chore(ha-failover): auto-route to {target_name} ({new_target_url})"], cwd=str(BASE_DIR), check=True)
        subprocess.run(["git", "pull", "--rebase", "origin", "main"], cwd=str(BASE_DIR), check=False)
        subprocess.run(["git", "push", "origin", "main"], cwd=str(BASE_DIR), check=True)
        logger.info(f"✅ Successfully pushed route switch to GitHub -> {target_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to update vercel.json and push: {e}")
        return False


async def notify_owner_telegram(message_html: str):
    url = f"https://api.telegram.org/bot{OWNER_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": OWNER_TELEGRAM_ID,
        "text": message_html,
        "parse_mode": "HTML"
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                logger.info("Telegram notification sent to owner successfully.")
            else:
                logger.warning(f"Telegram returned status {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.warning(f"Could not send Telegram notification to owner: {e}")


async def check_render_health() -> bool:
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(RENDER_HEALTH_URL)
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    if data.get("status") in ("ok", "healthy"):
                        return True
                except Exception:
                    return True
    except Exception:
        pass
    return False


async def check_local_server_health() -> bool:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(LOCAL_HEALTH_URL)
            if resp.status_code == 200:
                return True
    except Exception:
        pass
    return False


async def run_ha_watchdog():
    logger.info("=" * 65)
    logger.info("🔄 Bi-directional High-Availability Failover Watchdog Started")
    logger.info(f"   Primary:  Render ({RENDER_URL})")
    logger.info("   Backup:   Cloudflare Tunnel (Local Machine)")
    logger.info(f"   Cadence:  Every {CHECK_INTERVAL_SECONDS}s")
    logger.info("=" * 65)

    state = load_state()

    while True:
        try:
            current_target = get_current_vercel_target()
            render_alive = await check_render_health()

            if render_alive:
                state["render_success_count"] += 1
                state["render_fail_count"] = 0
                logger.info(f"[HEALTH] Render: UP (success streak: {state['render_success_count']}) | Current Vercel target: {current_target}")

                # CASE 1: Render is UP and has proven stable (>= 2 consecutive successes),
                # but Vercel is currently pointing to backup TUNNEL -> FAILBACK TO RENDER
                if current_target == "TUNNEL" and state["render_success_count"] >= 2:
                    logger.info("🎉 RENDER HAS RECOVERED! Triggering Auto-Failback to Render...")
                    success = update_vercel_route(RENDER_URL, "RENDER")
                    if success:
                        state["current_target"] = "RENDER"
                        state["last_switch_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
                        save_state(state)
                        msg = (
                            "🎉 <b>Render limiti yangilandi va server to'liq tiklandi!</b>\n\n"
                            "Vercel yo'nalishi avtomatik ravishda yana asosiy <b>Render bulut serveriga</b> (<code>xizmatchi-telegram-bots.onrender.com</code>) qaytarildi.\n"
                            "Barcha xizmatlar va Telegram botlar (@xizmatchiuz_Uzbekistan_bot, @xizmatchiuz_Uzbekistan_ownerbot) yana to'liq bulutda uzluksiz ishlamoqda!"
                        )
                        await notify_owner_telegram(msg)
            else:
                state["render_fail_count"] += 1
                state["render_success_count"] = 0
                logger.warning(f"[HEALTH] Render: DOWN (fail streak: {state['render_fail_count']}) | Current Vercel target: {current_target}")

                # CASE 2: Render is DOWN (>= 2 consecutive failures: limit exhausted or 503 suspended),
                # but Vercel is still pointing to RENDER -> FAILOVER TO BACKUP TUNNEL
                if current_target == "RENDER" and state["render_fail_count"] >= 2:
                    logger.warning("🚨 RENDER LIMIT EXHAUSTED OR SUSPENDED! Triggering Auto-Failover to Tunnel...")
                    tunnel_url = get_active_tunnel_url()
                    local_alive = await check_local_server_health()

                    if tunnel_url and local_alive:
                        success = update_vercel_route(tunnel_url, "TUNNEL")
                        if success:
                            state["current_target"] = "TUNNEL"
                            state["last_switch_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
                            save_state(state)
                            msg = (
                                "⚠️ <b>Render limiti tugadi yoki server to'xtab qoldi (503 Service Suspended)!</b>\n\n"
                                "Tizim uzilishsiz ishlashi uchun Vercel avtomatik ravishda <b>Lokal Zaxira (Cloudflare Tunnel)</b> serveriga ulandi.\n"
                                f"🌐 Jonli zaxira manzili: <code>{tunnel_url}</code>\n"
                                "✅ @xizmatchiuz_Uzbekistan_bot va @xizmatchiuz_Uzbekistan_ownerbot 100% uzilishsiz ishlamoqda!"
                            )
                            await notify_owner_telegram(msg)
                    else:
                        logger.error(f"Cannot failover: local_alive={local_alive}, tunnel_url={tunnel_url}")

            save_state(state)

        except Exception as e:
            logger.error(f"Unexpected error in HA watchdog: {e}", exc_info=True)

        await asyncio.sleep(CHECK_INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        asyncio.run(run_ha_watchdog())
    except KeyboardInterrupt:
        logger.info("Watchdog stopped by user.")
