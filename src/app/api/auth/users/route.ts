import { NextRequest, NextResponse } from 'next/server';
import {
  getAllUsers,
  findUserByPhone,
  upsertUser,
  normalizePhone,
} from '../../../../lib/userStore';

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone');
    if (phone) {
      const user = findUserByPhone(phone);
      if (user) {
        return NextResponse.json({ success: true, user });
      }
      return NextResponse.json({ success: false, message: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    const users = getAllUsers();
    return NextResponse.json({ success: true, users, total: users.length });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, message: err?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, name, telegramChatId, telegramUsername, district, role, specialistId, isPhoneVerified } = body;

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Telefon raqam majburiy' }, { status: 400 });
    }

    const normPhone = normalizePhone(phone);
    const user = upsertUser({
      phone: normPhone,
      name,
      telegramChatId,
      telegramUsername,
      district,
      role: role || 'client',
      specialistId,
      isPhoneVerified: isPhoneVerified !== undefined ? isPhoneVerified : true,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, message: err?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}
