// handlers/callback_query.js — handles inline button clicks in the Owner bot
import { api, db } from 'sdk';
import { eq, desc } from 'sdk/db';
import { owners, admins, orders } from '../schema.js';

const SUPERADMIN_ID = 6707839718;
const SUPERADMIN_USERNAME = 'fayzbek1331';

function isSuperadmin(chatId, username = '') {
  const clean = (username || '').replace(/^@/, '').toLowerCase();
  return clean === SUPERADMIN_USERNAME || Number(chatId) === SUPERADMIN_ID;
}

export default async function (cb, ctx) {
  const data = cb.data || '';
  const message = cb.message;
  const chatId = message?.chat?.id;
  const messageId = message?.message_id;
  const fromUser = cb.from;
  const userHandle = (fromUser?.username || '').replace(/^@/, '').toLowerCase();

  // 1. Order Status: Accept
  if (data.startsWith('accept_')) {
    const orderId = data.replace('accept_', '');

    try {
      await db.update(orders)
        .set({ status: 'qabul_qilindi' })
        .where(eq(orders.bookingId, orderId))
        .run();
    } catch (e) {
      console.error('Error updating order status:', e);
    }

    await api.answerCallbackQuery({
      callback_query_id: cb.id,
      text: `✅ Buyurtma #${orderId} muvaffaqiyatli qabul qilindi!`,
      show_alert: true,
    });

    if (chatId && messageId) {
      try {
        const currentText = message.text || '';
        await api.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text: `${currentText}\n\n━━━━━━━━━━━━━━━━━━\n🟢 <b>HOLAT: QABUL QILINDI (Jarayonda)</b>\n<i>Ushbu buyurtma admin tomonidan qabul qilindi.</i>`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Bajarildi deb belgilash', callback_data: `done_${orderId}` },
                { text: '❌ Bekor qilish', callback_data: `reject_${orderId}` },
              ],
            ],
          },
        });
      } catch (e) {}
    }
    return;
  }

  // 2. Order Status: Reject
  if (data.startsWith('reject_')) {
    const orderId = data.replace('reject_', '');

    try {
      await db.update(orders)
        .set({ status: 'bekor_qilindi' })
        .where(eq(orders.bookingId, orderId))
        .run();
    } catch (e) {
      console.error('Error updating order status:', e);
    }

    await api.answerCallbackQuery({
      callback_query_id: cb.id,
      text: `❌ Buyurtma #${orderId} bekor qilindi.`,
      show_alert: true,
    });

    if (chatId && messageId) {
      try {
        const currentText = message.text || '';
        await api.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text: `${currentText}\n\n━━━━━━━━━━━━━━━━━━\n🔴 <b>HOLAT: BEKOR QILINDI</b>\n<i>Ushbu buyurtma rad etildi.</i>`,
          parse_mode: 'HTML',
        });
      } catch (e) {}
    }
    return;
  }

  // 3. Order Status: Done
  if (data.startsWith('done_')) {
    const orderId = data.replace('done_', '');

    try {
      await db.update(orders)
        .set({ status: 'bajarildi' })
        .where(eq(orders.bookingId, orderId))
        .run();
    } catch (e) {}

    await api.answerCallbackQuery({
      callback_query_id: cb.id,
      text: `🎉 Buyurtma #${orderId} to'liq bajarildi deb belgilandi!`,
      show_alert: true,
    });

    if (chatId && messageId) {
      try {
        const currentText = message.text || '';
        await api.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text: `${currentText}\n\n━━━━━━━━━━━━━━━━━━\n✅ <b>HOLAT: TO'LIQ BAJARILDI</b>\n<i>Xizmat muvaffaqiyatli yakunlandi.</i>`,
          parse_mode: 'HTML',
        });
      } catch (e) {}
    }
    return;
  }

  // 4. Test Notification Trigger
  if (data === 'test_notification') {
    await api.answerCallbackQuery({
      callback_query_id: cb.id,
      text: '🔔 Sinov xabari yuborilmoqda...',
    });

    const testTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const testText = 
      `🔔 <b>SINOV BILDIRISHNOMASI</b>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⚡ <b>Holat:</b> Tizim 100% soz va tayyor!\n` +
      `🆔 <b>Admin ID:</b> <code>${chatId}</code>\n` +
      `⏰ <b>Vaqt:</b> ${testTime}\n` +
      `🌐 <b>Platforma:</b> https://xizmatchi.vercel.app\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `<i>Mijozlar buyurtma berganda ayni shu formatda darhol xabar olasiz!</i>`;

    await api.sendMessage({
      chat_id: chatId,
      text: testText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Saytni ochish', url: 'https://xizmatchi.vercel.app' }],
        ],
      },
    });
    return;
  }

  // 5. Orders Filter
  if (data.startsWith('filter_orders_')) {
    const filterType = data.replace('filter_orders_', '');
    await api.answerCallbackQuery({
      callback_query_id: cb.id,
      text: 'Filtrlanyapti...',
    });

    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.id)).limit(15).all();

      let filtered = allOrders;
      let filterTitle = 'Barcha buyurtmalar';

      if (filterType === 'yangi') {
        filtered = allOrders.filter(o => o.status === 'yangi' || !o.status);
        filterTitle = 'Yangi buyurtmalar';
      } else if (filterType === 'jarayonda') {
        filtered = allOrders.filter(o => o.status === 'qabul_qilindi');
        filterTitle = 'Jarayondagi buyurtmalar';
      } else if (filterType === 'bajarildi') {
        filtered = allOrders.filter(o => o.status === 'bajarildi');
        filterTitle = 'Bajarilgan buyurtmalar';
      }

      if (filtered.length === 0) {
        let emptyMsg = `📂 <b>${filterTitle}:</b>\n\nUshbu toifada hozircha buyurtmalar mavjud emas.`;
        await api.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text: emptyMsg,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🆕 Yangi', callback_data: 'filter_orders_yangi' },
                { text: '⏳ Jarayonda', callback_data: 'filter_orders_jarayonda' },
              ],
              [
                { text: '✅ Bajarildi', callback_data: 'filter_orders_bajarildi' },
                { text: '📋 Barchasi', callback_data: 'filter_orders_all' },
              ],
            ],
          },
        });
        return;
      }

      let msg = `📂 <b>${filterTitle} (${filtered.length} ta):</b>\n\n`;
      filtered.forEach((o, idx) => {
        const badge = o.status === 'bajarildi' ? '✅ Bajarildi' :
                      o.status === 'qabul_qilindi' ? '⏳ Jarayonda' :
                      o.status === 'bekor_qilindi' ? '❌ Bekor qilingan' : '🆕 Yangi';

        msg += `<b>${idx + 1}. Buyurtma #${o.bookingId || o.id}</b> [${badge}]\n`;
        msg += `👤 <b>${o.clientName || 'Noma\'lum'}</b> • 📞 <code>${o.clientPhone || '—'}</code>\n`;
        msg += `📍 ${o.district || 'Toshkent'} ${o.address ? `• 🏠 ${o.address}` : ''}\n`;
        msg += `🛠 ${o.category || 'Xizmat'}: <i>"${o.description || '—'}"</i>\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;
      });

      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: msg,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🆕 Yangi', callback_data: 'filter_orders_yangi' },
              { text: '⏳ Jarayonda', callback_data: 'filter_orders_jarayonda' },
            ],
            [
              { text: '✅ Bajarildi', callback_data: 'filter_orders_bajarildi' },
              { text: '📋 Barchasi', callback_data: 'filter_orders_all' },
            ],
          ],
        },
      });
    } catch (e) {
      console.error('Filter error:', e);
    }
    return;
  }

  // 6. Admin Panel Callbacks (Superadmin only)
  if (data === 'admin_list' || data === 'admin_refresh') {
    if (!isSuperadmin(chatId, userHandle)) {
      await api.answerCallbackQuery({ callback_query_id: cb.id, text: "Faqat Bosh Egasi uchun!", show_alert: true });
      return;
    }
    await api.answerCallbackQuery({ callback_query_id: cb.id, text: "Adminlar ro'yxati yangilandi" });

    try {
      const allAdmins = await db.select().from(admins).all();
      let text = `📋 <b>Xizmatchi — Rasmiy Adminlar Ro'yxati:</b>\n`;
      text += `━━━━━━━━━━━━━━━━━━\n`;
      text += `👑 <b>Bosh Egasi:</b> Fayzbek (@${SUPERADMIN_USERNAME}) — <code>${SUPERADMIN_ID}</code>\n\n`;

      const buttons = [];

      if (allAdmins.length === 0) {
        text += `<i>Hozircha qo'shimcha adminlar yo'q. Faqat sizga xabarlar keladi.</i>\n\n`;
      } else {
        allAdmins.forEach((a, idx) => {
          const userStr = a.username ? `@${a.username}` : (a.name || `Admin #${a.id}`);
          const idStr = a.tgId ? `<code>${a.tgId}</code>` : '<i>(hali /start bosmagan)</i>';
          text += `<b>${idx + 1}. ${userStr}</b>\n🆔 ID: ${idStr}\n\n`;

          const targetDel = a.tgId || a.username || String(a.id);
          buttons.push([{ text: `❌ ${userStr} ni o'chirish`, callback_data: `del_admin:${targetDel}` }]);
        });
      }

      buttons.push([
        { text: "➕ Admin qo'shish", callback_data: "admin_add_prompt" },
        { text: "🔄 Yangilash", callback_data: "admin_refresh" },
      ]);

      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
    } catch (e) {
      console.error('Error listing admins:', e);
    }
    return;
  }

  if (data === 'admin_add_prompt') {
    if (!isSuperadmin(chatId, userHandle)) {
      await api.answerCallbackQuery({ callback_query_id: cb.id, text: "Faqat Bosh Egasi uchun!", show_alert: true });
      return;
    }
    await api.answerCallbackQuery({ callback_query_id: cb.id });

    const promptText = 
      `➕ <b>Yangi admin qo'shish yo'riqnomasi:</b>\n\n` +
      `Admin qo'shish uchun botga quyidagi formatda buyruq yuboring:\n\n` +
      `1️⃣ <b>Username orqali:</b>\n<code>/addadmin @sherik_admin</code>\n\n` +
      `2️⃣ <b>Telegram ID orqali:</b>\n<code>/addadmin 123456789</code>\n\n` +
      `<i>Admin qo'shilgach, saytdan keladigan barcha yangi buyurtmalar unga ham yetib boradi!</i>`;

    await api.sendMessage({
      chat_id: chatId,
      text: promptText,
      parse_mode: 'HTML',
    });
    return;
  }

  if (data.startsWith('del_admin:')) {
    if (!isSuperadmin(chatId, userHandle)) {
      await api.answerCallbackQuery({ callback_query_id: cb.id, text: "Faqat Bosh Egasi uchun!", show_alert: true });
      return;
    }

    const target = data.replace('del_admin:', '').trim();
    if (target === String(SUPERADMIN_ID) || target.toLowerCase() === SUPERADMIN_USERNAME) {
      await api.answerCallbackQuery({ callback_query_id: cb.id, text: "Bosh Egasini o'chirish mumkin emas!", show_alert: true });
      return;
    }

    try {
      const num = Number(target);
      if (!isNaN(num) && num > 0) {
        await db.delete(admins).where(eq(admins.tgId, num)).run();
      } else {
        await db.delete(admins).where(eq(admins.username, target.replace(/^@/, ''))).run();
      }

      await api.answerCallbackQuery({
        callback_query_id: cb.id,
        text: `Admin (${target}) muvaffaqiyatli chiqarildi!`,
        show_alert: true,
      });

      // Refresh list
      const allAdmins = await db.select().from(admins).all();
      let text = `📋 <b>Xizmatchi — Rasmiy Adminlar Ro'yxati:</b>\n`;
      text += `━━━━━━━━━━━━━━━━━━\n`;
      text += `👑 <b>Bosh Egasi:</b> Fayzbek (@${SUPERADMIN_USERNAME}) — <code>${SUPERADMIN_ID}</code>\n\n`;

      const buttons = [];
      if (allAdmins.length === 0) {
        text += `<i>Hozircha qo'shimcha adminlar yo'q. Faqat sizga xabarlar keladi.</i>\n\n`;
      } else {
        allAdmins.forEach((a, idx) => {
          const userStr = a.username ? `@${a.username}` : (a.name || `Admin #${a.id}`);
          const idStr = a.tgId ? `<code>${a.tgId}</code>` : '<i>(hali /start bosmagan)</i>';
          text += `<b>${idx + 1}. ${userStr}</b>\n🆔 ID: ${idStr}\n\n`;

          const targetDel = a.tgId || a.username || String(a.id);
          buttons.push([{ text: `❌ ${userStr} ni o'chirish`, callback_data: `del_admin:${targetDel}` }]);
        });
      }

      buttons.push([
        { text: "➕ Admin qo'shish", callback_data: "admin_add_prompt" },
        { text: "🔄 Yangilash", callback_data: "admin_refresh" },
      ]);

      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
    } catch (e) {
      console.error('Error deleting admin:', e);
    }
    return;
  }

  // 7. View Order Photo
  if (data.startsWith('view_photo_')) {
    const orderId = data.replace('view_photo_', '').trim();
    await api.answerCallbackQuery({ callback_query_id: cb.id, text: "Rasm yuklanmoqda..." });

    try {
      const allOrders = await db.select().from(orders).where(eq(orders.bookingId, orderId)).all();
      const order = allOrders[0];
      if (order?.photoUrl) {
        await api.sendPhoto({
          chat_id: chatId,
          photo: order.photoUrl,
          caption: `📸 <b>Buyurtma #${order.bookingId || order.id} rasmi</b>\n👤 Mijoz: ${order.clientName}\n📞 Tel: ${order.clientPhone}`,
          parse_mode: 'HTML',
        });
      } else {
        await api.sendMessage({
          chat_id: chatId,
          text: `ℹ️ Ushbu buyurtma (#${orderId}) uchun rasm ilova qilinmagan.`,
        });
      }
    } catch (e) {
      console.error('Error viewing photo:', e);
    }
    return;
  }

  await api.answerCallbackQuery({ callback_query_id: cb.id });
}
