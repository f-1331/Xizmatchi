import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_CLIENT_BOT_TOKEN || '8977412958:AAGqdgAOEJ9rKrWf0UYooadtDqeauzWKNHM';
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;
const SITE_URL = process.env.SITE_URL || 'https://xizmatchi.vercel.app';

const ORDERS_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_orders.json');
const SUBSCRIBERS_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_subscribers.json');

function getRecentOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.error('Error reading orders in client webhook:', e);
  }
  return [];
}

function addSubscriber(chatId: number) {
  try {
    let subs: number[] = [];
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      subs = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8')) || [];
    }
    if (!subs.includes(chatId)) {
      subs.push(chatId);
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
    }
  } catch {
    // Non-blocking in serverless
  }
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
    console.error(`Telegram API error (${method}):`, error?.message);
    return { ok: false, error: error?.message };
  }
}

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: '🌐 Saytni ochish' }, { text: '📋 Oxirgi buyurtmalar' }],
    [{ text: '👨‍🔧 Sara ustalar' }, { text: "📍 Tumanlar ro'yxati" }],
    [{ text: '👤 Mening profilim' }, { text: "ℹ️ Yordam & Ma'lumot" }],
  ],
  resize_keyboard: true,
};

async function handleStart(chatId: number, firstName: string) {
  const welcomeText = `Assalomu alaykum, <b>${firstName || 'Foydalanuvchi'}</b>! 🇺🇿

Siz <b>"Xizmatchi"</b> platformasining rasmiy mijoz botiga xush kelibsiz!

Bu bot orqali:
👨‍🔧 Toshkent va viloyatlardagi eng sara ustalarni topishingiz mumkin.
📍 Tumanlar bo'yicha xizmatlar va bozor narxlarini ko'rishingiz mumkin.
⚡ Tezkor buyurtma berishingiz va mutaxassislarni chaqirishingiz mumkin.

Pastdagi tugmalar orqali kerakli bo'limni tanlang:`;

  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: '🌐 Veb-saytni ochish (Web App)', web_app: { url: SITE_URL } }],
      [
        { text: '👨‍🔧 Sara ustalar', callback_data: 'cmd_specialists' },
        { text: '📍 Tumanlar', callback_data: 'cmd_districts' },
      ],
      [{ text: '📋 Buyurtmalar', callback_data: 'cmd_orders' }],
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

async function handleProfile(chatId: number, firstName: string, fromUser: Record<string, unknown> | undefined) {
  const username = fromUser?.username ? String(fromUser.username) : '';
  const text =
    `👤 <b>Sizning profilingiz:</b>\n\n` +
    `🆔 Telegram ID: <code>${chatId}</code>\n` +
    `👤 Ism: <b>${firstName || (fromUser?.first_name as string) || 'Foydalanuvchi'}</b>\n` +
    `${username ? `🔗 Username: @${username}\n` : ''}` +
    `⚡️ Holat: <b>Faol mijoz</b>\n\n` +
    `🌐 Xizmatchi platformasidagi to'liq profilingiz, buyurtmalar tarixi va ustalarni rasmiy veb-saytda boshqarishingiz mumkin:\n👉 <a href="${SITE_URL}">${SITE_URL}</a>`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🌐 Saytda ochish (Vercel Web App)', web_app: { url: SITE_URL } }],
        [{ text: '📋 Buyurtmalar', callback_data: 'cmd_orders' }],
        [{ text: '👨‍🔧 Sara ustalar', callback_data: 'cmd_specialists' }],
      ],
    },
  });
}

async function handleOrders(chatId: number) {
  const orders = getRecentOrders();

  if (orders.length === 0) {
    const text = `📋 <b>Hozircha yangi buyurtmalar yo'q</b>\n\nRasmiy saytimizda (${SITE_URL}) birorta xizmat buyurtma qilinganda, uning to'liq ma'lumoti ushbu botga darhol keladi!`;
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
    reply_markup: MAIN_KEYBOARD,
  });
}

async function handleSpecialists(chatId: number) {
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
👉 <a href="${SITE_URL}/#specialists-section">Xizmatchi rasmiy ustalar katalogi</a>`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: MAIN_KEYBOARD,
  });
}

async function handleDistricts(chatId: number) {
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

💡 <i>Saytda istalgan tumanni tanlab, yonidagi <b>"Yangilash"</b> tugmasini bossangiz, o'sha tumandagi barcha xizmatchilar darhol ro'yxatda paydo bo'ladi!</i>
👉 <a href="${SITE_URL}">Xizmatchi platformasiga o'tish →</a>`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: MAIN_KEYBOARD,
  });
}

