// handlers/message.js — Xizmatchi Owner & Admin Bot (Pro Management on Telegram Serverless)
import { api, db } from 'sdk';
import { eq, desc } from 'sdk/db';
import { owners, admins, orders } from '../schema.js';

const SUPERADMIN_ID = 6707839718;
const SUPERADMIN_USERNAME = 'fayzbek1331';
const CLIENT_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_bot';

function isSuperadmin(chatId, username = '') {
  const clean = (username || '').replace(/^@/, '').toLowerCase();
  return clean === SUPERADMIN_USERNAME || Number(chatId) === SUPERADMIN_ID;
}

async function isAuthorizedAdmin(chatId, username = '') {
  if (isSuperadmin(chatId, username)) return true;
  const clean = (username || '').replace(/^@/, '').toLowerCase();
  const numId = Number(chatId);

  try {
    const allAdmins = await db.select().from(admins).all();
    if (allAdmins.some((a) => (a.tgId && Number(a.tgId) === numId) || (a.username && a.username.toLowerCase() === clean))) {
      return true;
    }
  } catch (e) {}

  try {
    const allOwners = await db.select().from(owners).all();
    if (allOwners.some((o) => (o.tgId && Number(o.tgId) === numId) || (o.username && o.username.toLowerCase() === clean))) {
      return true;
    }
  } catch (e) {}

  return false;
}

const KEYBOARD_SUPERADMIN = {
  keyboard: [
    [{ text: '📋 Buyurtmalar' }, { text: '📊 Statistika' }],
    [{ text: "👑 Adminlar bo'limi" }, { text: '👥 Mijozlar' }],
    [{ text: '🛠️ Ustalar' }, { text: '🔍 Qidiruv' }],
    [{ text: '🌐 Saytni ochish', web_app: { url: 'https://xizmatchi.vercel.app' } }],
  ],
  resize_keyboard: true,
};

const KEYBOARD_ADMIN = {
  keyboard: [
    [{ text: '📋 Buyurtmalar' }, { text: '📊 Statistika' }],
    [{ text: '👥 Mijozlar' }, { text: '🛠️ Ustalar' }],
    [{ text: '🔍 Qidiruv' }],
    [{ text: '🌐 Saytni ochish', web_app: { url: 'https://xizmatchi.vercel.app' } }],
  ],
  resize_keyboard: true,
};

function getKeyboard(chatId, username = '') {
  return isSuperadmin(chatId, username) ? KEYBOARD_SUPERADMIN : KEYBOARD_ADMIN;
}

const SPECIALISTS = [
  { name: 'Mansur Saidvaliyev', profession: 'Professional Dezinfeksiya & Dezinseksiya', rating: '5.0 ⭐', phone: '+998 90 912 34 56', district: 'Toshkent shahar (barcha tumanlar)' },
  { name: 'Akmal Rustamov', profession: 'Santexnik (11 yillik tajriba)', rating: '4.9 ⭐', phone: '+998 90 912 34 56', district: 'Chilonzor tumani' },
  { name: 'Jamshid Karimov', profession: 'Professional Elektrik (14 yil)', rating: '4.95 ⭐', phone: '+998 93 543 21 00', district: 'Yunusobod tumani' },
  { name: 'Bobur Mirzayev', profession: 'Konditsioner & Sovutish ustasi', rating: '4.88 ⭐', phone: '+998 97 789 45 12', district: 'Mirzo Ulug\'bek tumani' },
  { name: 'Otabek Normurodov', profession: 'Maishiy texnika ta\'miri', rating: '4.92 ⭐', phone: '+998 91 333 44 55', district: 'Yakkasaroy tumani' },
  { name: 'Dilshodbek Ergashev', profession: 'Kafel & Qurilish ta\'miri', rating: '4.96 ⭐', phone: '+998 94 620 11 22', district: 'Shayxontohur tumani' },
  { name: 'Shahnoza Alimova', profession: 'Klining & Tozalash xizmati', rating: '4.94 ⭐', phone: '+998 99 888 77 66', district: 'Mirobod tumani' },
  { name: 'Muzaffar Yo\'ldoshev', profession: 'Mebel yig\'ish va yasash', rating: '4.87 ⭐', phone: '+998 90 123 45 67', district: 'Uchtepa tumani' },
  { name: 'Farhod Tursunov', profession: 'Qulf ochish va o\'rnatish 24/7', rating: '4.98 ⭐', phone: '+998 93 111 22 33', district: 'Sergeli tumani' },
];

