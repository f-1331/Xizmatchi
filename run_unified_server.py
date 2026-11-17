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
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s"
)
logger = logging.getLogger("unified_server")


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
            subprocess.run(["git", "push", "origin", "main"], cwd=str(BASE_DIR), check=True)
            logger.info("✅ Pushed new tunnel route to GitHub for instant Vercel sync!")
        else:
            logger.info("vercel.json is already up to date with tunnel URL.")
    except Exception as e:
        logger.warning(f"Could not automatically sync vercel.json: {e}")


def main():
    cf_proc, tunnel_url = start_cloudflared_tunnel()
    if not tunnel_url:
        logger.error("Cannot proceed without an active Cloudflare tunnel.")
        sys.exit(1)

    os.environ["PORT"] = str(LOCAL_PORT)
    os.environ["BACKEND_URL"] = tunnel_url

    update_vercel_json_and_push(tunnel_url)

    node_env = {**os.environ, "PORT": str(LOCAL_PORT), "BACKEND_URL": tunnel_url}
    logger.info(f"🚀 Launching server_bots.mjs on port {LOCAL_PORT}...")
    node_proc = subprocess.Popen(
        ["node", "server_bots.mjs"],
        cwd=str(BASE_DIR),
        env=node_env
    )

    try:
        node_proc.wait()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down unified server...")
    finally:
        if node_proc and node_proc.poll() is None:
            node_proc.terminate()
        if cf_proc and cf_proc.poll() is None:
            cf_proc.terminate()
        logger.info("Unified server shutdown complete.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Terminated by user.")
