import asyncio
import json
import logging
import os
import re
import subprocess
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
LOCAL_PORT = int(os.environ.get("PORT", "3050"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s",
    handlers=[
        logging.FileHandler(BASE_DIR / "unified_server.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("unified_server")

cf_needs_restart = False


def start_cloudflared_tunnel():
    """Start cloudflared in the background and extract the live HTTPS tunnel URL."""
    cf_binary = BASE_DIR / "cloudflared.exe"
    if not cf_binary.exists():
        logger.error(f"cloudflared.exe not found at {cf_binary}")
        return None, None

    cmd = [str(cf_binary), "tunnel", "--url", f"http://127.0.0.1:{LOCAL_PORT}", "--no-autoupdate"]
    logger.info(f"Starting Cloudflare Tunnel on http://127.0.0.1:{LOCAL_PORT} ...")
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    tunnel_url = None
    start = time.time()
    while time.time() - start < 35:
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.1)
            continue
        line_clean = line.strip()
        if "trycloudflare.com" in line_clean:
            match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line_clean)
            if match:
                tunnel_url = match.group(0)
                break

    if not tunnel_url:
        logger.error("Failed to extract tunnel URL within timeout.")
        proc.terminate()
        return None, None

    logger.info(f"✅ Live Cloudflare Tunnel URL: {tunnel_url}")
    with open(BASE_DIR / "tunnel_url.txt", "w", encoding="utf-8") as f:
        f.write(tunnel_url)

    return proc, tunnel_url


def update_vercel_json_and_push(tunnel_url: str):
    """Update vercel.json routes to forward to the active tunnel and git push."""
    vercel_path = BASE_DIR / "vercel.json"
    if not vercel_path.exists():
        logger.warning("vercel.json not found, skipping sync.")
        return

    try:
        with open(vercel_path, "r", encoding="utf-8") as f:
            content = f.read()

        old_pattern = r'https://[a-zA-Z0-9\.\-]+\.(?:onrender\.com|trycloudflare\.com)'
        new_content = re.sub(old_pattern, tunnel_url, content)

        if new_content != content:
            with open(vercel_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            logger.info("Updated vercel.json with new live tunnel URL.")

            subprocess.run(["git", "add", "vercel.json"], cwd=str(BASE_DIR), check=True)
            subprocess.run(["git", "commit", "-m", f"chore(tunnel): route traffic to {tunnel_url}"], cwd=str(BASE_DIR), check=True)
            subprocess.run(["git", "pull", "--rebase", "origin", "main"], cwd=str(BASE_DIR), check=False)
            subprocess.run(["git", "push", "origin", "main"], cwd=str(BASE_DIR), check=True)
            logger.info("✅ Pushed new tunnel route to GitHub for instant Vercel sync!")
        else:
            logger.info("vercel.json is already up to date with tunnel URL.")
    except Exception as e:
        logger.warning(f"Could not automatically sync vercel.json: {e}")


async def monitor_cf_stream(stream):
    """Monitor Cloudflare output and signal renewal if tunnel expires or disconnects."""
    global cf_needs_restart
    while True:
        try:
            line = await asyncio.to_thread(stream.readline)
            if not line:
                cf_needs_restart = True
                break
            line_str = line.strip()
            if line_str:
                logger.info(f"[Cloudflare] {line_str}")
                if "Unauthorized: Tunnel not found" in line_str or "tunnel not found" in line_str.lower():
                    logger.warning("Detected expired Cloudflare tunnel! Requesting re-provisioning...")
                    cf_needs_restart = True
                    break
        except Exception:
            cf_needs_restart = True
            break


async def monitor_node_stream(stream):
    """Keep reading Node process logs and print to logfile."""
    while True:
        try:
            line = await asyncio.to_thread(stream.readline)
            if not line:
                break
            line_str = line.strip()
            if line_str:
                logger.info(f"[NodeBots] {line_str}")
        except Exception:
            break


async def main_unified():
    global cf_needs_restart

    cf_proc, tunnel_url = start_cloudflared_tunnel()
    if not tunnel_url:
        logger.error("Cannot proceed without an active Cloudflare tunnel.")
        sys.exit(1)

    os.environ["PORT"] = str(LOCAL_PORT)
    os.environ["BACKEND_URL"] = tunnel_url

    update_vercel_json_and_push(tunnel_url)

    cf_task = asyncio.create_task(monitor_cf_stream(cf_proc.stdout))

    node_env = {**os.environ, "PORT": str(LOCAL_PORT)}
    logger.info(f"🚀 Launching server_bots.mjs on port {LOCAL_PORT}...")
    node_proc = subprocess.Popen(
        ["node", "server_bots.mjs"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        cwd=str(BASE_DIR),
        env=node_env
    )
    node_task = asyncio.create_task(monitor_node_stream(node_proc.stdout))

    logger.info("🛡️ Starting HA Failback Watchdog in background...")
    watchdog_proc = subprocess.Popen(
        [sys.executable, "render_failback_watchdog.py"],
        cwd=str(BASE_DIR)
    )

    try:
        while True:
            # Check node process health
            if node_proc.poll() is not None:
                logger.warning("Node process exited! Restarting node server_bots.mjs...")
                node_proc = subprocess.Popen(
                    ["node", "server_bots.mjs"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1,
                    cwd=str(BASE_DIR),
                    env=node_env
                )
                node_task = asyncio.create_task(monitor_node_stream(node_proc.stdout))

            # Check watchdog health
            if watchdog_proc.poll() is not None:
                logger.warning("Watchdog exited! Restarting render_failback_watchdog.py...")
                watchdog_proc = subprocess.Popen(
                    [sys.executable, "render_failback_watchdog.py"],
                    cwd=str(BASE_DIR)
                )

            # Check cloudflare health and self-heal
            if cf_needs_restart or (cf_proc and cf_proc.poll() is not None):
                logger.warning("Cloudflare tunnel needs renewal. Re-creating tunnel...")
                cf_needs_restart = False
                if cf_proc and cf_proc.poll() is None:
                    cf_proc.terminate()
                cf_task.cancel()
                await asyncio.sleep(2)
                new_proc, new_url = start_cloudflared_tunnel()
                if new_proc and new_url:
                    cf_proc = new_proc
                    update_vercel_json_and_push(new_url)
                    cf_task = asyncio.create_task(monitor_cf_stream(cf_proc.stdout))
                else:
                    logger.error("Could not renew tunnel immediately. Will retry in 10s...")
                    await asyncio.sleep(10)
                    cf_needs_restart = True

            await asyncio.sleep(2)

    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down unified server...")
    finally:
        if node_proc and node_proc.poll() is None:
            node_proc.terminate()
        if watchdog_proc and watchdog_proc.poll() is None:
            watchdog_proc.terminate()
        if cf_proc and cf_proc.poll() is None:
            cf_proc.terminate()
        cf_task.cancel()
        node_task.cancel()
        logger.info("Unified server shutdown complete.")


if __name__ == "__main__":
    try:
        asyncio.run(main_unified())
    except KeyboardInterrupt:
        logger.info("Terminated by user.")