export default async function (message, ctx) {
  const chatId = message.chat.id;
  const fromUser = message.from;
  const text = (message.text || '').trim();
  const userHandle = (fromUser?.username || '').replace(/^@/, '').toLowerCase();
  const fullName = [fromUser?.first_name, fromUser?.last_name].filter(Boolean).join(' ') || 'Administrator';

  // 1. Check if pending admin is activating via username
  try {
    const allAdmins = await db.select().from(admins).all();
    const pendingMatch = allAdmins.find(
      (a) => a.username && a.username.toLowerCase() === userHandle && !a.tgId
    );

    if (pendingMatch) {
      await db.update(admins)
        .set({ tgId: chatId, name: fullName })
        .where(eq(admins.id, pendingMatch.id))
        .run();

      await api.sendMessage({
        chat_id: chatId,
        text:
          `👋 <b>Salom, Xizmatchi platformasi Administratori!</b>\n\n` +
          `Sizning administratorlik maqomingiz muvaffaqiyatli faollashtirildi!\n` +
          `⚡ Endi saytdan keladigan barcha arizalar sizga yetkaziladi.\n\n` +
          `Boshqaruv menyusini ochish uchun /start bosing.`,
        parse_mode: 'HTML',
        reply_markup: KEYBOARD_ADMIN,
      });

      await api.sendMessage({
        chat_id: SUPERADMIN_ID,
        text: `⚡ <b>Yangi administrator faollashdi:</b>\n👤 @${userHandle} (${fullName})\n🆔 ID: <code>${chatId}</code>\n\nEndi unga barcha yangi buyurtmalar yetkaziladi.`,
        parse_mode: 'HTML',
      });
    }
  } catch (e) {
    console.error('Error checking pending admin:', e);
  }

  // 2. Strict Security Check: Unauthorized users are blocked immediately
  const authorized = await isAuthorizedAdmin(chatId, userHandle);
  if (!authorized) {
    await api.sendMessage({
      chat_id: chatId,
      text:
        `⛔ <b>Kirish taqiqlandi!</b>\n\n` +
        `Oddiy botga kiring, bu bot faqat adminlar va egalar uchun!\n\n` +
        `👉 <b>Mijozlar boti:</b> @${CLIENT_BOT_USERNAME}\n` +
        `🌐 <b>Veb-sayt:</b> https://xizmatchi.vercel.app`,
      parse_mode: 'HTML',
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  const isOwner = isSuperadmin(chatId, userHandle);

  // 3. /start Command & Notifications
  if (text.startsWith('/start') || text === '🔔 Bildirishnomalarni faollashtirish' || text === '🔔 Bildirishnoma') {
    const title = isOwner ? '👑 Bosh Egasi (Superadmin)' : '👤 Rasmiy Administrator';
    const greeting = isOwner
      ? `👑 <b>Assalomu alaykum, hurmatli Bosh Administrator Fayzbek (@${SUPERADMIN_USERNAME})!</b>`
      : `👋 <b>Salom, Xizmatchi platformasi Administratori!</b>`;

    const welcomeText =
      `${greeting}\n\n` +
      `Siz <b>Xizmatchi Boshqaruv Markazi</b>ga muvaffaqiyatli ulandingiz.\n\n` +
      `🆔 <b>Sizning Telegram ID:</b> <code>${chatId}</code>\n` +
      `🏷️ <b>Maqomingiz:</b> 🟢 <b>${title}</b>\n` +
      `⚡ <b>Bildirishnomalar:</b> 🟢 <b>Faol (Saytdan tushgan barcha arizalar sizga yetkaziladi)</b>\n` +
      `🌐 <b>Veb-sayt:</b> https://xizmatchi.vercel.app\n\n` +
      `Pastdagi qulay menyu orqali platformani boshqarishingiz mumkin:`;

    await api.sendMessage({
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'HTML',
      reply_markup: getKeyboard(chatId, userHandle),
    });
    return;
  }

  // 4. Greetings handler
  const lowerText = text.toLowerCase();
  if (lowerText === 'salom' || lowerText === 'assalomu alaykum' || lowerText === 'salom alaykum' || lowerText === 'salom!') {
    const greetingReply = isOwner
      ? `👑 <b>Assalomu alaykum, hurmatli Bosh Administrator Fayzbek!</b>\n\nBarcha tizimlar faol ishlamoqda.`
      : `👋 <b>Salom, Xizmatchi platformasi Administratori!</b>\n\nBarcha tizimlar faol. Yangi buyurtmalar tushishi bilan sizga yetkaziladi.`;

    await api.sendMessage({
      chat_id: chatId,
      text: greetingReply,
      parse_mode: 'HTML',
      reply_markup: getKeyboard(chatId, userHandle),
    });
    return;
  }

  // 5. Admin Management Panel (Superadmin only)
  if (text === "👑 Adminlar bo'limi" || text === "👑 Adminlar" || text === '/adminlar') {
    if (!isOwner) {
      await api.sendMessage({
        chat_id: chatId,
        text: "⚠️ Bu bo'lim faqat Bosh Administrator (Fayzbek) uchun mavjud.",
        reply_markup: getKeyboard(chatId, userHandle),
      });
      return;
    }

    try {
      const allAdmins = await db.select().from(admins).all();
      let msg = `👑 <b>Xizmatchi — Adminlar Boshqaruvi</b>\n`;
      msg += `━━━━━━━━━━━━━━━━━━\n`;
      msg += `👤 <b>Bosh Egasi:</b> Fayzbek (@${SUPERADMIN_USERNAME})\n`;
      msg += `📊 Jami biriktirilgan adminlar: <b>${allAdmins.length} nafar</b>\n\n`;
      msg += `⚡ <i>Barcha qo'shilgan adminlarga saytdan tushgan yangi buyurtmalar avtomatik yetkaziladi.</i>\n\n`;
      msg += `Kerakli amalni tanlang:`;

      await api.sendMessage({
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📋 Adminlar ro'yxati", callback_data: "admin_list" },
              { text: "➕ Admin qo'shish", callback_data: "admin_add_prompt" },
            ],
            [
              { text: "🔄 Yangilash", callback_data: "admin_refresh" },
            ],
          ],
        },
      });
    } catch (e) {
      console.error('Error in admin panel:', e);
    }
    return;
  }

  // 6. Command /addadmin <id yoki @username>
  if (text.startsWith('/addadmin') && isOwner) {
    const param = text.replace('/addadmin', '').trim();
    if (!param) {
      await api.sendMessage({
        chat_id: chatId,
        text: `⚠️ Iltimos, Telegram ID yoki @username kiriting:\nMasalan: <code>/addadmin @sherik_admin</code> yoki <code>/addadmin 123456789</code>`,
        parse_mode: 'HTML',
      });
      return;
    }

    const cleanParam = param.replace(/^@/, '');
    const numId = Number(param);

    try {
      if (!isNaN(numId) && numId > 0) {
        await db.insert(admins).values({
          tgId: numId,
          name: `Admin #${numId}`,
          role: 'admin',
          createdAt: new Date().toISOString(),
        }).run();

        await api.sendMessage({
          chat_id: chatId,
          text: `✅ <b>Admin muvaffaqiyatli qo'shildi!</b>\n🆔 ID: <code>${numId}</code>\n\n⚡ Endi unga barcha yangi buyurtmalar boradi.`,
          parse_mode: 'HTML',
          reply_markup: getKeyboard(chatId, userHandle),
        });

        try {
          await api.sendMessage({
            chat_id: numId,
            text:
              `👋 <b>Salom, Xizmatchi platformasi Administratori!</b>\n\n` +
              `Siz <b>Xizmatchi</b> platformasi rahbari Fayzbek (@${SUPERADMIN_USERNAME}) tomonidan rasmiy administrator sifatida tayinlandingiz!\n\n` +
              `⚡ Endi saytdan keladigan barcha yangi buyurtmalar sizga ham yetkaziladi.\n\n` +
              `Boshqaruv menyusini ochish uchun /start bosing.`,
            parse_mode: 'HTML',
            reply_markup: KEYBOARD_ADMIN,
          });
        } catch (err) {}
      } else {
        await db.insert(admins).values({
          username: cleanParam,
          name: `@${cleanParam}`,
          role: 'admin',
          createdAt: new Date().toISOString(),
        }).run();

        await api.sendMessage({
          chat_id: chatId,
          text: `✅ <b>Admin muvaffaqiyatli ro'yxatga olindi!</b>\n👤 Username: @${cleanParam}\n\n💡 <i>Foydalanuvchi botga kirib /start bosishi bilan uning hisobi to'liq faollashadi va xabarlar boradi.</i>`,
          parse_mode: 'HTML',
          reply_markup: getKeyboard(chatId, userHandle),
        });
      }
    } catch (e) {
      console.error('Error adding admin:', e);
      await api.sendMessage({ chat_id: chatId, text: `Xatolik: Ushbu foydalanuvchi allaqachon mavjud yoki noto'g'ri kiritildi.` });
    }
    return;
  }

  // 7. Command /deladmin yoki /del_<id>
  if ((text.startsWith('/deladmin') || text.startsWith('/del_')) && isOwner) {
    const param = text.startsWith('/deladmin') ? text.replace('/deladmin', '').trim() : text.replace('/del_', '').trim();
    if (!param) {
      await api.sendMessage({ chat_id: chatId, text: "Iltimos, o'chiriladigan admin ID yoki @username'ini kiriting." });
      return;
    }

    if (param === String(SUPERADMIN_ID) || param.toLowerCase() === SUPERADMIN_USERNAME) {
      await api.sendMessage({ chat_id: chatId, text: "❌ Bosh administratorni o'chirib bo'lmaydi!" });
      return;
    }

    try {
      const numId = Number(param);
      if (!isNaN(numId) && numId > 0) {
        await db.delete(admins).where(eq(admins.tgId, numId)).run();
      } else {
        await db.delete(admins).where(eq(admins.username, param.replace(/^@/, ''))).run();
      }

      await api.sendMessage({
        chat_id: chatId,
        text: `✅ Admin (${param}) muvaffaqiyatli chiqarildi. Unga endi yangi arizalar bormaydi.`,
        reply_markup: getKeyboard(chatId, userHandle),
      });
    } catch (e) {
      console.error('Error deleting admin:', e);
    }
    return;
  }

  // 8. '📋 Buyurtmalar'
  if (text === '📋 Buyurtmalar' || text === '📋 Oxirgi buyurtmalar' || text === '/buyurtmalar') {
    try {
      const recentOrders = await db.select().from(orders).orderBy(desc(orders.id)).limit(10).all();

      if (!recentOrders || recentOrders.length === 0) {
        await api.sendMessage({
          chat_id: chatId,
          text: `📋 <b>Hozircha buyurtmalar ro'yxati bo'sh.</b>\n\nSaytda mijozlar buyurtma berganda arizalar bir zumda shu yerda paydo bo'ladi.`,
          parse_mode: 'HTML',
          reply_markup: getKeyboard(chatId, userHandle),
        });
        return;
      }

      let msg = `📋 <b>Oxirgi tushgan buyurtmalar (${recentOrders.length} ta):</b>\n\n`;
      recentOrders.forEach((o, idx) => {
        const badge = o.status === 'bajarildi' ? '✅ Bajarildi' :
                      o.status === 'qabul_qilindi' ? '⏳ Jarayonda' :
                      o.status === 'bekor_qilindi' ? '❌ Bekor qilingan' : '🆕 Yangi';

        msg += `<b>${idx + 1}. Buyurtma #${o.bookingId || o.id}</b> [${badge}]\n`;
        msg += `👤 Mijoz: <b>${o.clientName || 'Noma\'lum'}</b>\n`;
        msg += `📞 Tel: <code>${o.clientPhone || '—'}</code>\n`;
        msg += `📍 Hudud: ${o.district || 'Toshkent'} ${o.address ? `(${o.address})` : ''}\n`;
        msg += `🛠 Xizmat: <b>${o.category || 'Xizmat'}</b>\n`;
        if (o.description) msg += `📝 Tavsif: <i>"${o.description}"</i>\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;
      });

      await api.sendMessage({
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🆕 Yangilar', callback_data: 'filter_orders_yangi' },
              { text: '⏳ Jarayonda', callback_data: 'filter_orders_jarayonda' },
            ],
            [
              { text: '✅ Bajarilganlar', callback_data: 'filter_orders_bajarildi' },
              { text: '📋 Barchasi', callback_data: 'filter_orders_all' },
            ],
          ],
        },
      });
    } catch (e) {
      console.error('Error fetching orders:', e);
      await api.sendMessage({ chat_id: chatId, text: 'Buyurtmalarni olishda xatolik yuz berdi.' });
    }
    return;
  }

  // 9. '📊 Statistika'
  if (text === '📊 Statistika' || text === '/statistika') {
    try {
      const allOrders = await db.select().from(orders).all();
      const allAdmins = await db.select().from(admins).all();

      const totalCount = allOrders.length;
      const yangiCount = allOrders.filter(o => o.status === 'yangi' || !o.status).length;
      const jarayondaCount = allOrders.filter(o => o.status === 'qabul_qilindi').length;
      const bajarildiCount = allOrders.filter(o => o.status === 'bajarildi').length;

      const statsText = 
        `📊 <b>XIZMATCHI TIZIM STATISTIKASI:</b>\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👑 <b>Bosh Egasi:</b> Fayzbek (@${SUPERADMIN_USERNAME})\n` +
        `👥 <b>Adminlar soni:</b> ${allAdmins.length + 1} nafar\n` +
        `📦 <b>Jami buyurtmalar:</b> ${totalCount} ta\n` +
        `🆕 <b>Yangi arizalar:</b> ${yangiCount} ta\n` +
        `⏳ <b>Jarayonda:</b> ${jarayondaCount} ta\n` +
        `✅ <b>Muvaffaqiyatli bajarilgan:</b> ${bajarildiCount} ta\n` +
        `👷‍♂️ <b>Ro'yxatdan o'tgan ustalar:</b> ${SPECIALISTS.length} nafar\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🌐 <b>Veb-platforma:</b> https://xizmatchi.vercel.app\n` +
        `⚡ <b>Serverless Cloud:</b> 🟢 24/7 Faol`;

      await api.sendMessage({
        chat_id: chatId,
        text: statsText,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔔 Sinov xabari yuborish', callback_data: 'test_notification' }],
            [{ text: '🚀 Veb-saytni ochish', url: 'https://xizmatchi.vercel.app' }],
          ],
        },
      });
    } catch (e) {
      console.error('Error fetching stats:', e);
      await api.sendMessage({ chat_id: chatId, text: 'Statistikani olishda xatolik yuz berdi.' });
    }
    return;
  }

  // 10. '👥 Mijozlar'
  if (text === '👥 Mijozlar' || text === '/mijozlar') {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.id)).limit(15).all();
      if (!allOrders || allOrders.length === 0) {
        await api.sendMessage({
          chat_id: chatId,
          text: `👥 <b>Hozircha mijozlar ma'lumotlari mavjud emas.</b>`,
          reply_markup: getKeyboard(chatId, userHandle),
        });
        return;
      }

      const clientMap = new Map();
      allOrders.forEach(o => {
        const phone = o.clientPhone;
        if (phone && !clientMap.has(phone)) {
          clientMap.set(phone, {
            name: o.clientName || 'Noma\'lum',
            phone: phone,
            district: o.district || 'Toshkent',
            ordersCount: allOrders.filter(x => x.clientPhone === phone).length,
          });
        }
      });

      let clientsText = `👥 <b>So'nggi faol mijozlar (${clientMap.size} nafar):</b>\n\n`;
      let count = 1;
      clientMap.forEach(c => {
        clientsText += `<b>${count}. ${c.name}</b>\n`;
        clientsText += `📞 Tel: <code>${c.phone}</code>\n`;
        clientsText += `📍 Hudud: ${c.district}\n`;
        clientsText += `📦 Buyurtmalar soni: <b>${c.ordersCount} ta</b>\n`;
        clientsText += `─────────────────\n`;
        count++;
      });

      await api.sendMessage({
        chat_id: chatId,
        text: clientsText,
        parse_mode: 'HTML',
        reply_markup: getKeyboard(chatId, userHandle),
      });
    } catch (e) {
      console.error('Error in clients handler:', e);
    }
    return;
  }

  // 11. '🛠️ Ustalar'
  if (text === '🛠️ Ustalar' || text === '/ustalar') {
    let specText = `🛠️ <b>Platformadagi tasdiqlangan ustalar (${SPECIALISTS.length} nafar):</b>\n\n`;
    SPECIALISTS.forEach((s, idx) => {
      specText += `<b>${idx + 1}. ${s.name}</b> (${s.rating})\n`;
      specText += `🔧 <i>${s.profession}</i>\n`;
      specText += `📍 ${s.district}\n`;
      specText += `📞 Tel: <code>${s.phone}</code>\n`;
      specText += `─────────────────\n`;
    });

    await api.sendMessage({
      chat_id: chatId,
      text: specText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Saytda ustalarni ko\'rish', url: 'https://xizmatchi.vercel.app/#specialists-section' }],
        ],
      },
    });
    return;
  }

  // 12. '🔍 Qidiruv'
  if (text === '🔍 Qidiruv' || text === '/qidiruv') {
    await api.sendMessage({
      chat_id: chatId,
      text: `🔍 <b>Buyurtma yoki mijozni qidirish:</b>\n\nIstalgan telefon raqam yoki buyurtma ID sini yozib yuboring (masalan: <code>901234567</code>):`,
      parse_mode: 'HTML',
      reply_markup: getKeyboard(chatId, userHandle),
    });
    return;
  }

  // 13. '🌐 Saytni ochish'
  if (text === '🌐 Saytni ochish' || text === '/sayt') {
    await api.sendMessage({
      chat_id: chatId,
      text: `🌐 <b>Xizmatchi platformasi:</b>\n👉 https://xizmatchi.vercel.app`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Saytni ochish', url: 'https://xizmatchi.vercel.app' }],
        ],
      },
    });
    return;
  }

  // 14. Search query handler if text length >= 3
  if (text.length >= 3 && !text.startsWith('/')) {
    try {
      const cleanSearch = text.replace(/[^\w\d+]/g, '');
      const allOrders = await db.select().from(orders).orderBy(desc(orders.id)).limit(50).all();

      const matched = allOrders.filter(o => 
        (o.clientPhone && o.clientPhone.includes(cleanSearch)) ||
        (o.bookingId && o.bookingId.toLowerCase().includes(text.toLowerCase())) ||
        (o.clientName && o.clientName.toLowerCase().includes(text.toLowerCase())) ||
        (o.district && o.district.toLowerCase().includes(text.toLowerCase()))
      );

      if (matched.length > 0) {
        let resMsg = `🔍 <b>"${text}" bo'yicha ${matched.length} ta natija:</b>\n\n`;
        matched.slice(0, 5).forEach((o, idx) => {
          const badge = o.status === 'bajarildi' ? '✅ Bajarildi' :
                        o.status === 'qabul_qilindi' ? '⏳ Jarayonda' :
                        o.status === 'bekor_qilindi' ? '❌ Bekor qilingan' : '🆕 Yangi';

          resMsg += `<b>${idx + 1}. Buyurtma #${o.bookingId || o.id}</b> [${badge}]\n`;
          resMsg += `👤 Mijoz: <b>${o.clientName || 'Noma\'lum'}</b>\n`;
          resMsg += `📞 Tel: <code>${o.clientPhone || '—'}</code>\n`;
          resMsg += `📍 Hudud: ${o.district || 'Toshkent'}\n`;
          resMsg += `🛠 Xizmat: ${o.category || 'Xizmat'}\n`;
          resMsg += `━━━━━━━━━━━━━━━━━━\n`;
        });

        await api.sendMessage({
          chat_id: chatId,
          text: resMsg,
          parse_mode: 'HTML',
          reply_markup: getKeyboard(chatId, userHandle),
        });
        return;
      }
    } catch (e) {
      console.error('Search error:', e);
    }
  }

  // Default menu reply
  await api.sendMessage({
    chat_id: chatId,
    text: `Boshqaruv uchun pastdagi menyudan kerakli bo'limni tanlang:`,
    reply_markup: getKeyboard(chatId, userHandle),
  });
}
