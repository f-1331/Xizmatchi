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

// Clean, compact, mobile-friendly keyboard
const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "📋 Buyurtmalar" }, { text: "📊 Statistika" }],
    [{ text: "👥 Mijozlar" }, { text: "🛠️ Ustalar" }],
    [{ text: "🔔 Bildirishnoma" }, { text: "🔍 Qidiruv" }],
    [
      { text: "🚀 Saytni ochish (Web App)", web_app: { url: "https://xizmatchi.vercel.app" } },
      { text: "ℹ️ Yordam" },
    ],
  ],
  resize_keyboard: true,
};

const SPECIALISTS = [
  { name: 'Mansur Saidvaliyev', profession: 'Professional Dezinfeksiya & Dezinseksiya', rating: '5.0 ⭐', phone: '+998 90 912 34 56', district: 'Toshkent shahar' },
  { name: 'Akmal Rustamov', profession: 'Santexnik (11 yillik tajriba)', rating: '4.9 ⭐', phone: '+998 90 912 34 56', district: 'Chilonzor tumani' },
  { name: 'Jamshid Karimov', profession: 'Professional Elektrik (14 yil)', rating: '4.95 ⭐', phone: '+998 93 543 21 00', district: 'Yunusobod tumani' },
  { name: 'Bobur Mirzayev', profession: 'Konditsioner & Sovutish ustasi', rating: '4.88 ⭐', phone: '+998 97 789 45 12', district: 'Mirzo Ulug\'bek tumani' },
  { name: 'Otabek Normurodov', profession: 'Maishiy texnika ta\'miri', rating: '4.92 ⭐', phone: '+998 91 333 44 55', district: 'Yakkasaroy tumani' },
  { name: 'Dilshodbek Ergashev', profession: 'Kafel & Qurilish ta\'miri', rating: '4.96 ⭐', phone: '+998 94 620 11 22', district: 'Shayxontohur tumani' },
  { name: 'Shahnoza Alimova', profession: 'Klining & Tozalash xizmati', rating: '4.94 ⭐', phone: '+998 99 888 77 66', district: 'Mirobod tumani' },
  { name: 'Muzaffar Yo\'ldoshev', profession: 'Mebel yig\'ish va yasash', rating: '4.87 ⭐', phone: '+998 90 123 45 67', district: 'Uchtepa tumani' },
  { name: 'Farhod Tursunov', profession: 'Qulf ochish va o\'rnatish 24/7', rating: '4.98 ⭐', phone: '+998 93 111 22 33', district: 'Sergeli tumani' },
];

async function handleStart(chatId, firstName) {
  addSubscriber(chatId);

  const welcomeText = 
    `👑 Assalomu alaykum, <b>${firstName || 'Xizmatchi rahbari'}</b>!\n\n` +
    `Siz <b>Xizmatchi Boshqaruv Markazi</b>ga ulandingiz.\n\n` +
    `🆔 <b>Admin ID:</b> <code>${chatId}</code>\n` +
    `⚡ <b>Xabarlar:</b> 🟢 <b>Faol (barcha arizalar shu yerga yetkaziladi)</b>\n` +
    `🌐 <b>Veb-sayt:</b> https://xizmatchi.vercel.app\n\n` +
    `Pastdagi qulay menyu orqali platformani to'liq boshqarishingiz mumkin:`;

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
    text += `📍 Tuman: ${b.district || 'Toshkent'} ${b.address ? `(${b.address})` : ''}\n`;
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

    if (text === '/start' || text.startsWith('/start') || text === '🔔 Bildirishnomalarni faollashtirish' || text === '🔔 Bildirishnoma') {
      await handleStart(chatId, firstName);
    } else if (text === '📋 Buyurtmalar' || text === '/buyurtmalar' || text === '📋 Oxirgi buyurtmalar') {
      await handleOrders(chatId);
    } else if (text === '📊 Statistika' || text === '/statistika' || text === '📊 Tizim statistikasi') {
      const orders = getRecentOrders();
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `📊 <b>Xizmatchi Statistikasi:</b>\n\n📦 Jami arizalar: <b>${orders.length} ta</b>\n🤖 Bot: @xizmatchiuz_Uzbekistan_ownerbot\n🌐 Sayt: https://xizmatchi.vercel.app\n⚡ Server: 🟢 Faol`,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD,
      });
    } else if (text === '👥 Mijozlar' || text === '/mijozlar') {
      const orders = getRecentOrders();
      let clientMsg = `👥 <b>Mijozlar ro'yxati (${orders.length} ta buyurtma asosida):</b>\n\n`;
      const unique = new Map();
      orders.forEach(o => {
        const b = o.booking || o;
        if (b.clientPhone && !unique.has(b.clientPhone)) {
          unique.set(b.clientPhone, b.clientName || 'Noma\'lum');
        }
      });
      let i = 1;
      unique.forEach((name, phone) => {
        clientMsg += `<b>${i}. ${name}</b> — <code>${phone}</code>\n`;
        i++;
      });
      if (unique.size === 0) clientMsg += `Hozircha saqlangan mijozlar yo'q.`;
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: clientMsg,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD,
      });
    } else if (text === '🛠️ Ustalar' || text === '/ustalar') {
      let specText = `🛠️ <b>Platformadagi tasdiqlangan ustalar:</b>\n\n`;
      SPECIALISTS.forEach((s, idx) => {
        specText += `<b>${idx + 1}. ${s.name}</b> (${s.rating})\n🔧 <i>${s.profession}</i>\n📞 <code>${s.phone}</code>\n─────────────────\n`;
      });
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: specText,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD,
      });
    } else if (text === '🔍 Qidiruv' || text === '/qidiruv') {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `🔍 <b>Qidiruv:</b>\n\nIstalgan telefon raqam yoki buyurtma ID sini yozib yuboring (masalan: <code>901234567</code>):`,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD,
      });
    } else if (text === 'ℹ️ Yordam' || text === '/yordam') {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `ℹ️ <b>Yordam:</b>\n\nUshbu bot saytdan tushgan buyurtmalarni sizga yetkazadi va mijozlar bilan tezkor bog'lanish imkonini beradi.\n\n🌐 Sayt: https://xizmatchi.vercel.app`,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD,
      });
    } else if (text === '🌐 Saytni ochish' || text === '🌐 Xizmatchi saytini ochish' || text === '/sayt') {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `🌐 <b>Xizmatchi platformasi:</b>\n👉 https://xizmatchi.vercel.app`,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD,
      });
    } else {
      // Search query handler
      const orders = getRecentOrders();
      const matched = orders.filter(o => {
        const b = o.booking || o;
        return (
          (b.clientPhone && b.clientPhone.includes(text)) ||
          (b.clientName && b.clientName.toLowerCase().includes(text.toLowerCase())) ||
          (b.id && String(b.id).includes(text))
        );
      });

      if (matched.length > 0) {
        let resMsg = `🔍 <b>"${text}" bo'yicha ${matched.length} ta natija:</b>\n\n`;
        matched.slice(0, 5).forEach((item, idx) => {
          const b = item.booking || item;
          resMsg += `<b>${idx + 1}. Buyurtma #${b.id}</b>\n👤 ${b.clientName}\n📞 <code>${b.clientPhone}</code>\n📍 ${b.district}\n\n`;
        });
        await apiCall('sendMessage', { chat_id: chatId, text: resMsg, parse_mode: 'HTML', reply_markup: MAIN_KEYBOARD });
        return;
      }

      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `Boshqaruv uchun pastdagi menyudan kerakli bo'limni tanlang:`,
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
