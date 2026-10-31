import http from 'http';
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

console.log('===================================================');
console.log('🚀 Xizmatchi Telegram Botlar Cloud Serverda ishga tushmoqda...');
console.log('🤖 Mijoz boti: @xizmatchiuz_Uzbekistan_bot');
console.log('👑 Egasi boti: @xizmatchiuz_Uzbekistan_ownerbot');
console.log('===================================================');

// Fork both bots as resilient child processes
function launchBot(scriptName, name) {
  const child = fork(path.join(__dirname, scriptName), [], {
    env: { ...process.env },
  });

  child.on('exit', (code, signal) => {
    console.error(`[${name}] to'xtadi (kod: ${code}, signal: ${signal}). 5 soniyadan so'ng qayta ishga tushiriladi...`);
    setTimeout(() => launchBot(scriptName, name), 5000);
  });

  return child;
}

launchBot('bot.mjs', 'Client Bot');
launchBot('bot_owner.mjs', 'Owner Bot');

// HTTP server for health check (Render requires an open port to keep service live)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      status: 'ok',
      service: 'Xizmatchi Telegram Bots',
      clientBot: '@xizmatchiuz_Uzbekistan_bot',
      ownerBot: '@xizmatchiuz_Uzbekistan_ownerbot',
      site: process.env.SITE_URL || 'https://xizmatchi.vercel.app',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    }, null, 2)
  );
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Health check HTTP server ${PORT}-portda faol ishlayapti.`);
});
