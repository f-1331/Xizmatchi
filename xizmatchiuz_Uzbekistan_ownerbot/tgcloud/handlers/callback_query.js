// handlers/callback_query.js — handles inline button clicks in the Owner bot
import { api, db } from 'sdk';
import { eq, desc } from 'sdk/db';
import { orders } from '../schema.js';

export default async function (cb, ctx) {
  const data = cb.data || '';
  const message = cb.message;
  const chatId = message?.chat?.id;
  const messageId = message?.message_id;

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
      let query = db.select().from(orders).orderBy(desc(orders.id)).limit(15);
      const allOrders = await query.all();

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

  await api.answerCallbackQuery({ callback_query_id: cb.id });
}
