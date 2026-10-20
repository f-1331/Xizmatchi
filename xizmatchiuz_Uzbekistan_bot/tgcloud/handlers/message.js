// tgcloud/handlers/message.js
import { api, db } from 'sdk';
import { eq, desc } from 'sdk/db';
import { users, orders } from '../schema.js';
import { DISTRICTS, CATEGORIES, SPECIALISTS } from '../lib/data.js';

export default async function (message, ctx) {
  const chatId = message.chat.id;
  const fromUser = message.from;
  const text = (message.text || '').trim();

  // Main menu keyboard
  const mainKeyboard = {
    keyboard: [
      [{ text: '👤 Mening profilim' }, { text: '📱 Telefon raqamni ulash' }],
      [{ text: '🔍 Ustalar ro\'yxati' }, { text: '📍 Tumanlar bo\'yicha' }],
      [{ text: '📋 Xizmat turlari' }, { text: '📦 Mening buyurtmalarim' }],
      [{ text: '👷‍♂️ Usta bo\'lish' }, { text: '🌐 Veb-sayt (Xizmatchi)' }],
      [{ text: '📞 Bog\'lanish & Yordam' }],
    ],
    resize_keyboard: true,
  };

  // 1. Handle contact sharing (Registration / Phone linking)
  if (message.contact) {
    const rawPhone = message.contact.phone_number;
    const normPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;

    try {
      const fullName = [fromUser?.first_name, fromUser?.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi';
      const tgUsername = fromUser?.username ? `@${fromUser.username}` : null;

      await db.insert(users).values({
        tgId: fromUser.id,
        name: fullName,
        username: tgUsername,
        phone: normPhone,
      }).onConflictDoUpdate({
        target: users.tgId,
        set: {
          name: fullName,
          username: tgUsername,
          phone: normPhone,
        },
      }).run();

      await api.sendMessage({
        chat_id: chatId,
        text: `✅ <b>Telefon raqamingiz muvaffaqiyatli bog'landi!</b>\n\n` +
              `📱 Sizning raqamingiz: <code>${normPhone}</code>\n\n` +
              `🌐 <b>Yagona hisob faollashtirildi:</b>\n` +
              `Endi veb-sayt (https://xizmatchi.vercel.app) va botdagi profilingiz bitta hisob sifatida sinxronlandi. Saytda ham ayni shu telefon raqamini kiritganingizda buyurtmalaringiz va usta ma'lumotlaringiz birlashadi!`,
        parse_mode: 'HTML',
        reply_markup: mainKeyboard,
      });
    } catch (e) {
      console.error('Error saving contact:', e);
      await api.sendMessage({
        chat_id: chatId,
        text: '❌ Telefon raqamini saqlashda xatolik yuz berdi. Qaytadan urinib ko\'ring.',
      });
    }
    return;
  }

  // 2. Save or update basic user in DB
  if (fromUser) {
    try {
      const fullName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi';
      const tgUsername = fromUser.username ? `@${fromUser.username}` : null;

      await db.insert(users).values({
        tgId: fromUser.id,
        name: fullName,
        username: tgUsername,
      }).onConflictDoUpdate({
        target: users.tgId,
        set: {
          name: fullName,
          username: tgUsername,
        },
      }).run();
    } catch (e) {
      console.error('Error saving user to DB:', e);
    }
  }

  // /start command
  if (text.startsWith('/start')) {
    const welcomeText = 
      `👋 <b>Assalomu alaykum, Xizmatchi platformasiga xush kelibsiz!</b>\n\n` +
      `🛠 Biz sizga Toshkent shahri va viloyatlardagi eng ishonchli, tajribali ustalarni topishda yordam beramiz.\n\n` +
      `<b>Yangi imkoniyatlar:</b>\n` +
      `• 📱 <b>Yagona hisob:</b> Bot va Sayt bitta telefon raqami orqali bog'lanadi\n` +
      `• 🛡 <b>SMS Verifikatsiya:</b> Soxta arizalar va pranklarning oldi olingan\n` +
      `• ⚡ Santexnik, elektrik, maishiy texnika va barcha usta xizmatlari\n` +
      `• 📍 Tumanlar bo'yicha saralash va filtrlash\n\n` +
      `Profilingizni sayt bilan bog'lash uchun <b>"📱 Telefon raqamni ulash"</b> tugmasini bosing:`;

    await api.sendMessage({
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'HTML',
      reply_markup: mainKeyboard,
    });
    return;
  }

  // '📱 Telefon raqamni ulash' or /telefon
  if (text === '📱 Telefon raqamni ulash' || text === '/telefon') {
    await api.sendMessage({
      chat_id: chatId,
      text: `📱 <b>Telefon raqamingizni bog'lash:</b>\n\n` +
            `Sayt va bot ma'lumotlaringiz bir xil bo'lishi hamda SMS kodlarni to'g'ridan-to'g'ri qabul qilish uchun quyidagi <b>"📲 Raqamimni yuborish"</b> tugmasini bosing:`,
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          [{ text: '📲 Raqamimni yuborish', request_contact: true }],
          [{ text: '⬅️ Asosiy menyu' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return;
  }

  // '👤 Mening profilim' or /profil
  if (text === '👤 Mening profilim' || text === '/profil') {
    if (!fromUser) return;

    try {
      const userRow = await db.select().from(users).where(eq(users.tgId, fromUser.id)).get();

      let profText = `👤 <b>Sizning Xizmatchi profilingiz:</b>\n\n`;
      profText += `Ism: <b>${userRow?.name || [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ')}</b>\n`;

      if (userRow?.phone) {
        profText += `📱 Telefon: <code>${userRow.phone}</code> (✅ SMS Tasdiqlangan)\n`;
        profText += `🌐 Sayt bilan bog'lanish: <b>Yagona hisob faol</b>\n`;
      } else {
        profText += `📱 Telefon: <i>Ulanmagan</i> ⚠️\n`;
        profText += `<i>(Saytdagi va botdagi ma'lumotlaringiz bir xil bo'lishi uchun "📱 Telefon raqamni ulash" tugmasini bosing)</i>\n`;
      }

      profText += `🆔 Telegram ID: <code>${fromUser.id}</code>\n`;
      if (fromUser.username) profText += `✈️ Username: @${fromUser.username}\n`;

      await api.sendMessage({
        chat_id: chatId,
        text: profText,
        parse_mode: 'HTML',
        reply_markup: mainKeyboard,
      });
    } catch (e) {
      console.error('Error fetching profile:', e);
      await api.sendMessage({ chat_id: chatId, text: 'Profilni yuklashda xatolik yuz berdi.' });
    }
    return;
  }

  // '👷‍♂️ Usta bo'lish' or /usta_bolish
  if (text === '👷‍♂️ Usta bo\'lish' || text === '/usta_bolish') {
    const ustaText = 
      `👷‍♂️ <b>Xizmatchi platformasida Usta bo'lish</b>\n\n` +
      `🛡 <b>Anti-Prank va Xavfsizlik nazorati:</b>\n` +
      `Platformamizda yosh bolalar, prank qiluvchilar yoki nojiddiy shaxslar soxta e'lon joylamasligi uchun har bir usta o'z telefon raqamini <b>SMS kod orqali tasdiqlashi shart</b>!\n\n` +
      `<b>Qanday ro'yxatdan o'tiladi?</b>\n` +
      `1. Veb-saytimizga kiring: <b>https://xizmatchi.vercel.app</b>\n` +
      `2. "Usta bo'lish" tugmasini bosing va ma'lumotlaringizni to'ldiring.\n` +
      `3. Telefoningizga 4 xonali SMS kod keladi (agar botga ulangan bo'lsangiz, ushbu botga ham keladi!).\n` +
      `4. Kodni kiritib tasdiqlaysiz va bir zumda rasmiy tasdiqlangan ustalar ro'yxatiga qo'shilasiz!`;

    await api.sendMessage({
      chat_id: chatId,
      text: ustaText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Saytga o\'tish (Usta anketasi)', url: 'https://xizmatchi.vercel.app' }],
        ],
      },
    });
    return;
  }

  // '⬅️ Asosiy menyu'
  if (text === '⬅️ Asosiy menyu') {
    await api.sendMessage({
      chat_id: chatId,
      text: 'Bosh menyudasiz:',
      reply_markup: mainKeyboard,
    });
    return;
  }

  // /ustalar or '🔍 Ustalar ro'yxati'
  if (text === '🔍 Ustalar ro\'yxati' || text === '/ustalar') {
    let msg = `<b>⭐ Saralangan Top Ustalarimiz:</b>\n\n`;

    for (const spec of SPECIALISTS) {
      msg += `👤 <b>${spec.name}</b> (${spec.rating} ⭐)\n`;
      msg += `🔧 Soha: ${spec.profession}\n`;
      msg += `📍 Hudud: ${spec.district}\n`;
      msg += `💰 Boshlang'ich narx: ${spec.price}\n`;
      msg += `📞 Tel: <code>${spec.phone}</code> (✅ SMS Tasdiqlangan)\n`;
      if (spec.telegram) msg += `✈️ Telegram: ${spec.telegram}\n`;
      msg += `─────────────────\n`;
    }

    msg += `\n<i>Batafsil ma'lumot va to'liq portfolio uchun veb-saytimizga tashrif buyuring.</i>`;

    await api.sendMessage({
      chat_id: chatId,
      text: msg,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📍 Tuman tanlash', callback_data: 'view_districts' }],
          [{ text: '📋 Barcha xizmatlar', callback_data: 'view_categories' }],
        ],
      },
    });
    return;
  }

  // /tumanlar or '📍 Tumanlar bo'yicha'
  if (text === '📍 Tumanlar bo\'yicha' || text === '/tumanlar') {
    const inline_keyboard = [];
    let row = [];

    for (let i = 0; i < DISTRICTS.length; i++) {
      const d = DISTRICTS[i];
      row.push({ text: `📍 ${d.name.replace(' tumani', '')}`, callback_data: `district:${d.id}` });
      if (row.length === 2 || i === DISTRICTS.length - 1) {
        inline_keyboard.push(row);
        row = [];
      }
    }

    await api.sendMessage({
      chat_id: chatId,
      text: `🏙 <b>Qaysi tumandan usta qidiryapsiz?</b>\n\nO'zingizga qulay tumanni tanlang va yaqin atrofdagi ustalarni ko'ring:`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard },
    });
    return;
  }

  // /xizmatlar or '📋 Xizmat turlari'
  if (text === '📋 Xizmat turlari' || text === '/xizmatlar') {
    const inline_keyboard = [];
    let row = [];

    for (let i = 0; i < CATEGORIES.length; i++) {
      const c = CATEGORIES[i];
      row.push({ text: `${c.name}`, callback_data: `category:${c.id}` });
      if (row.length === 2 || i === CATEGORIES.length - 1) {
        inline_keyboard.push(row);
        row = [];
      }
    }

    await api.sendMessage({
      chat_id: chatId,
      text: `🛠 <b>Mavjud xizmat toifalari:</b>\n\nKerakli yo'nalishni tanlang:`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard },
    });
    return;
  }

  // /buyurtmalar or '📦 Mening buyurtmalarim'
  if (text === '📦 Mening buyurtmalarim' || text === '/buyurtmalar') {
    if (!fromUser) {
      await api.sendMessage({ chat_id: chatId, text: 'Foydalanuvchi ma\'lumoti topilmadi.' });
      return;
    }

    try {
      const userOrders = await db.select().from(orders)
        .where(eq(orders.userTgId, fromUser.id))
        .orderBy(desc(orders.id))
        .limit(5)
        .all();

      if (!userOrders || userOrders.length === 0) {
        await api.sendMessage({
          chat_id: chatId,
          text: `📦 <b>Sizda hali rasmiylashtirilgan buyurtmalar yo'q.</b>\n\n` +
                `Saytimiz orqali usta chaqirish uchun ariza yuboring va arizangiz holati avtomatik ushbu botga keladi!`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Saytga o\'tish (Usta chaqirish)', url: 'https://xizmatchiuz.netlify.app' }],
            ],
          },
        });
        return;
      }

      let msg = `📋 <b>Sizning so'nggi buyurtmalaringiz:</b>\n\n`;
      for (const ord of userOrders) {
        const statusBadge = ord.status === 'bajarildi' ? '✅ Bajarildi' :
                            ord.status === 'jarayonda' ? '⏳ Jarayonda' : '🆕 Yangi qabul qilindi';

        msg += `🔹 <b>Buyurtma #${ord.id}</b>\n`;
        msg += `🏷 Xizmat: ${ord.category}\n`;
        msg += `📍 Tuman: ${ord.district}\n`;
        msg += `📝 Tavsif: ${ord.description}\n`;
        msg += `📊 Holati: <b>${statusBadge}</b>\n`;
        msg += `─────────────────\n`;
      }

      await api.sendMessage({
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
      });
    } catch (e) {
      console.error('Error fetching orders:', e);
      await api.sendMessage({
        chat_id: chatId,
        text: '❌ Buyurtmalarni yuklashda xatolik yuz berdi. Iltimos keyinroq qayta urining.',
      });
    }
    return;
  }

  // /yordam or '📞 Bog'lanish & Yordam'
  if (text === '📞 Bog\'lanish & Yordam' || text === '/yordam') {
    const helpText = 
      `📞 <b>Mijozlarni qo'llab-quvvatlash xizmati</b>\n\n` +
      `Savollaringiz, takliflaringiz yoki ustalar bilan bog'liq masalalarda biz bilan bog'lanishingiz mumkin:\n\n` +
      `☎️ <b>Telefon:</b> +998 71 200 00 00\n` +
      `📱 <b>Telegram aloqa:</b> @xizmatchi_support\n` +
      `⏰ <b>Ish vaqti:</b> 24/7 uzluksiz\n` +
      `🌐 <b>Rasmiy platforma:</b> https://xizmatchi.vercel.app\n\n` +
      `<i>Xizmatchi — sifatli xizmat, adolatli narx va kafolatlangan natija!</i>`;

    await api.sendMessage({
      chat_id: chatId,
      text: helpText,
      parse_mode: 'HTML',
    });
    return;
  }

  // '🌐 Veb-sayt (Xizmatchi)'
  if (text === '🌐 Veb-sayt (Xizmatchi)' || text === '/sayt') {
    await api.sendMessage({
      chat_id: chatId,
      text: `🌐 <b>Xizmatchi zamonaviy veb-platformasi</b>\n\n` +
            `Sayt orqali ustalarning portfoliolarini ko'rishingiz, filtrlar orqali saralashingiz, narxlarni solishtirishingiz va bir zumda usta chaqirishingiz mumkin:\n\n` +
            `👉 https://xizmatchi.vercel.app`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Saytni ochish', url: 'https://xizmatchi.vercel.app' }],
        ],
      },
    });
    return;
  }

  // Check if text matches a district name directly
  const matchedDistrict = DISTRICTS.find(d => 
    d.name.toLowerCase().includes(text.toLowerCase()) || 
    text.toLowerCase().includes(d.id.toLowerCase())
  );

  if (matchedDistrict) {
    const specs = SPECIALISTS.filter(s => 
      s.district.toLowerCase().includes(matchedDistrict.name.toLowerCase().replace(' tumani', ''))
    );

    let msg = `📍 <b>${matchedDistrict.name} bo'yicha ustalar:</b>\n\n`;
    if (specs.length === 0) {
      msg += `Ushbu tumanda hozirda navbatchi ustalarimiz bor. Qisqa vaqt ichida boshqa ustalar ham yetib borishi mumkin.\n`;
      msg += `Umumiy ro'yxatdan usta tanlashingiz mumkin:`;
    } else {
      for (const s of specs) {
        msg += `👤 <b>${s.name}</b> (${s.rating} ⭐)\n`;
        msg += `🔧 ${s.profession}\n`;
        msg += `💰 ${s.price}\n`;
        msg += `📞 <code>${s.phone}</code>\n\n`;
      }
    }

    await api.sendMessage({
      chat_id: chatId,
      text: msg,
      parse_mode: 'HTML',
    });
    return;
  }

  // Fallback default message
  await api.sendMessage({
    chat_id: chatId,
    text: `Tushunmadim, iltimos menyudagi bo'limlardan birini tanlang yoki /start buyrug'ini bosing.`,
    reply_markup: mainKeyboard,
  });
}
