import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Primary Owner Bot (Order management & alerts)
const OWNER_BOT_TOKEN = '8668786258:AAGrl0W3txp5b-F_0o6Pj7snrS-f8xCd9CA';
const OWNER_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_ownerbot';

// Client / Public Bot
const CLIENT_BOT_TOKEN = '8977412958:AAH_xkRQQe6k49_JVxRvmuv6-vtl0Du5ao4';
const CLIENT_BOT_USERNAME = 'xizmatchiuz_Uzbekistan_bot';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_subscribers.json');
const ORDERS_LOG_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_orders.json');

// Helper to read subscribers
function getSubscribers(): number[] {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('Error reading telegram subscribers:', err);
  }
  return [];
}

// Helper to save subscribers
function saveSubscribers(subscribers: number[]): void {
  try {
    const dir = path.dirname(SUBSCRIBERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(Array.from(new Set(subscribers)), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving telegram subscribers:', err);
  }
}

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

// Fetch updates from Telegram bots to discover users who clicked /start
async function syncRecentSubscribers(): Promise<number[]> {
  const current = new Set<number>(getSubscribers());

  const tokens = [OWNER_BOT_TOKEN, CLIENT_BOT_TOKEN];

  for (const token of tokens) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=50`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            const chatId =
              update.message?.chat?.id ||
              update.callback_query?.message?.chat?.id ||
              update.my_chat_member?.chat?.id;
            if (chatId) {
              current.add(chatId);
            }
          }
        }
      }
    } catch (err) {
      // Non-fatal if webhook is active (e.g., 409 conflict on tgcloud)
    }
  }

  const list = Array.from(current);
  saveSubscribers(list);
  return list;
}

export async function GET(req: NextRequest) {
  try {
    const subscribeId = req.nextUrl.searchParams.get('subscribe');
    if (subscribeId && !isNaN(Number(subscribeId))) {
      const current = getSubscribers();
      const numId = Number(subscribeId);
      if (!current.includes(numId)) {
        current.push(numId);
        saveSubscribers(current);
      }
    }

    // Check Owner Bot info
    let ownerBotInfo = null;
    try {
      const ownerRes = await fetch(`https://api.telegram.org/bot${OWNER_BOT_TOKEN}/getMe`);
      const ownerData = await ownerRes.json();
      ownerBotInfo = ownerData.result;
    } catch (e) {}

    const subscribers = await syncRecentSubscribers();

    return NextResponse.json({
      status: 'ok',
      ownerBot: ownerBotInfo,
      ownerBotUsername: OWNER_BOT_USERNAME,
      clientBotUsername: CLIENT_BOT_USERNAME,
      subscribersCount: subscribers.length,
      subscribers,
      instructions: `Buyurtmalarni qabul qilish uchun @${OWNER_BOT_USERNAME} ga kiring va /start tugmasini bosing.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Bot bilan bog\'lanishda xatolik' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking, text } = body;

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Buyurtma ma\'lumotlari topilmadi' }, { status: 400 });
    }

    // Discover any newly connected subscribers
    const subscribers = await syncRecentSubscribers();

    const cleanPhone = (booking.clientPhone || '').replace(/[^\d+]/g, '');

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: `📞 Mijozga qo'ng'iroq qilish (${booking.clientPhone})`,
            url: `tel:${cleanPhone}`,
          },
        ],
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
            url: `https://xizmatchiuz.netlify.app`,
          },
        ],
      ],
    };

    let deliveredCount = 0;
    const errors: string[] = [];

    // Send order to subscribers via the OWNER bot primarily
    for (const chatId of subscribers) {
      let sentSuccessfully = false;

      // 1. Send via Owner Bot
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
          sentSuccessfully = true;
          deliveredCount++;
        } else {
          errors.push(`OwnerBot Chat ${chatId}: ${sendData.description}`);
        }
      } catch (err: any) {
        errors.push(`OwnerBot Chat ${chatId}: ${err?.message}`);
      }

      // 2. If Owner Bot failed (e.g., user started client bot instead), try Client Bot
      if (!sentSuccessfully) {
        try {
          const clientSendRes = await fetch(`https://api.telegram.org/bot${CLIENT_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: text,
              parse_mode: 'HTML',
              reply_markup: replyMarkup,
            }),
          });
          const clientData = await clientSendRes.json();
          if (clientData.ok) {
            deliveredCount++;
          }
        } catch (e) {}
      }
    }

    logOrder({ booking, deliveredCount, subscribersCount: subscribers.length, errors });

    return NextResponse.json({
      success: true,
      deliveredCount,
      subscribersCount: subscribers.length,
      ownerBotUsername: OWNER_BOT_USERNAME,
      message:
        subscribers.length > 0
          ? `Buyurtma ${deliveredCount} ta administratorga Telegram (@${OWNER_BOT_USERNAME}) orqali yetkazildi.`
          : `Buyurtma qabul qilindi. Buyurtmalarni Telegramda olish uchun @${OWNER_BOT_USERNAME} ga /start bosing.`,
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
