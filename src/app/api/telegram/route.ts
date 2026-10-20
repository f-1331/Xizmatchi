import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthorizedAdminIds, getAdminsData } from '@/lib/adminStore';

// Primary Owner Bot (Strictly for Owner & Verified Admins)
const OWNER_BOT_TOKEN = '8668786258:AAGrl0W3txp5b-F_0o6Pj7snrS-f8xCd9CA';
const OWNER_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_ownerbot';

// Public Client Bot (For normal users)
const CLIENT_BOT_TOKEN = '8977412958:AAH_xkRQQe6k49_JVxRvmuv6-vtl0Du5ao4';
const CLIENT_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_bot';

const ORDERS_LOG_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_orders.json');

// Helper to log orders sent
function logOrder(orderData: any): void {
  try {
    let orders: any[] = [];
    if (fs.existsSync(ORDERS_LOG_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_LOG_FILE, 'utf-8')) || [];
    }
    orders.unshift({ ...orderData, sentAt: new Date().toISOString() });
    fs.writeFileSync(ORDERS_LOG_FILE, JSON.stringify(orders.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error logging telegram order:', err);
  }
}

export async function GET(req: NextRequest) {
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
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || "Tizim ma'lumotlarini olishda xatolik" },
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

    // Send order ONLY to authorized admin IDs via Owner Bot
    for (const chatId of adminIds) {
      try {
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
          deliveredCount++;
        } else {
          errors.push(`Admin ${chatId}: ${sendData.description}`);
        }
      } catch (err: any) {
        errors.push(`Admin ${chatId}: ${err?.message}`);
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
  } catch (error: any) {
    console.error('Error in /api/telegram POST:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server xatosi yuz berdi' },
      { status: 500 }
    );
  }
}
