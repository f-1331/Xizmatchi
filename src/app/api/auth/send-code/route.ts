import { NextRequest, NextResponse } from 'next/server';
import {
  normalizePhone,
  getActiveSmsCodes,
  saveActiveSmsCodes,
  sendTelegramSmsCode,
} from '../../../../lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, purpose = 'login' } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Telefon raqam kiritilishi shart.' },
        { status: 400 }
      );
    }

    const normPhone = normalizePhone(phone);
    const digitsOnly = normPhone.replace(/[^\d]/g, '');

    if (digitsOnly.length < 9) {
      return NextResponse.json(
        { success: false, message: 'Telefon raqami noto\'g\'ri formatda. Kamida 9 ta raqam bo\'lishi kerak.' },
        { status: 400 }
      );
    }

    // Generate 4-digit code (e.g. 5831)
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const codes = getActiveSmsCodes();
    codes[normPhone] = {
      phone: normPhone,
      code,
      expiresAt,
      purpose,
    };
    saveActiveSmsCodes(codes);

    // Send code to Telegram Bot
    const telegramDelivered = await sendTelegramSmsCode(normPhone, code, purpose);

    return NextResponse.json({
      success: true,
      phone: normPhone,
      code, // Returned for instant demo testing and simulation
      expiresIn: 300,
      telegramDelivered,
      message: telegramDelivered
        ? `SMS tasdiqlash kodi telefoningizga va @xizmatchiuz_Uzbekistan_bot Telegram botingizga yuborildi.`
        : `SMS tasdiqlash kodi yuborildi. Kod: ${code}`,
    });
  } catch (error: any) {
    console.error('Error in send-code API:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'SMS kod yuborishda xatolik yuz berdi.' },
      { status: 500 }
    );
  }
}
