import { BookingRequest } from '../types';

export const TELEGRAM_OWNER_BOT_TOKEN = '8668786258:AAGrl0W3txp5b-F_0o6Pj7snrS-f8xCd9CA';
export const TELEGRAM_OWNER_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_ownerbot';

// Client-facing / Public Bot for customers & specialists
export const TELEGRAM_CLIENT_BOT_TOKEN = '8977412958:AAH_xkRQQe6k49_JVxRvmuv6-vtl0Du5ao4';
export const TELEGRAM_CLIENT_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_bot';
export const TELEGRAM_PUBLIC_BOT_USERNAME = TELEGRAM_CLIENT_BOT_USERNAME;

// Default public-facing bot username (NEVER points to private ownerbot)
export const TELEGRAM_BOT_USERNAME = TELEGRAM_CLIENT_BOT_USERNAME;
export const TELEGRAM_BOT_TOKEN = TELEGRAM_OWNER_BOT_TOKEN;

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
    let deliveredCount = data.deliveredCount || 0;

    // Direct fallback if API route delivered 0 to owner
    if (deliveredCount === 0) {
      try {
        let sentDirect = false;
        if (booking.photoUrl) {
          try {
            if (booking.photoUrl.startsWith('data:image/')) {
              const resBlob = await fetch(booking.photoUrl);
              const blob = await resBlob.blob();
              const fd = new FormData();
              fd.append('chat_id', '6707839718');
              fd.append('photo', blob, `order_${booking.id || Date.now()}.jpg`);
              fd.append('caption', text ? text.slice(0, 1024) : `Buyurtma #${booking.id}`);
              fd.append('parse_mode', 'HTML');
              const directPhotoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_OWNER_BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: fd,
              });
              const directPhotoData = await directPhotoRes.json();
              if (directPhotoData.ok) sentDirect = true;
            } else if (booking.photoUrl.startsWith('http')) {
              const directPhotoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_OWNER_BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: 6707839718,
                  photo: booking.photoUrl,
                  caption: text ? text.slice(0, 1024) : `Buyurtma #${booking.id}`,
                  parse_mode: 'HTML',
                }),
              });
              const directPhotoData = await directPhotoRes.json();
              if (directPhotoData.ok) sentDirect = true;
            }
          } catch (pErr) {
            console.error('Direct photo error:', pErr);
          }
        }

        if (!sentDirect) {
          const directRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_OWNER_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: 6707839718,
              text: text,
              parse_mode: 'HTML',
            }),
          });
          const directData = await directRes.json();
          if (directData.ok) sentDirect = true;
        }

        if (sentDirect) {
          deliveredCount++;
        }
      } catch (directErr) {
        console.error('Direct Telegram fallback error:', directErr);
      }
    }

    return {
      success: true,
      deliveredCount,
      message: data.message || "Xabar yuborildi",
    };
  } catch (error: unknown) {
    console.error('Telegramga yuborishda xatolik:', error);
    // Direct emergency delivery directly from browser
    try {
      const emergencyText = formatBookingTelegramMessage(booking);
      let emergencySent = false;

      if (booking.photoUrl) {
        try {
          if (booking.photoUrl.startsWith('data:image/')) {
            const resBlob = await fetch(booking.photoUrl);
            const blob = await resBlob.blob();
            const fd = new FormData();
            fd.append('chat_id', '6707839718');
            fd.append('photo', blob, `order_${booking.id || Date.now()}.jpg`);
            fd.append('caption', emergencyText ? emergencyText.slice(0, 1024) : `Buyurtma #${booking.id}`);
            fd.append('parse_mode', 'HTML');
            const emPhotoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_OWNER_BOT_TOKEN}/sendPhoto`, {
              method: 'POST',
              body: fd,
            });
            const emPhotoData = await emPhotoRes.json();
            if (emPhotoData.ok) emergencySent = true;
          } else if (booking.photoUrl.startsWith('http')) {
            const emPhotoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_OWNER_BOT_TOKEN}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: 6707839718,
                photo: booking.photoUrl,
                caption: emergencyText ? emergencyText.slice(0, 1024) : `Buyurtma #${booking.id}`,
                parse_mode: 'HTML',
              }),
            });
            const emPhotoData = await emPhotoRes.json();
            if (emPhotoData.ok) emergencySent = true;
          }
        } catch {
          // Ignore emergency photo delivery error and fallback to message
        }
      }

      if (!emergencySent) {
        const emergencyRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_OWNER_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 6707839718,
            text: emergencyText,
            parse_mode: 'HTML',
          }),
        });
        const emergencyData = await emergencyRes.json();
        if (emergencyData.ok) emergencySent = true;
      }

      if (emergencySent) {
        return {
          success: true,
          deliveredCount: 1,
          message: "Buyurtma qabul qilindi va administratorga yuborildi.",
        };
      }
    } catch (emergencyErr) {
      console.error('Emergency direct delivery error:', emergencyErr);
    }

    return {
      success: false,
      message: error?.message || "Xatolik yuz berdi",
    };
  }
}
