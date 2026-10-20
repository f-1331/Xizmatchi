/**
 * Xizmatchi Platform — Owner & Admin Telegram Bot Server
 * Bot Token: 8668786258:AAGrl0W3txp5b-F_0o6Pj7snrS-f8xCd9CA
 * Username: @xizmatchiuz_Uzbekistan_ownerbot
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN = '8668786258:AAGrl0W3txp5b-F_0o6Pj7snrS-f8xCd9CA';
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
      console.log(`[Owner Bot] Yangi administrator ulandi: Chat ID ${chatId}`);
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

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "🔔 Bildirishnomalarni faollashtirish" }, { text: "📋 Oxirgi buyurtmalar" }],
    [{ text: "📊 Tizim statistikasi" }, { text: "🌐 Saytni ochish" }],
    [{ text: "ℹ️ Yordam & Ma'lumot" }],
  ],
  resize_keyboard: true,
};

async function handleStart(chatId, firstName) {
  addSubscriber(chatId);

  const welcomeText = `👑 Assalomu alaykum, <b>${firstName || 'Xizmatchi rahbari'}</b>! 🇺🇿

Siz <b>"Xizmatchi Owner Bot"</b> tizimiga muvaffaqiyatli ulandingiz!

Bu bot orqali:
🔔 <b>Saytdan tushgan har bir yangi buyurtma</b> darhol sizga yetkaziladi.
👤 Mijozning ismi, telefon raqami, manzili va tanlagan xizmatini ko'rishingiz mumkin.
📞 Bitta tugma orqali mijozga to'g'ridan-to'g'ri qo'ng'iroq qilishingiz mumkin.
✅ Buyurtmani qabul qilish yoki bekor qilish imkoniyati mavjud.

⚡️ <i>Siz rasmiy buyurtma qabul qiluvchi sifatida ro'yxatga olindingiz (ID: <code>${chatId}</code>).</i>`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text: welcomeText,
    parse_mode: 'HTML',
    reply_markup: MAIN_KEYBOARD,
  });
}

async function handleOrders(chatId) {
  const orders = getRecentOrders();

  if (orders.length === 0) {
    const text = `📋 <b>Hozircha buyurtmalar yo'q.</b>\n\nSaytda yangi buyurtma berilganda, u avtomatik ushbu botga xabar qilinadi!`;
    await apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: MAIN_KEYBOARD,
    });
    return;
  }

  let text = `📋 <b>Oxirgi tushgan arizalar (${orders.length} ta):</b>\n\n`;
  const recent = orders.slice(0, 10);

  recent.forEach((item, index) => {
    const b = item.booking || item;
    text += `<b>${index + 1}. Buyurtma #${b.id || 'N/A'}</b>\n`;
    text += `👤 Mijoz: <b>${b.clientName || 'Noma\'lum'}</b>\n`;
    text += `📞 Tel: <code>${b.clientPhone || 'N/A'}</code>\n`;
    text += `📍 Tuman: ${b.district || 'Toshkent'}\n`;
    text += `🏠 Manzil: ${b.address || '—'}\n`;
    text += `🛠️ Tavsif: <i>"${b.description || 'Xizmat chaqiruvi'}"</i>\n`;
    text += `━━━━━━━━━━━━━━━━━━\n`;
  });

  await apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: MAIN_KEYBOARD,
  });
}

async function processUpdate(update) {
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    const text = (msg.text || '').trim();
    const firstName = msg.from?.first_name || '';

    if (!chatId) return;
    addSubscriber(chatId);

    if (text === '/start' || text.startsWith('/start') || text === '🔔 Bildirishnomalarni faollashtirish') {
      await handleStart(chatId, firstName);
    } else if (text === '/buyurtmalar' || text === '📋 Oxirgi buyurtmalar') {
      await handleOrders(chatId);
    } else if (text === '/statistika' || text === '📊 Tizim statistikasi') {
      const orders = getRecentOrders();
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `📊 <b>Statistika:</b>\n\n📦 Jami buyurtmalar: <b>${orders.length} ta</b>\n🤖 Bot: @xizmatchiuz_Uzbekistan_ownerbot\n🌐 Sayt: https://xizmatchi.vercel.app`,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD,
      });
    } else if (text === '🌐 Saytni ochish' || text === '/sayt') {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `🌐 <b>Xizmatchi platformasi:</b>\n👉 https://xizmatchi.vercel.app`,
        parse_mode: 'HTML',
      });
    } else {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `Salom! Yangi buyurtmalar avtomatik shu yerga keladi. Boshqarish uchun pastdagi menyudan foydalaning:`,
        reply_markup: MAIN_KEYBOARD,
      });
    }
  } else if (update.callback_query) {
    const cb = update.callback_query;
    const data = cb.data || '';
    if (data.startsWith('accept_')) {
      await apiCall('answerCallbackQuery', {
        callback_query_id: cb.id,
        text: '✅ Buyurtma qabul qilindi!',
        show_alert: true,
      });
    } else if (data.startsWith('reject_')) {
      await apiCall('answerCallbackQuery', {
        callback_query_id: cb.id,
        text: '❌ Buyurtma bekor qilindi.',
        show_alert: true,
      });
    }
  }
}

async function runBot() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 Xizmatchi Owner Bot muvaffaqiyatli ishga tushdi!');
  console.log(`🤖 Bot Username: @xizmatchiuz_Uzbekistan_ownerbot`);
  console.log(`🤖 Token: ${TOKEN.slice(0, 10)}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const me = await apiCall('getMe');
  if (!me.ok) {
    console.error('Bot token tekshiruvdan o\'tmadi:', me);
    return;
  }
  console.log(`[Owner Bot Info] Nomi: "${me.result.first_name}", Username: @${me.result.username}`);

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
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

runBot();
