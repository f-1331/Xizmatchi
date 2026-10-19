import { api, db } from 'sdk';
import { owners, orders } from '../schema.js';

export default async function (input, ctx) {
  const { booking, text, replyMarkup } = input || {};

  let savedOrder = null;
  if (booking) {
    try {
      savedOrder = await db.insert(orders).values({
        bookingId: String(booking.id || Date.now()),
        clientName: String(booking.clientName || "Noma'lum"),
        clientPhone: String(booking.clientPhone || '—'),
        district: String(booking.district || 'Toshkent'),
        address: String(booking.address || '—'),
        category: String(booking.categoryId || 'santexnika'),
        description: String(booking.description || ''),
        status: 'yangi',
        createdAt: new Date().toISOString(),
      }).returning().get();
    } catch (e) {
      console.error('Error saving order to db:', e);
    }
  }

  // Find all owners
  let allOwners = [];
  try {
    allOwners = await db.select().from(owners).all();
  } catch (e) {
    console.error('Error fetching owners:', e);
  }

  // Ensure primary owner 6707839718 is always notified
  const ownerIds = new Set(allOwners.map((o) => o.tgId));
  ownerIds.add(6707839718);

  let deliveredCount = 0;
  if (text) {
    for (const chatId of ownerIds) {
      try {
        await api.sendMessage({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        });
        deliveredCount++;
      } catch (err) {
        console.error(`Failed to send order to ${chatId}:`, err);
      }
    }
  }

  return { success: true, deliveredCount, ownersCount: ownerIds.size, savedOrder };
}
