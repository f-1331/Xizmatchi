import fs from 'fs';
import path from 'path';

export const SUPERADMIN_ID = 6707839718;

export interface TelegramAdmin {
  id: number;
  name: string;
  username?: string;
  addedAt: string;
  role: 'superadmin' | 'admin';
}

export interface TelegramAdminsData {
  superadmin: number;
  admins: TelegramAdmin[];
}

const ADMINS_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_admins.json');
const SUBSCRIBERS_FILE = path.join(process.cwd(), 'src', 'data', 'telegram_subscribers.json');

export function getAdminsData(): TelegramAdminsData {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf-8'));
      if (data && Array.isArray(data.admins) && data.admins.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading telegram admins:', err);
  }

  return {
    superadmin: SUPERADMIN_ID,
    admins: [
      {
        id: SUPERADMIN_ID,
        name: 'Bosh Administrator (Egasi)',
        username: '',
        addedAt: new Date().toISOString(),
        role: 'superadmin',
      },
    ],
  };
}

export function saveAdminsData(data: TelegramAdminsData): void {
  try {
    const dir = path.dirname(ADMINS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(data, null, 2), 'utf-8');

    // Sync to subscribers file so both stay identical
    const ids = Array.from(new Set(data.admins.map((a) => Number(a.id))));
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(ids, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving telegram admins:', err);
  }
}

export function getAuthorizedAdminIds(): number[] {
  const data = getAdminsData();
  const set = new Set<number>([SUPERADMIN_ID]);
  data.admins.forEach((a) => {
    const num = Number(a.id);
    if (!isNaN(num) && num > 0) set.add(num);
  });
  return Array.from(set);
}

export function isAuthorizedAdmin(chatId: number | string): boolean {
  const num = Number(chatId);
  if (num === SUPERADMIN_ID) return true;
  const data = getAdminsData();
  return data.admins.some((a) => Number(a.id) === num);
}

export function isSuperadmin(chatId: number | string): boolean {
  return Number(chatId) === SUPERADMIN_ID;
}

export function addAdmin(newAdmin: {
  id: number;
  name: string;
  username?: string;
}): { success: boolean; message: string } {
  const data = getAdminsData();
  const numId = Number(newAdmin.id);

  if (isNaN(numId) || numId <= 0) {
    return { success: false, message: "Noto'g'ri Telegram ID raqami" };
  }

  if (data.admins.some((a) => Number(a.id) === numId)) {
    return { success: false, message: "Bu foydalanuvchi allaqachon adminlar ro'yxatida bor." };
  }

  data.admins.push({
    id: numId,
    name: newAdmin.name || `Admin #${numId}`,
    username: newAdmin.username || '',
    addedAt: new Date().toISOString(),
    role: 'admin',
  });

  saveAdminsData(data);
  return { success: true, message: `Admin (ID: ${numId}) muvaffaqiyatli qo'shildi.` };
}

export function removeAdmin(adminId: number | string): { success: boolean; message: string } {
  const numId = Number(adminId);
  if (numId === SUPERADMIN_ID) {
    return { success: false, message: "Bosh administratorni (egasi) o'chirish mumkin emas!" };
  }

  const data = getAdminsData();
  const initialLength = data.admins.length;
  data.admins = data.admins.filter((a) => Number(a.id) !== numId);

  if (data.admins.length === initialLength) {
    return { success: false, message: "Admin topilmadi." };
  }

  saveAdminsData(data);
  return { success: true, message: `Admin (ID: ${numId}) muvaffaqiyatli o'chirildi.` };
}
