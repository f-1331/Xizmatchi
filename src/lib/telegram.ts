import { BookingRequest } from '../types';

export const TELEGRAM_BOT_TOKEN = '8977412958:AAH_xkRQQe6k49_JVxRvmuv6-vtl0Du5ao4';
export const TELEGRAM_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_bot';

export interface TelegramSendResult {
  success: boolean;
  message?: string;
  deliveredCount?: number;
}

export function formatBookingTelegramMessage(booking: BookingRequest): string {
  const urgencyLabel =
    booking.urgency === 'urgent'
      ? '🔥 Shoshilinch (~1 soat ichida)'
      : booking.urgency === 'today'
      ? '⏱️ Bugun kun davomida'
      : '📅 Rejali (belgilangan vaqtda)';

  return `🔔 <b>YANGI BUYURTMA QABUL QILINDI!</b>
━━━━━━━━━━━━━━━━━━
🆔 <b>Buyurtma ID:</b> <code>#${booking.id}</code>
👤 <b>Mijoz:</b> ${booking.clientName}
📞 <b>Telefon:</b> <a href="tel:${booking.clientPhone.replace(/\s+/g, '')}">${booking.clientPhone}</a>
📍 <b>Tuman:</b> ${booking.district}
🏠 <b>Aniq manzil:</b> ${booking.address}
🛠️ <b>Xizmat:</b> ${booking.specialistName ? `Usta: ${booking.specialistName}` : `Kategoriya: ${booking.categoryId}`}
⚠️ <b>Shoshilinchlik:</b> ${urgencyLabel}
🗓️ <b>Qulay vaqt:</b> ${booking.preferredDate} (${booking.preferredTime})
⏱️ <b>Kutilayotgan javob:</b> ${booking.estimatedResponseTime}

📝 <b>Muammo tavsifi:</b>
<i>"${booking.description}"</i>
${booking.photoUrl ? `\n📸 <b>Rasm ilova qilingan</b>` : ''}
━━━━━━━━━━━━━━━━━━
🌐 <b>Platforma:</b> <a href="https://xizmatchiuz.netlify.app">Xizmatchi — O'zbekiston</a>
🤖 <b>Bot:</b> @${TELEGRAM_BOT_USERNAME}`;
}

export async function sendBookingToTelegram(booking: BookingRequest): Promise<TelegramSendResult> {
  try {
    const text = formatBookingTelegramMessage(booking);

    // Call internal Next.js API route to send and broadcast
    const res = await fetch('/api/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        booking,
        text,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP xatosi: ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      deliveredCount: data.deliveredCount || 0,
      message: data.message || "Xabar yuborildi",
    };
  } catch (error: any) {
    console.error('Telegramga yuborishda xatolik:', error);
    return {
      success: false,
      message: error?.message || "Xatolik yuz berdi",
    };
  }
}
