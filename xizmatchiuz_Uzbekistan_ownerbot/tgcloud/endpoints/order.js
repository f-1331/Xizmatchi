import { api, db } from 'sdk';
import { owners, admins, orders } from '../schema.js';

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
        photoUrl: booking.photoUrl || null,
        createdAt: new Date().toISOString(),
      }).returning().get();
    } catch (e) {
      console.error('Error saving order to db:', e);
    }
  }

  // Find all owners & admins
  const recipientIds = new Set([6707839718]); // Superadmin Fayzbek

  try {
    const allOwners = await db.select().from(owners).all();
    allOwners.forEach(o => { if (o.tgId) recipientIds.add(Number(o.tgId)); });
  } catch (e) {
    console.error('Error fetching owners:', e);
  }

  try {
    const allAdmins = await db.select().from(admins).all();
    allAdmins.forEach(a => { if (a.tgId) recipientIds.add(Number(a.tgId)); });
  } catch (e) {
    console.error('Error fetching admins:', e);
  }

  let deliveredCount = 0;
  if (text) {
    for (const chatId of recipientIds) {
      let sent = false;
      if (booking?.photoUrl) {
        try {
          await api.sendPhoto({
            chat_id: chatId,
            photo: booking.photoUrl,
            caption: text.slice(0, 1024),
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          });
          sent = true;
          deliveredCount++;
        } catch (photoErr) {
          console.error(`sendPhoto in endpoint failed for ${chatId}:`, photoErr?.message);
        }
      }

      if (!sent) {
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
  }

  return { success: true, deliveredCount, recipientsCount: recipientIds.size, savedOrder };
}
