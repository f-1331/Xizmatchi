// tgcloud/handlers/callback_query.js
import { api } from 'sdk';
import { DISTRICTS, CATEGORIES, SPECIALISTS } from '../lib/data.js';

export default async function (callbackQuery, ctx) {
  const data = callbackQuery.data || '';
  const chatId = callbackQuery.message?.chat?.id;

  // Answer callback query so Telegram stops loading spinner
  try {
    await api.answerCallbackQuery({
      callback_query_id: callbackQuery.id,
    });
  } catch (e) {
    console.error('Error answering callback query:', e);
  }

  if (!chatId) return;

  // Handle District Selection: district:<id>
  if (data.startsWith('district:')) {
    const distId = data.replace('district:', '');
    const districtObj = DISTRICTS.find(d => d.id === distId);
    const distName = districtObj ? districtObj.name : 'Tanlangan tuman';

    const shortName = distName.replace(' tumani', '');
    const matchedSpecs = SPECIALISTS.filter(s => 
      s.district.toLowerCase().includes(shortName.toLowerCase())
    );

    let text = `📍 <b>${distName} hududidagi ustalar:</b>\n\n`;

    if (matchedSpecs.length === 0) {
      text += `Ushbu tumanda hozirda barcha mutaxassislarimiz navbatchilikda va Toshkentning barcha tumanlariga 30 daqiqa ichida yetib borishadi.\n\n`;
      text += `Tavsiya etiladigan ustalar:\n`;
      for (const s of SPECIALISTS.slice(0, 3)) {
        text += `\n👤 <b>${s.name}</b> (${s.rating} ⭐)\n`;
        text += `🔧 ${s.profession}\n`;
        text += `💰 Narx: ${s.price}\n`;
        text += `📞 <code>${s.phone}</code>\n`;
      }
    } else {
      for (const s of matchedSpecs) {
        text += `👤 <b>${s.name}</b> (${s.rating} ⭐)\n`;
        text += `🔧 ${s.profession}\n`;
        text += `💰 Narx: ${s.price}\n`;
        text += `📞 <code>${s.phone}</code>\n`;
        if (s.telegram) text += `✈️ Telegram: ${s.telegram}\n`;
        text += `─────────────────\n`;
      }
    }

    text += `\n<i>Bog'lanish uchun telefon raqam ustiga bosib nusxa olishingiz yoki to'g'ridan-to'g'ri qo'ng'iroq qilishingiz mumkin.</i>`;

    await api.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });
    return;
  }

  // Handle Category Selection: category:<id>
  if (data.startsWith('category:')) {
    const catId = data.replace('category:', '');
    const catObj = CATEGORIES.find(c => c.id === catId);
    const catName = catObj ? catObj.name : 'Xizmat turi';

    let text = `🛠 <b>${catName} xizmati bo'yicha:</b>\n\n`;
    text += `Ushbu sohada 20 dan ortiq sertifikatlangan ustalarimiz faoliyat yuritadi.\n\n`;
    text += `<b>Kafolatlar:</b>\n`;
    text += `✅ Barcha ishlarga 6 oygacha rasmiy kafolat\n`;
    text += `✅ Belgilangan aniq smeta va ortiqcha xarajatlarsiz\n`;
    text += `✅ 30 daqiqada tezkor yetib borish\n\n`;
    text += `Bir zumda mutaxassis topish uchun bosh menyudan "🔍 Ustalar ro'yxati" yoki "📍 Tumanlar bo'yicha" bo'limiga kiring.`;

    await api.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });
    return;
  }

  // Handle view_districts
  if (data === 'view_districts') {
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
      text: `🏙 <b>Kerakli tumanni tanlang:</b>`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard },
    });
    return;
  }

  // Handle view_categories
  if (data === 'view_categories') {
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
      text: `🛠 <b>Kerakli xizmat toifasini tanlang:</b>`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard },
    });
    return;
  }
}
