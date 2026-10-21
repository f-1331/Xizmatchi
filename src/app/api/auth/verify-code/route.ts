import { NextRequest, NextResponse } from 'next/server';
import {
  normalizePhone,
  getActiveSmsCodes,
  saveActiveSmsCodes,
  upsertUser,
} from '../../../../lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, name, district, role = 'client', specialistId } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: 'Telefon raqam va SMS kod talab qilinadi.' },
        { status: 400 }
      );
    }

    const normPhone = normalizePhone(phone);
    const codes = getActiveSmsCodes();
    const activeSession = codes[normPhone];

    // Check code validity
    if (!activeSession) {
      return NextResponse.json(
        { success: false, message: 'Tasdiqlash kodi topilmadi yoki eskirgan. Qaytadan kod so\'rang.' },
        { status: 400 }
      );
    }

    if (Date.now() > activeSession.expiresAt) {
      delete codes[normPhone];
      saveActiveSmsCodes(codes);
      return NextResponse.json(
        { success: false, message: 'Kiritilgan kodning amal qilish muddati tugagan. Qaytadan kod so\'rang.' },
        { status: 400 }
      );
    }

    if (activeSession.code.trim() !== String(code).trim()) {
      return NextResponse.json(
        { success: false, message: 'Kiritilgan SMS kod noto\'g\'ri! Iltimos, tekshirib qayta kiriting.' },
        { status: 400 }
      );
    }

    // Code is valid! Remove code session
    delete codes[normPhone];
    saveActiveSmsCodes(codes);

    // Upsert verified user in database
    const user = upsertUser({
      phone: normPhone,
      name: name?.trim() || undefined,
      district: district || undefined,
      role: role as 'client' | 'specialist',
      specialistId: specialistId || undefined,
      isPhoneVerified: true,
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'Telefon raqamingiz muvaffaqiyatli tasdiqlandi!',
    });
  } catch (error: unknown) {
    console.error('Error in verify-code API:', error);
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, message: err?.message || 'Kodni tasdiqlashda xatolik yuz berdi.' },
      { status: 500 }
    );
  }
}
