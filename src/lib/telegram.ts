import { BookingRequest } from '../types';

// Public bot usernames for external links and UI (safe to expose)
export const TELEGRAM_OWNER_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_ownerbot';
export const TELEGRAM_CLIENT_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_bot';
export const TELEGRAM_PUBLIC_BOT_USERNAME = TELEGRAM_CLIENT_BOT_USERNAME;
export const TELEGRAM_BOT_USERNAME = TELEGRAM_CLIENT_BOT_USERNAME;

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
🌐 <b>Platforma:</b> <a href="https://xizmatchi.vercel.app">Xizmatchi — O'zbekiston</a>`;
}

/**
 * Sends booking securely through internal server API route (/api/telegram).
 * Note: Bot tokens are strictly kept on the server and never leaked to the client browser.
 */
export async function sendBookingToTelegram(booking: BookingRequest): Promise<TelegramSendResult> {
  try {
    const text = formatBookingTelegramMessage(booking);

    // Call secure internal Next.js API route to send and broadcast
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
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Server xatosi: ${res.status}`);
    }

    const data = await res.json();
    return {
      success: data.success ?? true,
      deliveredCount: data.deliveredCount ?? 0,
      message: data.message || 'Buyurtma qabul qilindi va administratorga yuborildi.',
    };
  } catch (error: unknown) {
    console.error('Telegramga yuborishda xatolik:', error);
    const err = error as { message?: string };
    return {
      success: false,
      message: err?.message || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
    };
  }
}

