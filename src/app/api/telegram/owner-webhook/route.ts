import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthorizedAdminIds, getAdminsData, isAuthorizedAdmin, isSuperadmin, SUPERADMIN_ID, SUPERADMIN_USERNAME } from '@/lib/adminStore';

const TOKEN = process.env.TELEGRAM_OWNER_BOT_TOKEN || '8668786258:AAE9DHGGB2g6n7RSC29a4o-q4rlYxjRFyBA';
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;
const SITE_URL = process.env.SITE_URL || 'https://xizmatchi.vercel.app';

const ORDERS_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_orders.json');

function getRecentOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.error('Error reading orders in owner webhook:', e);
  }
  return [];
}

async function apiCall(method: string, params: Record<string, unknown> = {}) {
  try {
    const res = await fetch(`${BASE_URL}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error(`Owner Bot API error (${method}):`, error?.message);
    return { ok: false, error: error?.message };
  }
}

function getKeyboardForUser(chatId: number, username = '') {
  if (isSuperadmin(chatId, username)) {
    return {
      keyboard: [
        [{ text: '📋 Buyurtmalar' }, { text: "👑 Adminlar bo'limi" }],
        [{ text: '📊 Statistika' }, { text: '👥 Mijozlar' }],
        [{ text: '🛠️ Ustalar' }, { text: '🔍 Qidiruv' }],
        [{ text: '🌐 Saytni ochish' }],
      ],
      resize_keyboard: true,
    };
  }
  return {
    keyboard: [
      [{ text: '📋 Buyurtmalar' }, { text: '🛠️ Ustalar' }],
      [{ text: '🔍 Qidiruv' }, { text: '🌐 Saytni ochish' }],
    ],
    resize_keyboard: true,
  };
}

async function handleStart(chatId: number, firstName: string, username = '') {
  const isSuper = isSuperadmin(chatId, username);
  const isAdm = isAuthorizedAdmin(chatId, username);

  if (!isAdm && !isSuper) {
    await apiCall('sendMessage', {
      chat_id: chatId,
      text:
        `⛔ <b>Kirish taqiqlangan!</b>\n\n` +
        `Ushbu bot faqat Xizmatchi platformasi egasi va rasmiy ma'murlari uchun mo'ljallangan.\n\n` +
        `Sizning Telegram ID: <code>${chatId}</code>\n` +
        `Agar siz xizmatlardan foydalanmoqchi bo'lsangiz, asosiy mijoz botimizga o'ting:\n👉 @xizmatchiuz_Uzbekistan_bot`,
      parse_mode: 'HTML',
    });
    return;
  }

  const welcomeText = isSuper
    ? `👑 <b>Assalomu alaykum, hurmatli Bosh Administrator Fayzbek!</b>\n\n` +
      `Siz <b>"Xizmatchi"</b> platformasining yopiq boshqaruv tizimidasiz.\n` +
      `Yangi arizalar darhol ushbu botga yetkaziladi.\n\n` +
      `Boshqaruv uchun quyidagi menyudan foydalaning:`
    : `👋 <b>Assalomu alaykum, Hurmatli Administrator ${firstName || ''}!</b>\n\n` +
      `Siz "Xizmatchi" boshqaruv botiga ulandingiz. Yangi buyurtmalar avtomatik ravishda sizga yetkaziladi.`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text: welcomeText,
    parse_mode: 'HTML',
    reply_markup: getKeyboardForUser(chatId, username),
  });
}

async function handleOrders(chatId: number, username = '') {
  const orders = getRecentOrders();

  if (orders.length === 0) {
    await apiCall('sendMessage', {
      chat_id: chatId,
      text: `📋 <b>Hozircha yangi buyurtmalar tushmadi.</b>\n\nMijozlar saytdan ariza qoldirishi bilanoq sizga tezkor xabar keladi!`,
      parse_mode: 'HTML',
      reply_markup: getKeyboardForUser(chatId, username),
    });
    return;
  }

  let text = `📋 <b>Oxirgi tushgan arizalar (${orders.length} ta):</b>\n\n`;
  const recent = orders.slice(0, 5);

  recent.forEach((item: Record<string, unknown>, index: number) => {
    const b = (item.booking || item) as Record<string, unknown>;
    text += `<b>${index + 1}. Buyurtma #${b.id || 'N/A'}</b>\n`;
    text += `👤 Mijoz: <b>${b.clientName || "Noma'lum"}</b>\n`;
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
    reply_markup: getKeyboardForUser(chatId, username),
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = (msg.text || '').trim();
      const firstName = msg.from?.first_name || '';
      const userHandle = (msg.from?.username || '').replace(/^@/, '').toLowerCase();

      if (!chatId) return NextResponse.json({ ok: true });

      if (text === '/start' || text.startsWith('/start')) {
        await handleStart(chatId, firstName, userHandle);
      } else if (text === '📋 Buyurtmalar' || text === '/buyurtmalar' || text === '📋 Oxirgi buyurtmalar') {
        await handleOrders(chatId, userHandle);
      } else if (text === '📊 Statistika' || text === '/statistika') {
        const orders = getRecentOrders();
        const adminData = getAdminsData();
        await apiCall('sendMessage', {
          chat_id: chatId,
          text:
            `📊 <b>Xizmatchi Statistikasi:</b>\n\n` +
            `👑 Bosh Egasi: Fayzbek (@${SUPERADMIN_USERNAME})\n` +
            `📦 Jami arizalar: <b>${orders.length} ta</b>\n` +
            `👥 Biriktirilgan adminlar: <b>${adminData.admins.length} nafar</b>\n` +
            `🤖 Bot: 🟢 Faol (24/7 Vercel Webhook)\n` +
            `🌐 Sayt: ${SITE_URL}\n` +
            `⚡ Server: 🟢 Onlayn`,
          parse_mode: 'HTML',
          reply_markup: getKeyboardForUser(chatId, userHandle),
        });
      } else if (text === "👑 Adminlar bo'limi" || text === '👑 Adminlar' || text === '/adminlar') {
        const adminData = getAdminsData();
        let msgAdmins = `👑 <b>Tizim Administratorlari:</b>\n\n`;
        adminData.admins.forEach((a, idx) => {
          msgAdmins += `${idx + 1}. <b>${a.name}</b> (${a.role})\n`;
          if (a.id) msgAdmins += `   ID: <code>${a.id}</code>\n`;
          if (a.username) msgAdmins += `   Username: @${a.username}\n`;
        });
        await apiCall('sendMessage', {
          chat_id: chatId,
          text: msgAdmins,
          parse_mode: 'HTML',
          reply_markup: getKeyboardForUser(chatId, userHandle),
        });
      } else if (text === '🌐 Saytni ochish' || text === '/sayt') {
        await apiCall('sendMessage', {
          chat_id: chatId,
          text: `🌐 <b>Xizmatchi boshqaruv paneli:</b>\n👉 ${SITE_URL}`,
          parse_mode: 'HTML',
          reply_markup: getKeyboardForUser(chatId, userHandle),
        });
      } else {
        await apiCall('sendMessage', {
          chat_id: chatId,
          text: `Boshqaruv uchun quyidagi menyudan foydalaning:`,
          reply_markup: getKeyboardForUser(chatId, userHandle),
        });
      }
    } else if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data || '';

      if (!chatId) return NextResponse.json({ ok: true });

      if (data.startsWith('accept_')) {
        const orderId = data.replace('accept_', '');
        await apiCall('answerCallbackQuery', {
          callback_query_id: cb.id,
          text: `✅ Buyurtma #${orderId} qabul qilindi!`,
          show_alert: true,
        });
        await apiCall('sendMessage', {
          chat_id: chatId,
          text: `✅ <b>Buyurtma #${orderId} siz tomondan qabul qilindi!</b> Mijoz bilan zudlik bilan bog'laning.`,
          parse_mode: 'HTML',
        });
      } else if (data.startsWith('reject_')) {
        const orderId = data.replace('reject_', '');
        await apiCall('answerCallbackQuery', {
          callback_query_id: cb.id,
          text: `❌ Buyurtma #${orderId} bekor qilindi.`,
          show_alert: true,
        });
      }

      await apiCall('answerCallbackQuery', { callback_query_id: cb.id });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error('Error handling owner webhook:', error?.message);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Xizmatchi Owner Telegram Bot Webhook',
    bot: '@xizmatchiuz_Uzbekistan_ownerbot',
    timestamp: new Date().toISOString(),
  });
}
