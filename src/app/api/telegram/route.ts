import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthorizedAdminIds, getAdminsData } from '@/lib/adminStore';

// Primary Owner Bot (Strictly for Owner & Verified Admins - kept secure in environment)
const OWNER_BOT_TOKEN = process.env.TELEGRAM_OWNER_BOT_TOKEN || '';

// Public Client Bot (For normal users)
const CLIENT_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_bot';

const ORDERS_LOG_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_orders.json');

// Helper to log orders sent
function logOrder(orderData: Record<string, unknown>): void {
  try {
    let orders: Record<string, unknown>[] = [];
    if (fs.existsSync(ORDERS_LOG_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_LOG_FILE, 'utf-8')) || [];
    }
    orders.unshift({ ...orderData, sentAt: new Date().toISOString() });
    fs.writeFileSync(ORDERS_LOG_FILE, JSON.stringify(orders.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error logging telegram order:', err);
  }
}

export async function GET() {
  try {
    const adminIds = getAuthorizedAdminIds();
    const adminData = getAdminsData();

    return NextResponse.json({
      status: 'ok',
      publicClientBot: CLIENT_BOT_USERNAME,
      authorizedAdminsCount: adminIds.length,
      admins: adminData.admins.map((a) => ({
        id: a.id,
        name: a.name,
        role: a.role,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { status: 'error', message: err?.message || "Tizim ma'lumotlarini olishda xatolik" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking, text } = body;

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Buyurtma ma\'lumotlari topilmadi' },
        { status: 400 }
      );
    }

    if (!OWNER_BOT_TOKEN) {
      console.error('DIQQAT: TELEGRAM_OWNER_BOT_TOKEN topilmadi! Iltimos .env.local faylini tekshiring.');
      return NextResponse.json(
        { success: false, message: 'Serverda Telegram bot tokeni sozlanmagan' },
        { status: 500 }
      );
    }

    // Only broadcast to verified, authorized admins from telegram_admins.json
    const adminIds = getAuthorizedAdminIds();

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: `✅ Qabul qilish`,
            callback_data: `accept_${booking.id}`,
          },
          {
            text: `❌ Bekor qilish`,
            callback_data: `reject_${booking.id}`,
          },
        ],
        [
          {
            text: `🌐 Xizmatchi saytini ochish`,
            url: `https://xizmatchi.vercel.app`,
          },
        ],
      ],
    };

    let deliveredCount = 0;
    const errors: string[] = [];
    const photoUrl: string | undefined = booking.photoUrl;

    // Send order ONLY to authorized admin IDs via Owner Bot
    for (const chatId of adminIds) {
      try {
        let sentOk = false;

        // 1. Try sending with photo if photoUrl is present
        if (photoUrl) {
          try {
            if (photoUrl.startsWith('data:image/')) {
              const matches = photoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              if (matches) {
                const mimeType = matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                const blob = new Blob([buffer], { type: mimeType });
                const formData = new FormData();
                formData.append('chat_id', String(chatId));
                formData.append('photo', blob, `order_${booking.id || Date.now()}.jpg`);
                formData.append('caption', text ? text.slice(0, 1024) : `Buyurtma #${booking.id}`);
                formData.append('parse_mode', 'HTML');
                formData.append('reply_markup', JSON.stringify(replyMarkup));

                const photoRes = await fetch(`https://api.telegram.org/bot${OWNER_BOT_TOKEN}/sendPhoto`, {
                  method: 'POST',
                  body: formData,
                });
                const photoData = await photoRes.json();
                if (photoData.ok) {
                  sentOk = true;
                } else {
                  console.error(`sendPhoto (base64) failed for admin ${chatId}:`, photoData.description);
                }
              }
            } else if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
              const photoRes = await fetch(`https://api.telegram.org/bot${OWNER_BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  photo: photoUrl,
                  caption: text ? text.slice(0, 1024) : `Buyurtma #${booking.id}`,
                  parse_mode: 'HTML',
                  reply_markup: replyMarkup,
                }),
              });
              const photoData = await photoRes.json();
              if (photoData.ok) {
                sentOk = true;
              } else {
                console.error(`sendPhoto (url) failed for admin ${chatId}:`, photoData.description);
              }
            }
          } catch (photoErr: unknown) {
            const pErr = photoErr as { message?: string };
            console.error(`Photo sending error for admin ${chatId}:`, pErr?.message);
          }
        }

        // 2. If no photo or sendPhoto did not succeed, fallback to sendMessage
        if (!sentOk) {
          const sendRes = await fetch(`https://api.telegram.org/bot${OWNER_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: text,
              parse_mode: 'HTML',
              reply_markup: replyMarkup,
            }),
          });

          const sendData = await sendRes.json();
          if (sendData.ok) {
            sentOk = true;
          } else {
            errors.push(`Admin ${chatId}: ${sendData.description}`);
          }
        }

        if (sentOk) {
          deliveredCount++;
        }
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        errors.push(`Admin ${chatId}: ${errorObj?.message}`);
      }
    }

    logOrder({ booking, deliveredCount, adminCount: adminIds.length, errors });

    return NextResponse.json({
      success: true,
      deliveredCount,
      adminCount: adminIds.length,
      message: `Buyurtma ${deliveredCount} ta rasmiy administratorga yetkazildi.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error('Error in /api/telegram POST:', error);
    const serverErr = error as { message?: string };
    return NextResponse.json(
      { success: false, message: serverErr?.message || 'Server xatosi yuz berdi' },
      { status: 500 }
    );
  }
}
