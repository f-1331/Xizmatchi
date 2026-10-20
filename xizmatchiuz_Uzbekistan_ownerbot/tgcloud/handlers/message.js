// handlers/message.js — Xizmatchi Owner & Admin Bot
import { api, db, fetch } from 'sdk';
import { eq, desc } from 'sdk/db';
import { owners, orders } from '../schema.js';

export default async function (message, ctx) {
  const chatId = message.chat.id;
  const fromUser = message.from;
  const text = (message.text || '').trim();

  const fullName = [fromUser?.first_name, fromUser?.last_name].filter(Boolean).join(' ') || 'Admin';
  const tgUsername = fromUser?.username ? `@${fromUser.username}` : '';

  // Main menu keyboard for the owner
  const ownerKeyboard = {
    keyboard: [
      [{ text: '🔔 Bildirishnomalarni faollashtirish' }, { text: '📋 Oxirgi buyurtmalar' }],
      [{ text: '📊 Tizim statistikasi' }, { text: '🌐 Xizmatchi saytini ochish' }],
      [{ text: 'ℹ️ Yordam & Ma\'lumot' }],
    ],
    resize_keyboard: true,
  };

  // Helper to sync subscriber chat ID with the Next.js API
  async function syncWithPlatform() {
    try {
      await fetch(`https://xizmatchi.vercel.app/api/telegram?subscribe=${chatId}&role=owner&name=${encodeURIComponent(fullName)}`);
    } catch (e) {
      // Vercel might be asleep or unreachable
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
              `Endi saytga buyurtma tushganda shu botga xabar keladi!`,
        parse_mode: 'HTML',
        reply_markup: ownerKeyboard,
      });
    } catch (e) {
      console.error('Error saving owner contact:', e);
    }
    return;
  }

  // Always register/update owner in DB
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

  // /start command
  if (text.startsWith('/start') || text === '🔔 Bildirishnomalarni faollashtirish') {
    await syncWithPlatform();

    const welcomeText = 
      `👑 <b>Assalomu alaykum, Xizmatchi platformasi rahbari / egasi!</b>\n\n` +
      `Siz <b>Xizmatchi Owner Bot</b> tizimiga muvaffaqiyatli ulandingiz!\n\n` +
      `🆔 <b>Sizning Telegram ID:</b> <code>${chatId}</code>\n` +
      `👤 <b>Administrator:</b> ${fullName} ${tgUsername}\n` +
      `⚡️ <b>Holat:</b> 🟢 <i>Yangi buyurtmalarni qabul qilish faol!</i>\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📌 <b>Qanday ishlaydi?</b>\n` +
      `Saytda (https://xizmatchiuz.netlify.app) mijoz yangi buyurtma berganda yoki usta chaqirganda:\n` +
      `1. Mijozning ismi va telefon raqami\n` +
      `2. Tuman va aniq manzili\n` +
      `3. Kerakli xizmat yoki usta turi\n` +
      `4. Muammo tavsifi va qulay vaqt\n` +
      `darhol ushbu botga to'g'ridan-to'g'ri xabar sifatida keladi!\n\n` +
      `Pastdagi tugmalar orqali platformani boshqarishingiz mumkin:`;

    await api.sendMessage({
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'HTML',
      reply_markup: ownerKeyboard,
    });
    return;
  }

  // '📋 Oxirgi buyurtmalar' or /buyurtmalar
  if (text === '📋 Oxirgi buyurtmalar' || text === '/buyurtmalar') {
    try {
      const recentOrders = await db.select().from(orders).orderBy(desc(orders.id)).limit(10).all();

      if (!recentOrders || recentOrders.length === 0) {
        await api.sendMessage({
          chat_id: chatId,
          text: `📋 <b>Hozircha buyurtmalar bazasi bo'sh.</b>\n\nSaytda yangi buyurtma qoldirilganda, barcha ma'lumotlar avtomatik shu yerda aks etadi va sizga bildirishnoma keladi!`,
          parse_mode: 'HTML',
          reply_markup: ownerKeyboard,
        });
        return;
      }

      let msg = `📋 <b>Oxirgi tushgan arizalar (${recentOrders.length} ta):</b>\n\n`;
      recentOrders.forEach((o, idx) => {
        const badge = o.status === 'bajarildi' ? '✅ Bajarildi' :
                      o.status === 'qabul_qilindi' ? '⏳ Bajarilmoqda' :
                      o.status === 'bekor_qilindi' ? '❌ Bekor qilingan' : '🆕 Yangi';

        msg += `<b>${idx + 1}. Buyurtma #${o.bookingId || o.id}</b> [${badge}]\n`;
        msg += `👤 Mijoz: <b>${o.clientName || 'Noma\'lum'}</b>\n`;
        msg += `📞 Tel: <code>${o.clientPhone || '—'}</code>\n`;
        msg += `📍 Hudud: ${o.district || 'Toshkent'}\n`;
        msg += `🛠 Xizmat: ${o.category || 'Maishiy xizmat'}\n`;
        msg += `📝 Tavsif: <i>"${o.description || '—'}"</i>\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;
      });

      await api.sendMessage({
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
        reply_markup: ownerKeyboard,
      });
    } catch (e) {
      console.error('Error fetching orders:', e);
      await api.sendMessage({ chat_id: chatId, text: 'Buyurtmalarni olishda xatolik yuz berdi.' });
    }
    return;
  }

  // '📊 Tizim statistikasi' or /statistika
  if (text === '📊 Tizim statistikasi' || text === '/statistika') {
    try {
      const totalOrdersCount = await db.$count(orders);
      const totalOwnersCount = await db.$count(owners);

      const statsText = 
        `📊 <b>Xizmatchi platformasi statistikasi:</b>\n\n` +
        `📦 <b>Jami tushgan buyurtmalar:</b> ${totalOrdersCount} ta\n` +
        `👑 <b>Ulangan boshqaruvchilar:</b> ${totalOwnersCount} nafar\n` +
        `🤖 <b>Bot:</b> @xizmatchiuz_Uzbekistan_ownerbot\n` +
        `🌐 <b>Jonli platforma:</b> https://xizmatchi.vercel.app\n` +
        `⏱️ <b>Server holati:</b> 🟢 24/7 Faol (tgcloud serverless)`;

      await api.sendMessage({
        chat_id: chatId,
        text: statsText,
        parse_mode: 'HTML',
        reply_markup: ownerKeyboard,
      });
    } catch (e) {
      console.error('Error fetching stats:', e);
      await api.sendMessage({ chat_id: chatId, text: 'Statistikani olishda xatolik yuz berdi.' });
    }
    return;
  }

  // '🌐 Xizmatchi saytini ochish'
  if (text === '🌐 Xizmatchi saytini ochish' || text === '/sayt') {
    await api.sendMessage({
      chat_id: chatId,
      text: `🌐 <b>Xizmatchi — O'zbekiston bo'yicha usta va maishiy xizmatlar portali:</b>\n\nSaytga o'tish uchun quyidagi tugmani bosing:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Saytni ochish (xizmatchi.vercel.app)', url: 'https://xizmatchi.vercel.app' }],
        ],
      },
    });
    return;
  }

  // 'ℹ️ Yordam & Ma\'lumot'
  if (text === 'ℹ️ Yordam & Ma\'lumot' || text === '/yordam') {
    const helpMsg = 
      `ℹ️ <b>Boshqaruvchi boti haqida ma'lumot:</b>\n\n` +
      `Ushbu bot faqat platforma rahbari va moderatorlari uchun maxsus tayyorlangan.\n\n` +
      `• Mijozlar saytdan ro'yxatdan o'tganda yoki usta chaqirganda, barcha arizalar zudlik bilan sizga yetkaziladi.\n` +
      `• Arizadagi mijoz telefon raqami ustiga bosib darhol qo'ng'iroq qilishingiz mumkin.\n` +
      `• Arizani "Qabul qilish" yoki "Bekor qilish" orqali statusini o'zgartirishingiz mumkin.`;

    await api.sendMessage({
      chat_id: chatId,
      text: helpMsg,
      parse_mode: 'HTML',
      reply_markup: ownerKeyboard,
    });
    return;
  }

  // Default fallback
  await api.sendMessage({
    chat_id: chatId,
    text: `Hurmatli administrator, buyruqni tanlash uchun pastdagi menyudan foydalaning:`,
    reply_markup: ownerKeyboard,
  });
}
