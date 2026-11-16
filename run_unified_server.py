import asyncio
import json
import logging
import os
import re
import subprocess
import sys
import time
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s"
)
logger = logging.getLogger("unified_server")

BASE_DIR = Path(__file__).resolve().parent
LOCAL_PORT = int(os.environ.get("PORT", "3050"))


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
    while time.time() - start < 30:
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
        logger.error("Failed to extract tunnel URL within 30 seconds.")
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

            # Git commit and push
            subprocess.run(["git", "add", "vercel.json"], cwd=str(BASE_DIR), check=True)
            subprocess.run(["git", "commit", "-m", f"chore(tunnel): route traffic to {tunnel_url}"], cwd=str(BASE_DIR), check=True)
            subprocess.run(["git", "push", "origin", "main"], cwd=str(BASE_DIR), check=True)
            logger.info("✅ Pushed new tunnel route to GitHub for instant Vercel sync!")
        else:
            logger.info("vercel.json is already up to date with tunnel URL.")
    except Exception as e:
        logger.warning(f"Could not automatically sync vercel.json: {e}")


async def monitor_stream(stream, prefix: str):
    """Keep reading stream lines to prevent pipe buffer overflow and print to logs."""
    while True:
        try:
            line = await asyncio.to_thread(stream.readline)
            if not line:
                break
            line_str = line.strip()
            if line_str:
                logger.info(f"[{prefix}] {line_str}")
        except Exception:
            break


async def main_unified():
    cf_proc, tunnel_url = start_cloudflared_tunnel()
    if not tunnel_url:
        logger.error("Cannot proceed without an active Cloudflare tunnel.")
        sys.exit(1)

    # Set environment variables for local node processes
    os.environ["PORT"] = str(LOCAL_PORT)
    os.environ["BACKEND_URL"] = tunnel_url

    # Update vercel.json so Vercel proxies to local server
    update_vercel_json_and_push(tunnel_url)

    # Start log reader task for cloudflared
    cf_task = asyncio.create_task(monitor_stream(cf_proc.stdout, "Cloudflare"))

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
    node_task = asyncio.create_task(monitor_stream(node_proc.stdout, "NodeBots"))

    try:
        # Keep waiting while node process is alive
        while node_proc.poll() is None:
            await asyncio.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down unified server...")
    finally:
        if node_proc and node_proc.poll() is None:
            node_proc.terminate()
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
