/**
 * Xizmatchi Platform — Telegram Client Bot Server
 * Username: @xizmatchiuz_Uzbekistan_bot
 * 
 * Token maxfiy ravishda .env.local yoki muhit o'zgaruvchilaridan yuklanadi.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: load environment variables from .env.local / .env
function loadEnv() {
  for (const envFile of ['.env.local', '.env']) {
    const fullPath = path.join(__dirname, envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnv();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_CLIENT_BOT_TOKEN;
if (!TOKEN) {
  console.error('\n❌ XATOLIK: TELEGRAM_BOT_TOKEN topilmadi!');
  console.error('Iltimos .env.local faylida TELEGRAM_BOT_TOKEN ko\'rsatilganiga ishonch hosil qiling.\n');
  process.exit(1);
}

const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;
const SUBSCRIBERS_FILE = path.join(__dirname, 'src', 'data', 'telegram_subscribers.json');
const ORDERS_FILE = path.join(__dirname, 'src', 'data', 'telegram_orders.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getSubscribers() {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8'));
      if (Array.isArray(data)) return new Set(data);
    }
  } catch (e) {
    console.error('Error reading subscribers:', e.message);
  }
  return new Set();
}

function addSubscriber(chatId) {
  try {
    const subs = getSubscribers();
    if (!subs.has(chatId)) {
      subs.add(chatId);
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(Array.from(subs), null, 2), 'utf-8');
      console.log(`[Telegram Bot] Yangi obunachi qo'shildi: Chat ID ${chatId}`);
    }
  } catch (e) {
    console.error('Error saving subscriber:', e.message);
  }
}

function getRecentOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.error('Error reading orders:', e.message);
  }
  return [];
}

async function apiCall(method, params = {}) {
  try {
    const res = await fetch(`${BASE_URL}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (e) {
    console.error(`API Call error (${method}):`, e.message);
    return { ok: false, error: e.message };
  }
}

// Default keyboard
const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "📋 Oxirgi buyurtmalar" }, { text: "👨‍🔧 Sara ustalar" }],
    [{ text: "📍 Tumanlar ro'yxati" }, { text: "🌐 Saytni ochish" }],
    [{ text: "ℹ️ Yordam & Ma'lumot" }],
  ],
  resize_keyboard: true,
};

async function handleStart(chatId, firstName) {
  const welcomeText = `Assalomu alaykum, <b>${firstName || 'Foydalanuvchi'}</b>! 🇺🇿

Siz <b>"Xizmatchi"</b> platformasining rasmiy mijoz botiga xush kelibsiz!

Bu bot orqali:
👨‍🔧 Toshkent va viloyatlardagi eng sara ustalarni topishingiz mumkin.
📍 Tumanlar bo'yicha xizmatlar va bozor narxlarini ko'rishingiz mumkin.
⚡ Tezkor buyurtma berishingiz va mutaxassislarni chaqirishingiz mumkin.

Pastdagi tugmalar orqali kerakli bo'limni tanlang:`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "🌐 Saytni ochish (Web App)", web_app: { url: "https://xizmatchi.vercel.app" } },
      ],
      [
        { text: "👨‍🔧 Sara ustalar", callback_data: "cmd_specialists" },
        { text: "📍 Tumanlar", callback_data: "cmd_districts" },
      ],
    ],
  };

  await apiCall('sendMessage', {
    chat_id: chatId,
    text: welcomeText,
    parse_mode: 'HTML',
    reply_markup: MAIN_KEYBOARD,
  });

  await apiCall('sendMessage', {
    chat_id: chatId,
    text: `⚡️ <i>Siz rasmiy buyurtma qabul qiluvchi sifatida ro'yxatga olindingiz (ID: <code>${chatId}</code>). Saytdan yangi buyurtma topshirilishi bilanoq sizga tezkor xabar keladi!</i>`,
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard,
  });
}

async function handleOrders(chatId) {
  const orders = getRecentOrders();

  if (orders.length === 0) {
    const text = `📋 <b>Hozircha yangi buyurtmalar yo'q</b>\n\nSaytda (http://localhost:3000) birorta xizmat buyurtma qilinganda, uning to'liq ma'lumoti ushbu botga darhol keladi!`;
    await apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: MAIN_KEYBOARD,
    });
    return;
  }

  let text = `📋 <b>Oxirgi tushgan buyurtmalar (${orders.length} ta):</b>\n\n`;
  const recent = orders.slice(0, 5);

  recent.forEach((item, index) => {
    const b = item.booking || item;
    text += `<b>${index + 1}. Buyurtma #${b.id || 'N/A'}</b>\n`;
    text += `👤 Mijoz: <b>${b.clientName || 'Noma\'lum'}</b>\n`;
    text += `📞 Tel: <code>${b.clientPhone || 'N/A'}</code>\n`;
    text += `📍 Tuman: ${b.district || 'Toshkent'}\n`;
    text += `🏠 Manzil: ${b.address || '—'}\n`;
    text += `🛠️ Muammo: <i>"${b.description || 'Xizmat chaqiruvi'}"</i>\n`;
    text += `━━━━━━━━━━━━━━━━━━\n`;
  });

  await apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: MAIN_KEYBOARD,
  });
}

async function handleSpecialists(chatId) {
  const text = `👨‍🔧 <b>Xizmatchi platformasidagi Top Ustalar:</b>

1. <b>Akmal Rahimov</b> — <i>Santexnika & Isitish</i>
   ⭐ 4.98 (124 ta sharh) | 24/7 xizmat
   📍 Chilonzor tumani | 📞 +998 90 912 34 56

2. <b>Jamshid Karimov</b> — <i>Malakali Elektrik</i>
   ⭐ 4.95 (96 ta sharh) | 9 yillik tajriba
   📍 Yunusobod tumani | 📞 +998 93 540 88 11

3. <b>Otabek Yusupov</b> — <i>Konditsioner & Sovitish</i>
   ⭐ 4.92 (84 ta sharh) | Freon quyish & Tozalash
   📍 Mirzo Ulug'bek tumani | 📞 +998 97 765 43 21

4. <b>Murod Tolipov</b> — <i>Maishiy texnika ta'miri</i>
   ⭐ 4.90 (78 ta sharh) | Kir yuvish & Gaz plita
   📍 Yakkasaroy tumani | 📞 +998 91 123 45 67

5. <b>Dilshod Vohidov</b> — <i>Kafellar & Uy ta'miri</i>
   ⭐ 4.94 (65 ta sharh) | 14 yillik tajriba
   📍 Shayxontohur tumani | 📞 +998 99 876 54 32

🌐 <i>Barcha 32 ta sara ustalarni ko'rish uchun saytga kiring:</i>
👉 <a href="http://localhost:3000/#specialists-section">Xizmatchi.uz ustalar katalogi</a>`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: MAIN_KEYBOARD,
  });
}

async function handleDistricts(chatId) {
  const text = `📍 <b>Xizmat ko'rsatiladigan tumanlar:</b>

🏙 <b>Toshkent shahri:</b>
• Chilonzor tumani (4 ta usta)
• Yunusobod tumani (4 ta usta)
• Mirzo Ulug'bek tumani (3 ta usta)
• Yakkasaroy tumani (3 ta usta)
• Shayxontohur tumani (3 ta usta)
• Olmazor tumani (3 ta usta)
• Uchtepa tumani (3 ta usta)
• Yashnobod tumani (3 ta usta)
• Sergeli tumani (3 ta usta)
• Bektemir tumani (2 ta usta)
• Yangihayot tumani (2 ta usta)

🏛 <b>Viloyat markazlari:</b>
• Samarqand shahri (1 ta usta)
• Buxoro shahri (1 ta usta)

💡 <i>Saytda istalgan tumanni tanlab, yonidagi <b>"Yangilash"</b> tugmasini bossangiz, o'sha tumandagi barcha xizmatchilar darhol ro'yxatda paydo bo'ladi!</i>`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: MAIN_KEYBOARD,
  });
}

async function handleHelp(chatId) {
  const text = `ℹ️ <b>"Xizmatchi" platformasi haqida:</b>

Platforma xonadoningizda yuzaga keladigan har qanday muammoni (santexnika, elektr, maishiy texnika, konditsioner, kalit/qulf, klining, avto-yordam) vositachilarsiz va sifatli hal qilishga yordam beradi.

🌐 <b>Veb-sayt:</b> <a href="http://localhost:3000">http://localhost:3000</a>
🤖 <b>Telegram bot:</b> @xizmatchiuz_Uzbekistan_bot
📞 <b>Qo'llab-quvvatlash:</b> +998 (71) 200-00-00
⏱️ <b>Ish tartibi:</b> 24/7 (Shoshilinch xizmatlar mavjud)

Buyurtma berish uchun saytga kiring yoki ushbu botda <b>"Oxirgi buyurtmalar"</b> bo'limini tekshirib boring!`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: MAIN_KEYBOARD,
  });
}

// Message Router
async function processUpdate(update) {
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    const text = (msg.text || '').trim();
    const firstName = msg.from?.first_name || '';

    if (!chatId) return;

    // Register user chat ID immediately
    addSubscriber(chatId);

    if (text === '/start' || text.startsWith('/start')) {
      await handleStart(chatId, firstName);
    } else if (text === '/buyurtmalar' || text === '📋 Oxirgi buyurtmalar') {
      await handleOrders(chatId);
    } else if (text === '/ustalar' || text === '👨‍🔧 Sara ustalar') {
      await handleSpecialists(chatId);
    } else if (text === '/tumanlar' || text === "📍 Tumanlar ro'yxati") {
      await handleDistricts(chatId);
    } else if (text === '🌐 Saytni ochish') {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `🌐 <b>Xizmatchi platformasiga xush kelibsiz!</b>\n\nBrauzeringizda ochish uchun havola:\n👉 http://localhost:3000`,
        parse_mode: 'HTML',
      });
    } else if (text === '/yordam' || text === "ℹ️ Yordam & Ma'lumot") {
      await handleHelp(chatId);
    } else {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `Salom! Men buyurtmalarni qabul qiluvchi botman. Buyurtmalarni ko'rish uchun quyidagi menyudan foydalaning:`,
        reply_markup: MAIN_KEYBOARD,
      });
    }
  } else if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const data = cb.data;

    if (!chatId) return;
    addSubscriber(chatId);

    if (data === 'cmd_orders') {
      await handleOrders(chatId);
    } else if (data === 'cmd_specialists') {
      await handleSpecialists(chatId);
    }

    await apiCall('answerCallbackQuery', { callback_query_id: cb.id });
  }
}

// Long-polling loop
async function runBot() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 Xizmatchi Telegram Bot muvaffaqiyatli ishga tushdi!');
  console.log(`🤖 Bot Username: @xizmatchiuz_Uzbekistan_bot`);
  console.log(`🤖 Token: ${TOKEN.slice(0, 10)}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Verify getMe
  const me = await apiCall('getMe');
  if (!me.ok) {
    console.error('Bot token tekshiruvdan o\'tmadi:', me);
    return;
  }
  console.log(`[Bot Info] Nomi: "${me.result.first_name}", Username: @${me.result.username}`);

  let offset = 0;

  while (true) {
    try {
      const res = await fetch(`${BASE_URL}/getUpdates?offset=${offset}&timeout=25`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          await processUpdate(update);
        }
      }
    } catch (err) {
      console.error('[Bot Error in loop]:', err.message);
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

runBot();
