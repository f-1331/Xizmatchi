// handlers/message.js — Xizmatchi Owner & Admin Bot (Pro Management)
import { api, db, fetch } from 'sdk';
import { eq, desc, like, or } from 'sdk/db';
import { owners, orders } from '../schema.js';

// Clean, compact, mobile-perfect keyboard (never squishes on small screens)
const OWNER_KEYBOARD = {
  keyboard: [
    [{ text: '📋 Buyurtmalar' }, { text: '📊 Statistika' }],
    [{ text: '👥 Mijozlar' }, { text: '🛠️ Ustalar' }],
    [{ text: '🔔 Bildirishnoma' }, { text: '🔍 Qidiruv' }],
    [
      { text: '🚀 Saytni ochish (Web App)', web_app: { url: 'https://xizmatchi.vercel.app' } },
      { text: 'ℹ️ Yordam' },
    ],
  ],
  resize_keyboard: true,
};

// Specialist catalog for quick reference
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

  const fullName = [fromUser?.first_name, fromUser?.last_name].filter(Boolean).join(' ') || 'Admin';
  const tgUsername = fromUser?.username ? `@${fromUser.username}` : '';

  // Helper to sync subscriber chat ID with Vercel Next.js API
  async function syncWithPlatform() {
    try {
      await fetch(`https://xizmatchi.vercel.app/api/telegram?subscribe=${chatId}&role=owner&name=${encodeURIComponent(fullName)}`);
    } catch (e) {
      // Vercel might be momentarily sleeping
    }
  }

  // Handle contact sharing
  if (message.contact) {
    const rawPhone = message.contact.phone_number;
    const phone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;

    try {
      await db.insert(owners).values({
        tgId: fromUser.id,
        name: fullName,
        username: tgUsername,
        phone,
        role: 'owner',
        createdAt: new Date().toISOString(),
      }).onConflictDoUpdate({
        target: owners.tgId,
        set: { name: fullName, username: tgUsername, phone },
      }).run();

      await syncWithPlatform();

      await api.sendMessage({
        chat_id: chatId,
        text: `✅ <b>Telefon raqamingiz muvaffaqiyatli saqlandi!</b>\n\n` +
              `📱 Raqam: <code>${phone}</code>\n` +
              `🆔 Telegram ID: <code>${chatId}</code>\n\n` +
              `Endi saytga har qanday yangi buyurtma tushganda shu botga tezkor xabar keladi!`,
        parse_mode: 'HTML',
        reply_markup: OWNER_KEYBOARD,
      });
    } catch (e) {
      console.error('Error saving owner contact:', e);
    }
    return;
  }

  // Always keep owner record up-to-date in DB
  if (fromUser) {
    try {
      await db.insert(owners).values({
        tgId: fromUser.id,
        name: fullName,
        username: tgUsername,
        role: 'owner',
        createdAt: new Date().toISOString(),
      }).onConflictDoUpdate({
        target: owners.tgId,
        set: { name: fullName, username: tgUsername },
      }).run();

      await syncWithPlatform();
    } catch (e) {
      console.error('Error registering owner:', e);
    }
  }

  // 1. /start or Notification Activation
  if (text.startsWith('/start') || text === '🔔 Bildirishnomalarni faollashtirish' || text === '🔔 Bildirishnoma') {
    await syncWithPlatform();

    const welcomeText = 
      `👑 <b>Assalomu alaykum, Xizmatchi platformasi rahbari!</b>\n\n` +
      `Siz <b>Xizmatchi Boshqaruv Markazi</b>ga muvaffaqiyatli ulandingiz.\n\n` +
      `🆔 <b>Admin ID:</b> <code>${chatId}</code>\n` +
      `👤 <b>Administrator:</b> ${fullName} ${tgUsername}\n` +
      `⚡ <b>Xabarlar holati:</b> 🟢 <b>Faol (barcha arizalar shu yerga keladi)</b>\n` +
      `🌐 <b>Jonli veb-sayt:</b> https://xizmatchi.vercel.app\n\n` +
      `Pastdagi qulay menyu orqali buyurtmalarni ko'rishingiz, statistikani kuzatishingiz va mijozlar bilan bog'lanishingiz mumkin:`;

    await api.sendMessage({
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'HTML',
      reply_markup: OWNER_KEYBOARD,
    });
    return;
  }

  // 2. '📋 Buyurtmalar' or /buyurtmalar
  if (text === '📋 Buyurtmalar' || text === '📋 Oxirgi buyurtmalar' || text === '/buyurtmalar') {
    try {
      const recentOrders = await db.select().from(orders).orderBy(desc(orders.id)).limit(10).all();

      if (!recentOrders || recentOrders.length === 0) {
        await api.sendMessage({
          chat_id: chatId,
          text: `📋 <b>Hozircha buyurtmalar ro'yxati bo'sh.</b>\n\n` +
                `Saytda mijozlar buyurtma berganda arizalar bir zumda shu yerda paydo bo'ladi.`,
          parse_mode: 'HTML',
          reply_markup: OWNER_KEYBOARD,
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

  // 3. '📊 Statistika' or /statistika
  if (text === '📊 Statistika' || text === '📊 Tizim statistikasi' || text === '/statistika') {
    try {
      const allOrders = await db.select().from(orders).all();
      const totalOwnersCount = await db.$count(owners);

      const totalCount = allOrders.length;
      const yangiCount = allOrders.filter(o => o.status === 'yangi' || !o.status).length;
      const jarayondaCount = allOrders.filter(o => o.status === 'qabul_qilindi').length;
      const bajarildiCount = allOrders.filter(o => o.status === 'bajarildi').length;
      const bekorCount = allOrders.filter(o => o.status === 'bekor_qilindi').length;

      const statsText = 
        `📊 <b>XIZMATCHI TIZIM STATISTIKASI:</b>\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📦 <b>Jami buyurtmalar:</b> ${totalCount} ta\n` +
        `🆕 <b>Yangi arizalar:</b> ${yangiCount} ta\n` +
        `⏳ <b>Jarayonda:</b> ${jarayondaCount} ta\n` +
        `✅ <b>Muvaffaqiyatli bajarilgan:</b> ${bajarildiCount} ta\n` +
        `❌ <b>Bekor qilingan:</b> ${bekorCount} ta\n\n` +
        `👑 <b>Boshqaruvchilar:</b> ${totalOwnersCount} nafar\n` +
        `👷‍♂️ <b>Ro'yxatdan o'tgan ustalar:</b> ${SPECIALISTS.length} nafar\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🌐 <b>Veb-platforma:</b> https://xizmatchi.vercel.app\n` +
        `⚡ <b>Server:</b> 🟢 Vercel Edge & tgcloud faol\n` +
        `🤖 <b>Bot:</b> @xizmatchiuz_Uzbekistan_ownerbot`;

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

  // 4. '👥 Mijozlar' or /mijozlar
  if (text === '👥 Mijozlar' || text === '/mijozlar') {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.id)).limit(15).all();

      if (!allOrders || allOrders.length === 0) {
        await api.sendMessage({
          chat_id: chatId,
          text: `👥 <b>Hozircha mijozlar ma'lumotlari mavjud emas.</b>\n\nBuyurtmalar tushishi bilan mijozlarning telefonlari shu yerda saqlanadi.`,
          parse_mode: 'HTML',
          reply_markup: OWNER_KEYBOARD,
        });
        return;
      }

      // Group unique clients by phone
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
        reply_markup: OWNER_KEYBOARD,
      });
    } catch (e) {
      console.error('Error in clients handler:', e);
    }
    return;
  }

  // 5. '🛠️ Ustalar' or /ustalar
  if (text === '🛠️ Ustalar' || text === '/ustalar') {
    let specText = `🛠️ <b>Platformadagi tasdiqlangan ustalar (${SPECIALISTS.length} nafar):</b>\n\n`;

    SPECIALISTS.forEach((s, idx) => {
      specText += `<b>${idx + 1}. ${s.name}</b> (${s.rating})\n`;
      specText += `🔧 <i>${s.profession}</i>\n`;
      specText += `📍 ${s.district}\n`;
      specText += `📞 Tel: <code>${s.phone}</code>\n`;
      specText += `─────────────────\n`;
    });

    specText += `\n<i>Barcha ustalar portfoliolari saytda to'liq joylashtirilgan.</i>`;

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

  // 6. '🔍 Qidiruv' or search query
  if (text === '🔍 Qidiruv' || text === '/qidiruv') {
    await api.sendMessage({
      chat_id: chatId,
      text: `🔍 <b>Buyurtma yoki mijozni qidirish:</b>\n\n` +
            `Istalgan buyurtma ID raqamini (masalan: <code>1234</code> yoki <code>VERCEL-01</code>) ` +
            `yoki mijozning telefon raqamini (masalan: <code>901234567</code>) yozib yuboring.\n\n` +
            `Bot darhol bazadan qidirib, barcha ma'lumotlarni chiqarib beradi!`,
      parse_mode: 'HTML',
      reply_markup: OWNER_KEYBOARD,
    });
    return;
  }

  // 7. 'ℹ️ Yordam' or /yordam
  if (text === 'ℹ️ Yordam' || text === 'ℹ️ Yordam & Ma\'lumot' || text === '/yordam') {
    const helpText = 
      `ℹ️ <b>Xizmatchi Boshqaruv Markazi Yo'riqnomasi:</b>\n\n` +
      `• <b>📋 Buyurtmalar</b> — Barcha tushgan buyurtmalarni ko'rish va ularni Yangi / Jarayonda / Bajarildi bo'yicha saralash.\n` +
      `• <b>📊 Statistika</b> — Tizim ko'rsatkichlari, buyurtmalar soni va server holati.\n` +
      `• <b>👥 Mijozlar</b> — Buyurtma bergan mijozlarning telefon raqamlari va hisoboti.\n` +
      `• <b>🛠️ Ustalar</b> — Xizmatchi platformasidagi professional ustalar ro'yxati.\n` +
      `• <b>🔍 Qidiruv</b> — Telefon raqam yoki buyurtma ID bo'yicha bir zumda qidirish.\n` +
      `• <b>🚀 Web App</b> — Telegramdan chiqmasdan to'g'ridan-to'g'ri saytni ochish.\n\n` +
      `📞 <b>Texnik qo'llab-quvvatlash:</b> @fayzbek1331\n` +
      `🌐 <b>Rasmiy sayt:</b> https://xizmatchi.vercel.app`;

    await api.sendMessage({
      chat_id: chatId,
      text: helpText,
      parse_mode: 'HTML',
      reply_markup: OWNER_KEYBOARD,
    });
    return;
  }

  // 8. '🌐 Saytni ochish'
  if (text === '🌐 Xizmatchi saytini ochish' || text === '🌐 Saytni ochish' || text === '/sayt') {
    await api.sendMessage({
      chat_id: chatId,
      text: `🌐 <b>Xizmatchi Veb-Platformasi:</b>\n\nQuyidagi tugma orqali saytni bir zumda ochishingiz mumkin:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Saytni ochish (xizmatchi.vercel.app)', url: 'https://xizmatchi.vercel.app' }],
        ],
      },
    });
    return;
  }

  // 9. Check if message is a search query (digits, phone, or order ID)
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
        let resMsg = `🔍 <b>Qidiruv natijasi: "${text}" bo'yicha ${matched.length} ta buyurtma topildi:</b>\n\n`;
        matched.slice(0, 5).forEach((o, idx) => {
          const badge = o.status === 'bajarildi' ? '✅ Bajarildi' :
                        o.status === 'qabul_qilindi' ? '⏳ Jarayonda' :
                        o.status === 'bekor_qilindi' ? '❌ Bekor qilingan' : '🆕 Yangi';

          resMsg += `<b>${idx + 1}. Buyurtma #${o.bookingId || o.id}</b> [${badge}]\n`;
          resMsg += `👤 Mijoz: <b>${o.clientName || 'Noma\'lum'}</b>\n`;
          resMsg += `📞 Tel: <code>${o.clientPhone || '—'}</code>\n`;
          resMsg += `📍 Hudud: ${o.district || 'Toshkent'}\n`;
          resMsg += `🛠 Xizmat: ${o.category || 'Xizmat'}\n`;
          resMsg += `📝 Tavsif: <i>"${o.description || '—'}"</i>\n`;
          resMsg += `━━━━━━━━━━━━━━━━━━\n`;
        });

        await api.sendMessage({
          chat_id: chatId,
          text: resMsg,
          parse_mode: 'HTML',
          reply_markup: OWNER_KEYBOARD,
        });
        return;
      }
    } catch (e) {
      console.error('Search error:', e);
    }
  }

  // Default fallback response
  await api.sendMessage({
    chat_id: chatId,
    text: `Boshqaruv uchun quyidagi menyudan kerakli bo'limni tanlang:`,
    reply_markup: OWNER_KEYBOARD,
  });
}
