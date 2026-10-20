/**
 * Xizmatchi Platform — Owner & Admin Telegram Bot Server
 * Bot Token: 8668786258:AAGrl0W3txp5b-F_0o6Pj7snrS-f8xCd9CA
 * Username: @xizmatchiuz_Uzbekistan_ownerbot
 * 
 * Bosh Egasi / Superadmin: Fayzbek (@fayzbek1331)
 * ID: 6707839718
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN = '8668786258:AAGrl0W3txp5b-F_0o6Pj7snrS-f8xCd9CA';
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;
const CLIENT_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_bot';

// Permanent Chief Superadmin (Owner: Fayzbek)
const SUPERADMIN_ID = 6707839718;
const SUPERADMIN_USERNAME = 'fayzbek1331';

const ADMINS_FILE = path.join(__dirname, 'src', 'data', 'telegram_admins.json');
const SUBSCRIBERS_FILE = path.join(__dirname, 'src', 'data', 'telegram_subscribers.json');
const ORDERS_FILE = path.join(__dirname, 'src', 'data', 'telegram_orders.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-memory conversation state for pending inputs
const USER_STATES = new Map();

// Helper to load admins data
function loadAdminsData() {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf-8'));
      if (data && Array.isArray(data.admins) && data.admins.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.error('Error reading admins:', e.message);
  }

  const defaultData = {
    superadmin: SUPERADMIN_ID,
    superadmin_username: SUPERADMIN_USERNAME,
    admins: [
      {
        id: SUPERADMIN_ID,
        name: "Fayzbek (Bosh Egasi)",
        username: SUPERADMIN_USERNAME,
        addedAt: new Date().toISOString(),
        role: "superadmin",
      },
    ],
  };
  saveAdminsData(defaultData);
  return defaultData;
}

// Helper to save admins data and sync subscribers
function saveAdminsData(data) {
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(data, null, 2), 'utf-8');

    // Keep active numeric IDs in subscribers list so orders broadcast properly
    const ids = Array.from(
      new Set(
        data.admins
          .map((a) => (a.id ? Number(a.id) : null))
          .filter((id) => typeof id === 'number' && !isNaN(id) && id > 0)
      )
    );
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(ids, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving admins data:', e.message);
  }
}

// Security checks
function isSuperadmin(chatId, username = '') {
  const cleanUser = (username || '').replace(/^@/, '').toLowerCase();
  const numId = chatId ? Number(chatId) : null;
  return cleanUser === SUPERADMIN_USERNAME || numId === SUPERADMIN_ID;
}

function isAdmin(chatId, username = '') {
  if (isSuperadmin(chatId, username)) return true;

  const cleanUser = (username || '').replace(/^@/, '').toLowerCase();
  const numId = chatId ? Number(chatId) : null;
  const data = loadAdminsData();

  return data.admins.some((a) => {
    if (numId && a.id && Number(a.id) === numId) return true;
    if (cleanUser && a.username && a.username.toLowerCase() === cleanUser) return true;
    return false;
  });
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

// Keyboard for Superadmin (Owner Fayzbek has full Admin Management)
const KEYBOARD_SUPERADMIN = {
  keyboard: [
    [{ text: "📋 Buyurtmalar" }, { text: "📊 Statistika" }],
    [{ text: "👥 Mijozlar" }, { text: "🛠️ Ustalar" }],
    [{ text: "👑 Adminlar bo'limi" }, { text: "🔍 Qidiruv" }],
    [{ text: "🌐 Saytni ochish", web_app: { url: "https://xizmatchi.vercel.app" } }],
  ],
  resize_keyboard: true,
};

// Keyboard for Regular Admins
const KEYBOARD_ADMIN = {
  keyboard: [
    [{ text: "📋 Buyurtmalar" }, { text: "📊 Statistika" }],
    [{ text: "👥 Mijozlar" }, { text: "🛠️ Ustalar" }],
    [{ text: "🔍 Qidiruv" }, { text: "🌐 Saytni ochish", web_app: { url: "https://xizmatchi.vercel.app" } }],
  ],
  resize_keyboard: true,
};

function getKeyboardForUser(chatId, username = '') {
  return isSuperadmin(chatId, username) ? KEYBOARD_SUPERADMIN : KEYBOARD_ADMIN;
}

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

// Handles unauthorized users
async function handleUnauthorized(chatId) {
  const unauthorizedText =
    `⛔ <b>Kirish taqiqlandi!</b>\n\n` +
    `Oddiy botga kiring, bu bot faqat adminlar va egalar uchun!\n\n` +
    `👉 <b>Mijozlar boti:</b> @${CLIENT_BOT_USERNAME}\n` +
    `🌐 <b>Veb-sayt:</b> https://xizmatchi.vercel.app`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text: unauthorizedText,
    parse_mode: 'HTML',
    reply_markup: { remove_keyboard: true },
  });
}

async function handleStart(chatId, firstName, username = '') {
  const isOwner = isSuperadmin(chatId, username);
  const title = isOwner ? '👑 Bosh Egasi (Superadmin)' : '👤 Rasmiy Administrator';
  const displayName = isOwner ? 'Fayzbek (@fayzbek1331)' : (firstName || 'Administrator');

  const welcomeText =
    `👑 Assalomu alaykum, hurmatli <b>${displayName}</b>!\n\n` +
    `Siz <b>Xizmatchi Boshqaruv Markazi</b>ga muvaffaqiyatli ulandingiz.\n\n` +
    `🆔 <b>Sizning Telegram ID:</b> <code>${chatId}</code>\n` +
    `🏷️ <b>Maqomingiz:</b> 🟢 <b>${title}</b>\n` +
    `⚡ <b>Bildirishnomalar:</b> 🟢 <b>Faol (Saytdan tushgan barcha arizalar sizga yetkaziladi)</b>\n` +
    `🌐 <b>Veb-sayt:</b> https://xizmatchi.vercel.app\n\n` +
    `Pastdagi qulay menyu orqali platformani boshqarishingiz mumkin:`;

  await apiCall('sendMessage', {
    chat_id: chatId,
    text: welcomeText,
    parse_mode: 'HTML',
    reply_markup: getKeyboardForUser(chatId, username),
  });
}

// 👑 ADMIN MANAGEMENT PANEL
async function handleAdminPanel(chatId, username = '') {
  if (!isSuperadmin(chatId, username)) {
    await apiCall('sendMessage', {
      chat_id: chatId,
      text: "⚠️ Bu bo'lim faqat bosh administrator (egasi) uchun mavjud.",
      parse_mode: 'HTML',
      reply_markup: getKeyboardForUser(chatId, username),
    });
    return;
  }

  const data = loadAdminsData();
  const count = data.admins.length;

  let msg = `👑 <b>Xizmatchi — Adminlar Boshqaruvi</b>\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 <b>Bosh Egasi:</b> Fayzbek (@${SUPERADMIN_USERNAME})\n`;
  msg += `📊 Jami biriktirilgan adminlar: <b>${count} nafar</b>\n\n`;
  msg += `⚡ <i>Barcha qo'shilgan adminlarga saytdan tushgan yangi buyurtmalar avtomatik yetkaziladi.</i>\n\n`;
  msg += `Kerakli amalni tanlang:`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "📋 Adminlar ro'yxati", callback_data: "admin_list" },
        { text: "➕ Admin qo'shish", callback_data: "admin_add_prompt" },
      ],
      [
        { text: "➖ Adminni o'chirish", callback_data: "admin_remove_menu" },
        { text: "🔄 Yangilash", callback_data: "admin_refresh" },
      ],
    ],
  };

  await apiCall('sendMessage', {
    chat_id: chatId,
    text: msg,
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard,
  });
}

// Show list of all admins
async function showAdminList(chatId, messageId = null) {
  const data = loadAdminsData();
  let text = `📋 <b>Rasmiy Administratorlar Ro'yxati (${data.admins.length} nafar):</b>\n`;
  text += `━━━━━━━━━━━━━━━━━━\n\n`;

  data.admins.forEach((admin, idx) => {
    const isOwner = Number(admin.id) === SUPERADMIN_ID || admin.username?.toLowerCase() === SUPERADMIN_USERNAME;
    const icon = isOwner ? '👑' : '👤';
    const title = isOwner ? 'Bosh Egasi (Superadmin)' : 'Administrator';
    const dateStr = admin.addedAt ? new Date(admin.addedAt).toLocaleDateString('uz-UZ') : 'Asosiy';
    const userTag = admin.username ? ` (@${admin.username})` : '';
    const idDisplay = admin.id ? `<code>${admin.id}</code>` : '<i>(Botga kirishi kutilmoqda)</i>';

    text += `<b>${idx + 1}. ${icon} ${admin.name}${userTag}</b>\n`;
    text += `🆔 ID: ${idDisplay}\n`;
    text += `🏷️ Lavozim: <i>${title}</i>\n`;
    text += `📅 Qo'shilgan: ${dateStr}\n`;
    if (!isOwner) {
      const delParam = admin.id ? admin.id : admin.username;
      text += `❌ O'chirish: /del_${delParam}\n`;
    }
    text += `─────────────────\n`;
  });

  const buttons = [
    [{ text: "➕ Yangi admin qo'shish", callback_data: "admin_add_prompt" }],
    [{ text: "➖ Adminni o'chirish", callback_data: "admin_remove_menu" }],
    [{ text: "⬅️ Asosiy panel", callback_data: "admin_main" }],
  ];

  if (messageId) {
    await apiCall('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  } else {
    await apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  }
}

// Prompt for adding an admin
async function promptAddAdmin(chatId, messageId = null) {
  USER_STATES.set(chatId, { step: 'awaiting_admin_input' });

  const text =
    `➕ <b>Yangi administrator qo'shish:</b>\n\n` +
    `Admin qilmoqchi bo'lgan shaxsning <b>Telegram ID raqami</b> yoki <b>@username</b> ini yozib yuboring (yoki uning xabarini ushbu botga <b>Forward</b> qiling):\n\n` +
    `Misollar:\n` +
    `🔹 <b>ID orqali:</b> <code>1234567890</code>\n` +
    `🔹 <b>Username orqali:</b> <code>@sherzod_99</code>\n\n` +
    `💡 <i>Agar @username yozsangiz, u foydalanuvchi botga kirib /start bosishi bilanoq tizim uni taniydi va arizalar unga ham kelishni boshlaydi!</i>\n\n` +
    `❌ Bekor qilish uchun: /cancel yozing.`;

  const buttons = [[{ text: "❌ Bekor qilish", callback_data: "admin_cancel" }]];

  if (messageId) {
    await apiCall('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  } else {
    await apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  }
}

// Show remove menu with inline delete buttons
async function showRemoveAdminMenu(chatId, messageId = null) {
  const data = loadAdminsData();
  const removableAdmins = data.admins.filter(
    (a) => Number(a.id) !== SUPERADMIN_ID && a.username?.toLowerCase() !== SUPERADMIN_USERNAME
  );

  if (removableAdmins.length === 0) {
    const text = `ℹ️ <b>O'chirish uchun qo'shimcha adminlar yo'q.</b>\n\nFaqat bosh administrator (Fayzbek) mavjud. Yangi admin qo'shish uchun "➕ Admin qo'shish" tugmasini bosing.`;
    const buttons = [[{ text: "➕ Admin qo'shish", callback_data: "admin_add_prompt" }]];
    if (messageId) {
      await apiCall('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
    } else {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
    }
    return;
  }

  let text = `➖ <b>Adminni chiqarib yuborish:</b>\n\nQuyidagi ro'yxatdan o'chirmoqchi bo'lgan admin ustiga bosing:`;
  const buttons = removableAdmins.map((a) => {
    const label = a.username ? `@${a.username} (${a.name})` : `${a.name} (ID: ${a.id})`;
    const callbackTarget = a.id ? a.id : a.username;
    return [{ text: `❌ ${label}`, callback_data: `admin_del_${callbackTarget}` }];
  });
  buttons.push([{ text: "⬅️ Bekor qilish", callback_data: "admin_main" }]);

  if (messageId) {
    await apiCall('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  } else {
    await apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  }
}

// Perform adding an admin (by ID or @username)
async function executeAddAdmin(ownerChatId, input, targetName = '', forwardUsername = '') {
  const textInput = String(input).trim();
  const data = loadAdminsData();

  let targetId = null;
  let cleanUser = '';

  if (textInput.startsWith('@') || /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/.test(textInput)) {
    cleanUser = textInput.replace(/^@/, '').toLowerCase();
  } else {
    const num = Number(textInput.replace(/[^\d-]/g, ''));
    if (!isNaN(num) && num > 0) {
      targetId = num;
    }
  }

  if (forwardUsername) {
    cleanUser = forwardUsername.replace(/^@/, '').toLowerCase();
  }

  if (!targetId && !cleanUser) {
    await apiCall('sendMessage', {
      chat_id: ownerChatId,
      text: "❌ <b>Xatolik:</b> Iltimos to'g'ri Telegram ID (raqam) yoki @username kiriting. Qaytadan urinib ko'ring yoki /cancel deb yozing:",
      parse_mode: 'HTML',
    });
    return;
  }

  // Duplicate check
  const exists = data.admins.some((a) => {
    if (targetId && a.id && Number(a.id) === targetId) return true;
    if (cleanUser && a.username && a.username.toLowerCase() === cleanUser) return true;
    return false;
  });

  if (exists) {
    USER_STATES.delete(ownerChatId);
    await apiCall('sendMessage', {
      chat_id: ownerChatId,
      text: `⚠️ Bu foydalanuvchi (${targetId || '@' + cleanUser}) allaqachon adminlar ro'yxatida bor!`,
      parse_mode: 'HTML',
      reply_markup: getKeyboardForUser(ownerChatId),
    });
    return;
  }

  const finalName = targetName.trim() || (cleanUser ? `@${cleanUser}` : `Admin #${targetId}`);
  const newAdmin = {
    id: targetId || null,
    name: finalName,
    username: cleanUser || '',
    addedAt: new Date().toISOString(),
    role: 'admin',
  };

  data.admins.push(newAdmin);
  saveAdminsData(data);
  USER_STATES.delete(ownerChatId);

  // Notify Superadmin
  let successMsg = `✅ <b>Yangi administrator muvaffaqiyatli ro'yxatga olindi!</b>\n\n`;
  successMsg += `👤 <b>Nomi:</b> ${finalName}\n`;
  if (targetId) successMsg += `🆔 <b>ID:</b> <code>${targetId}</code>\n`;
  if (cleanUser) successMsg += `🔹 <b>Username:</b> @${cleanUser}\n\n`;

  if (targetId) {
    successMsg += `⚡ <b>Endi saytdan tushgan barcha yangi arizalar unga ham to'g'ridan-to'g'ri borishni boshlaydi!</b>`;
  } else {
    successMsg += `💡 <b>Eslatma:</b> Foydalanuvchi botga kirib /start bosishi bilanoq tizim uni avtomatik faollashtiradi va yangi buyurtmalar unga yetib boradi!`;
  }

  await apiCall('sendMessage', {
    chat_id: ownerChatId,
    text: successMsg,
    parse_mode: 'HTML',
    reply_markup: getKeyboardForUser(ownerChatId),
  });

  // If targetId is already known, notify them immediately
  if (targetId) {
    try {
      await apiCall('sendMessage', {
        chat_id: targetId,
        text:
          `🎉 <b>Assalomu alaykum, ${finalName}!</b>\n\n` +
          `Siz <b>Xizmatchi</b> platformasi rahbari Fayzbek (@${SUPERADMIN_USERNAME}) tomonidan rasmiy administrator sifatida tayinlandingiz!\n\n` +
          `⚡ Endi saytdan keladigan barcha yangi buyurtmalar sizga ham avtomatik yetkaziladi.\n\n` +
          `Boshqaruv menyusini ochish uchun /start bosing.`,
        parse_mode: 'HTML',
        reply_markup: KEYBOARD_ADMIN,
      });
    } catch (err) {
      console.log(`[Owner Bot] Yangi adminga xabar yuborilmadi: ${err.message}`);
    }
  }
}

// Perform removing an admin
async function executeRemoveAdmin(ownerChatId, identifier) {
  const cleanId = String(identifier).replace(/^@/, '').toLowerCase();
  const numId = Number(identifier);

  if (cleanId === SUPERADMIN_USERNAME || numId === SUPERADMIN_ID) {
    await apiCall('sendMessage', {
      chat_id: ownerChatId,
      text: "❌ Bosh administratorni (Fayzbek) o'chirib bo'lmaydi!",
      parse_mode: 'HTML',
    });
    return;
  }

  const data = loadAdminsData();
  const adminIndex = data.admins.findIndex((a) => {
    if (!isNaN(numId) && a.id && Number(a.id) === numId) return true;
    if (a.username && a.username.toLowerCase() === cleanId) return true;
    return false;
  });

  if (adminIndex === -1) {
    await apiCall('sendMessage', {
      chat_id: ownerChatId,
      text: `⚠️ Bunday admin topilmadi: <code>${identifier}</code>`,
      parse_mode: 'HTML',
    });
    return;
  }

  const removedAdmin = data.admins[adminIndex];
  data.admins.splice(adminIndex, 1);
  saveAdminsData(data);

  // 1. Notify Superadmin
  await apiCall('sendMessage', {
    chat_id: ownerChatId,
    text:
      `✅ <b>Administrator muvaffaqiyatli chiqarib yuborildi!</b>\n\n` +
      `👤 <b>Nomi:</b> ${removedAdmin.name}\n` +
      `🆔 <b>Identifikator:</b> <code>${removedAdmin.id || '@' + removedAdmin.username}</code>\n\n` +
      `⛔ Ushbu foydalanuvchiga endi yangi buyurtmalar bormaydi va ushbu botga kirishi butunlay taqiqlandi.`,
    parse_mode: 'HTML',
    reply_markup: getKeyboardForUser(ownerChatId),
  });

  // 2. Notify the removed user if chat ID is known
  if (removedAdmin.id) {
    try {
      await apiCall('sendMessage', {
        chat_id: removedAdmin.id,
        text:
          `⛔ <b>Administratorlik huquqingiz bekor qilindi.</b>\n\n` +
          `Oddiy botga kiring, bu bot faqat adminlar va egalar uchun!\n\n` +
          `👉 <b>Mijozlar boti:</b> @${CLIENT_BOT_USERNAME}\n` +
          `🌐 <b>Veb-sayt:</b> https://xizmatchi.vercel.app`,
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true },
      });
    } catch (err) {
      console.log(`[Owner Bot] O'chirilgan adminga xabar yuborishda xato: ${err.message}`);
    }
  }
}

async function handleOrders(chatId, username = '') {
  const orders = getRecentOrders();

  if (orders.length === 0) {
    const text = `📋 <b>Hozircha buyurtmalar yo'q.</b>\n\nSaytda yangi buyurtma berilganda, u avtomatik ushbu botga xabar qilinadi!`;
    await apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: getKeyboardForUser(chatId, username),
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
    reply_markup: getKeyboardForUser(chatId, username),
  });
}

async function processUpdate(update) {
  // 1. Process Messages
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    const text = (msg.text || '').trim();
    const firstName = msg.from?.first_name || '';
    const userHandle = (msg.from?.username || '').replace(/^@/, '').toLowerCase();

    if (!chatId) return;

    // Check if this user is a pending admin matched by username
    const data = loadAdminsData();
    const pendingMatch = data.admins.find(
      (a) => a.username && a.username.toLowerCase() === userHandle && !a.id
    );

    if (pendingMatch) {
      pendingMatch.id = chatId;
      pendingMatch.name = `${firstName} ${msg.from?.last_name || ''}`.trim() || `@${userHandle}`;
      saveAdminsData(data);
      console.log(`[Owner Bot] 🎉 Kutilayotgan admin faollashdi: @${userHandle} (ID: ${chatId})`);

      // Notify Superadmin
      await apiCall('sendMessage', {
        chat_id: SUPERADMIN_ID,
        text: `⚡ <b>Yangi administrator faollashdi:</b>\n👤 @${userHandle} (${pendingMatch.name})\n🆔 ID: <code>${chatId}</code>\n\nEndi unga barcha arizalar yetkaziladi.`,
        parse_mode: 'HTML',
      });
    }

    // ⛔ STRICT SECURITY CHECK: Unauthorized users are completely locked out
    if (!isAdmin(chatId, userHandle)) {
      console.log(`[Owner Bot] ⛔ Begona foydalanuvchi bloklandi: Chat ID ${chatId}, @${userHandle}, ${firstName}`);
      await handleUnauthorized(chatId);
      return;
    }

    // Dynamic update for Superadmin Fayzbek if chat_id differs
    if (userHandle === SUPERADMIN_USERNAME && data.superadmin !== chatId) {
      data.superadmin = chatId;
      const ownerAdmin = data.admins.find((a) => a.username?.toLowerCase() === SUPERADMIN_USERNAME);
      if (ownerAdmin) ownerAdmin.id = chatId;
      saveAdminsData(data);
    }

    // Check if Superadmin is in the middle of adding an admin
    if (isSuperadmin(chatId, userHandle) && USER_STATES.has(chatId)) {
      if (text === '/cancel' || text === '❌ Bekor qilish') {
        USER_STATES.delete(chatId);
        await apiCall('sendMessage', {
          chat_id: chatId,
          text: "Amal bekor qilindi.",
          reply_markup: getKeyboardForUser(chatId, userHandle),
        });
        return;
      }

      let targetInput = text;
      let targetName = '';
      let targetUsername = '';

      // If message was forwarded from a user
      if (msg.forward_from) {
        targetInput = String(msg.forward_from.id);
        targetName = `${msg.forward_from.first_name || ''} ${msg.forward_from.last_name || ''}`.trim();
        targetUsername = msg.forward_from.username || '';
      }

      await executeAddAdmin(chatId, targetInput, targetName, targetUsername);
      return;
    }

    // Handle Delete Commands: e.g. /del_12345678 or /del_username
    if (text.startsWith('/del_') && isSuperadmin(chatId, userHandle)) {
      const delParam = text.replace('/del_', '').trim();
      if (delParam) {
        await executeRemoveAdmin(chatId, delParam);
        return;
      }
    }

    // Standard Menu Commands
    if (text === '/start' || text.startsWith('/start') || text === '🔔 Bildirishnomalarni faollashtirish' || text === '🔔 Bildirishnoma') {
      await handleStart(chatId, firstName, userHandle);
    } else if (text === '📋 Buyurtmalar' || text === '/buyurtmalar' || text === '📋 Oxirgi buyurtmalar') {
      await handleOrders(chatId, userHandle);
    } else if (text === "👑 Adminlar bo'limi" || text === "👑 Adminlar" || text === '/adminlar') {
      await handleAdminPanel(chatId, userHandle);
    } else if (text === '📊 Statistika' || text === '/statistika') {
      const orders = getRecentOrders();
      const adminData = loadAdminsData();
      await apiCall('sendMessage', {
        chat_id: chatId,
        text:
          `📊 <b>Xizmatchi Statistikasi:</b>\n\n` +
          `👑 Bosh Egasi: Fayzbek (@${SUPERADMIN_USERNAME})\n` +
          `📦 Jami arizalar: <b>${orders.length} ta</b>\n` +
          `👥 Biriktirilgan adminlar: <b>${adminData.admins.length} nafar</b>\n` +
          `🤖 Bot: 🟢 Faol (Yopiq boshqaruv markazi)\n` +
          `🌐 Sayt: https://xizmatchi.vercel.app\n` +
          `⚡ Server: 🟢 Onlayn`,
        parse_mode: 'HTML',
        reply_markup: getKeyboardForUser(chatId, userHandle),
      });
    } else if (text === '👥 Mijozlar' || text === '/mijozlar') {
      const orders = getRecentOrders();
      let clientMsg = `👥 <b>Mijozlar ro'yxati (${orders.length} ta buyurtma asosida):</b>\n\n`;
      const unique = new Map();
      orders.forEach((o) => {
        const b = o.booking || o;
        if (b.clientPhone && !unique.has(b.clientPhone)) {
          unique.set(b.clientPhone, b.clientName || "Noma'lum");
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
        reply_markup: getKeyboardForUser(chatId, userHandle),
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
        reply_markup: getKeyboardForUser(chatId, userHandle),
      });
    } else if (text === '🔍 Qidiruv' || text === '/qidiruv') {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `🔍 <b>Qidiruv:</b>\n\nIstalgan telefon raqam yoki buyurtma ID sini yozib yuboring (masalan: <code>901234567</code>):`,
        parse_mode: 'HTML',
        reply_markup: getKeyboardForUser(chatId, userHandle),
      });
    } else if (text === '🌐 Saytni ochish' || text === '/sayt') {
      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `🌐 <b>Xizmatchi platformasi:</b>\n👉 https://xizmatchi.vercel.app`,
        parse_mode: 'HTML',
        reply_markup: getKeyboardForUser(chatId, userHandle),
      });
    } else {
      // Search query handler
      const orders = getRecentOrders();
      const matched = orders.filter((o) => {
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
        await apiCall('sendMessage', {
          chat_id: chatId,
          text: resMsg,
          parse_mode: 'HTML',
          reply_markup: getKeyboardForUser(chatId, userHandle),
        });
        return;
      }

      await apiCall('sendMessage', {
        chat_id: chatId,
        text: `Boshqaruv uchun pastdagi menyudan kerakli bo'limni tanlang:`,
        reply_markup: getKeyboardForUser(chatId, userHandle),
      });
    }
  }

  // 2. Process Callback Queries (Buttons)
  else if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const messageId = cb.message?.message_id;
    const data = cb.data || '';
    const userHandle = (cb.from?.username || '').replace(/^@/, '').toLowerCase();

    if (!chatId || !isAdmin(chatId, userHandle)) {
      await apiCall('answerCallbackQuery', {
        callback_query_id: cb.id,
        text: '⛔ Ruxsat etilmagan!',
        show_alert: true,
      });
      return;
    }

    if (data === 'admin_main') {
      await apiCall('answerCallbackQuery', { callback_query_id: cb.id });
      await handleAdminPanel(chatId, userHandle);
    } else if (data === 'admin_list' || data === 'admin_refresh') {
      await apiCall('answerCallbackQuery', { callback_query_id: cb.id, text: "Adminlar ro'yxati yangilandi" });
      await showAdminList(chatId, messageId);
    } else if (data === 'admin_add_prompt') {
      await apiCall('answerCallbackQuery', { callback_query_id: cb.id });
      await promptAddAdmin(chatId, messageId);
    } else if (data === 'admin_remove_menu') {
      await apiCall('answerCallbackQuery', { callback_query_id: cb.id });
      await showRemoveAdminMenu(chatId, messageId);
    } else if (data === 'admin_cancel') {
      USER_STATES.delete(chatId);
      await apiCall('answerCallbackQuery', { callback_query_id: cb.id, text: 'Bekor qilindi' });
      await handleAdminPanel(chatId, userHandle);
    } else if (data.startsWith('admin_del_')) {
      const targetParam = data.replace('admin_del_', '');
      await apiCall('answerCallbackQuery', { callback_query_id: cb.id });
      await executeRemoveAdmin(chatId, targetParam);
    } else if (data.startsWith('accept_')) {
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
  }
}

async function runBot() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 Xizmatchi Maxfiy Boshqaruv Boti ishga tushdi!');
  console.log(`🔐 Bosh Egasi / Superadmin: Fayzbek (@${SUPERADMIN_USERNAME}), ID: ${SUPERADMIN_ID}`);
  console.log(`🤖 Token: ${TOKEN.slice(0, 10)}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const me = await apiCall('getMe');
  if (!me.ok) {
    console.error('Bot token tekshiruvdan o\'tmadi:', me);
    return;
  }
  console.log(`[Owner Bot] Bot Nomi: "${me.result.first_name}", @${me.result.username}`);

  // Load admins and sync subscribers
  const adminsData = loadAdminsData();
  console.log(`[Owner Bot] Jami ruxsat etilgan adminlar: ${adminsData.admins.length} ta`);

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