async function handleHelp(chatId: number) {
  const text = `ℹ️ <b>"Xizmatchi" platformasi haqida:</b>

Platforma xonadoningizda yuzaga keladigan har qanday muammoni (santexnika, elektr, maishiy texnika, konditsioner, kalit/qulf, klining, avto-yordam) vositachilarsiz va sifatli hal qilishga yordam beradi.

🌐 <b>Rasmiy veb-sayt:</b> <a href="${SITE_URL}">${SITE_URL}</a>
🤖 <b>Mijoz boti:</b> @xizmatchiuz_Uzbekistan_bot
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

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = (msg.text || '').trim();
      const firstName = msg.from?.first_name || '';

      if (!chatId) return NextResponse.json({ ok: true });

      addSubscriber(chatId);

      if (text === '/start' || text.startsWith('/start')) {
        await handleStart(chatId, firstName);
      } else if (text === '/profil' || text === '👤 Mening profilim' || text === '👤 Profil') {
        await handleProfile(chatId, firstName, msg.from);
      } else if (
        text === '/buyurtmalar' ||
        text === '📋 Oxirgi buyurtmalar' ||
        text === '📋 Buyurtmalar' ||
        text === '📦 Mening buyurtmalarim'
      ) {
        await handleOrders(chatId);
      } else if (text === '/ustalar' || text === '👨‍🔧 Sara ustalar' || text === "🔍 Ustalar ro'yxati") {
        await handleSpecialists(chatId);
      } else if (text === '/tumanlar' || text === "📍 Tumanlar ro'yxati" || text === "📍 Tumanlar bo'yicha") {
        await handleDistricts(chatId);
      } else if (text === '🌐 Saytni ochish' || text === '🌐 Veb-sayt (Xizmatchi)' || text === '🌐 Veb-sayt') {
        await apiCall('sendMessage', {
          chat_id: chatId,
          text: `🌐 <b>Xizmatchi platformasiga xush kelibsiz!</b>\n\nRasmiy veb-sayt havolasi:\n👉 <a href="${SITE_URL}">${SITE_URL}</a>`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Veb-saytni ochish (Web App)', web_app: { url: SITE_URL } }],
              [{ text: '🌐 Brauzerda ochish', url: SITE_URL }],
            ],
          },
        });
      } else if (text === "👷‍♂️ Usta bo'lish" || text === "👷 Usta bo'lish") {
        await apiCall('sendMessage', {
          chat_id: chatId,
          text: `👷‍♂️ <b>Xizmatchi platformasida usta bo'lish:</b>\n\nSiz o'z sohangiz bo'yicha usta sifatida ro'yxatdan o'tib, kunlik buyurtmalarga ega bo'lishingiz mumkin.\n\n👉 Ro'yxatdan o'tish uchun rasmiy saytga kiring:\n<a href="${SITE_URL}/#specialists-section">${SITE_URL}/#specialists-section</a>`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: "📝 Usta bo'lish (Saytda)", url: `${SITE_URL}/#specialists-section` }]],
          },
        });
      } else if (text === '/yordam' || text === "ℹ️ Yordam & Ma'lumot" || text === "📞 Bog'lanish & Yordam") {
        await handleHelp(chatId);
      } else {
        await apiCall('sendMessage', {
          chat_id: chatId,
          text: `Salom! Men <b>Xizmatchi</b> platformasining rasmiy botiman.\n\nKerakli bo'limni tanlang yoki rasmiy veb-saytimizga kiring:\n👉 <a href="${SITE_URL}">${SITE_URL}</a>`,
          parse_mode: 'HTML',
          reply_markup: MAIN_KEYBOARD,
        });
      }
    } else if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data;

      if (!chatId) return NextResponse.json({ ok: true });
      addSubscriber(chatId);

      if (data === 'cmd_orders') {
        await handleOrders(chatId);
      } else if (data === 'cmd_specialists') {
        await handleSpecialists(chatId);
      } else if (data === 'cmd_districts') {
        await handleDistricts(chatId);
      }

      await apiCall('answerCallbackQuery', { callback_query_id: cb.id });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error('Error handling client webhook:', error?.message);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Xizmatchi Client Telegram Bot Webhook',
    bot: '@xizmatchiuz_Uzbekistan_bot',
    timestamp: new Date().toISOString(),
  });
}
