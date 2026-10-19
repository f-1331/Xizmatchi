// handlers/callback_query.js — handles inline button clicks in the Owner bot
import { api, db } from 'sdk';
import { eq } from 'sdk/db';
import { orders } from '../schema.js';

export default async function (cb, ctx) {
  const data = cb.data || '';
  const message = cb.message;
  const chatId = message?.chat?.id;
  const messageId = message?.message_id;

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
          text: `${currentText}\n\n━━━━━━━━━━━━━━━━━━\n🟢 <b>HOLAT: QABUL QILINDI (Bajarilmoqda)</b>\n<i>Ushbu buyurtma admin tomonidan qabul qilindi.</i>`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Bajarildi deb belgilash", callback_data: `done_${orderId}` }],
            ],
          },
        });
      } catch (e) {
        // Edit error if text unchanged
      }
    }
    return;
  }

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

  await api.answerCallbackQuery({ callback_query_id: cb.id });
}
