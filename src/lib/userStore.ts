import fs from 'fs';
import path from 'path';
import { UserProfile, SmsVerificationSession } from '../types';

const USERS_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');
const SMS_CODES_FILE = path.join(process.cwd(), 'src', 'data', 'sms_codes.json');
const SUBSCRIBERS_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_subscribers.json');
const TELEGRAM_BOT_TOKEN = '8977412958:AAH_xkRQQe6k49_JVxRvmuv6-vtl0Du5ao4';

export function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('998')) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return `+${digits}`;
}

export function getAllUsers(): UserProfile[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.error('Error reading users file:', e);
  }
  return [];
}

export function saveAllUsers(users: UserProfile[]): void {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users file:', e);
  }
}

export function findUserByPhone(phone: string): UserProfile | undefined {
  const norm = normalizePhone(phone);
  const users = getAllUsers();
  return users.find((u) => normalizePhone(u.phone) === norm);
}

export function upsertUser(userData: Partial<UserProfile> & { phone: string }): UserProfile {
  const norm = normalizePhone(userData.phone);
  const users = getAllUsers();
  const index = users.findIndex((u) => normalizePhone(u.phone) === norm);

  if (index >= 0) {
    // Merge existing user
    const existing = users[index];
    const updated: UserProfile = {
      ...existing,
      ...userData,
      phone: norm,
      name: userData.name || existing.name,
      district: userData.district || existing.district,
      telegramChatId: userData.telegramChatId || existing.telegramChatId,
      telegramUsername: userData.telegramUsername || existing.telegramUsername,
      role: userData.role || existing.role,
      specialistId: userData.specialistId || existing.specialistId,
      isPhoneVerified: userData.isPhoneVerified !== undefined ? userData.isPhoneVerified : existing.isPhoneVerified,
    };
    users[index] = updated;
    saveAllUsers(users);
    return updated;
  } else {
    // Create new user
    const newUser: UserProfile = {
      id: userData.id || `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      phone: norm,
      name: userData.name || 'Foydalanuvchi',
      role: userData.role || 'client',
      isPhoneVerified: !!userData.isPhoneVerified,
      district: userData.district,
      telegramChatId: userData.telegramChatId,
      telegramUsername: userData.telegramUsername,
      specialistId: userData.specialistId,
      createdAt: userData.createdAt || new Date().toISOString(),
    };
    users.unshift(newUser);
    saveAllUsers(users);
    return newUser;
  }
}

// In-memory + disk cache for SMS codes
export function getActiveSmsCodes(): Record<string, SmsVerificationSession> {
  try {
    if (fs.existsSync(SMS_CODES_FILE)) {
      const data = JSON.parse(fs.readFileSync(SMS_CODES_FILE, 'utf-8'));
      if (typeof data === 'object' && data !== null) return data;
    }
  } catch (e) {
    console.error('Error reading sms codes:', e);
  }
  return {};
}

export function saveActiveSmsCodes(codes: Record<string, SmsVerificationSession>): void {
  try {
    const dir = path.dirname(SMS_CODES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SMS_CODES_FILE, JSON.stringify(codes, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving sms codes:', e);
  }
}

export async function sendTelegramSmsCode(phone: string, code: string, purpose: string): Promise<boolean> {
  const norm = normalizePhone(phone);
  let subscribers: number[] = [];
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8')) || [];
    }
  } catch {}

  const user = findUserByPhone(norm);
  const targetChats = new Set<number>();

  if (user?.telegramChatId) {
    targetChats.add(user.telegramChatId);
  }

  // Also send to subscribers if available
  subscribers.forEach((s) => targetChats.add(s));

  if (targetChats.size === 0) return false;

  const purposeText =
    purpose === 'register_specialist'
      ? '👷‍♂️ Usta sifatida ro\'yxatdan o\'tish va SMS tasdiqlash'
      : '🔐 Xizmatchi platformasiga kirish';

  const text =
    `🛡 <b>Xizmatchi Xavfsizlik Xizmati</b>\n\n` +
    `Telefon: <code>${norm}</code>\n` +
    `Maqsad: <b>${purposeText}</b>\n\n` +
    `Sizning bir martalik tasdiqlash kodingiz: <code>${code}</code>\n\n` +
    `⚠️ <i>Ushbu kodni hech kimga, hatto administratorlarga ham aytmang. Kod 5 daqiqa davomida amal qiladi.</i>`;

  let delivered = false;
  for (const chatId of targetChats) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });
      const data = await res.json();
      if (data.ok) delivered = true;
    } catch (err) {
      console.error(`Error sending SMS code to chatId ${chatId}:`, err);
    }
  }

  return delivered;
}
