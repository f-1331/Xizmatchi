import fs from 'fs';
import path from 'path';

export const SUPERADMIN_ID = 6707839718;
export const SUPERADMIN_USERNAME = 'fayzbek1331';

export interface TelegramAdmin {
  id?: number | null;
  name: string;
  username?: string;
  addedAt: string;
  role: 'superadmin' | 'admin';
}

export interface TelegramAdminsData {
  superadmin: number;
  superadmin_username?: string;
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
    superadmin_username: SUPERADMIN_USERNAME,
    admins: [
      {
        id: SUPERADMIN_ID,
        name: 'Fayzbek (Bosh Egasi)',
        username: SUPERADMIN_USERNAME,
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

    // Sync active numeric IDs to subscribers file
    const ids = Array.from(
      new Set(
        data.admins
          .map((a) => (a.id ? Number(a.id) : null))
          .filter((id): id is number => typeof id === 'number' && !isNaN(id) && id > 0)
      )
    );
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(ids, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving telegram admins:', err);
  }
}

export function getAuthorizedAdminIds(): number[] {
  const data = getAdminsData();
  const set = new Set<number>([SUPERADMIN_ID]);
  data.admins.forEach((a) => {
    if (a.id) {
      const num = Number(a.id);
      if (!isNaN(num) && num > 0) set.add(num);
    }
  });
  return Array.from(set);
}

export function isAuthorizedAdmin(chatId?: number | string | null, username?: string | null): boolean {
  const cleanUser = (username || '').replace(/^@/, '').toLowerCase();
  const numId = chatId ? Number(chatId) : null;

  if (cleanUser === SUPERADMIN_USERNAME || numId === SUPERADMIN_ID) {
    return true;
  }

  const data = getAdminsData();
  return data.admins.some((a) => {
    if (numId && a.id && Number(a.id) === numId) return true;
    if (cleanUser && a.username && a.username.toLowerCase() === cleanUser) return true;
    return false;
  });
}

export function isSuperadmin(chatId?: number | string | null, username?: string | null): boolean {
  const cleanUser = (username || '').replace(/^@/, '').toLowerCase();
  const numId = chatId ? Number(chatId) : null;
  return cleanUser === SUPERADMIN_USERNAME || numId === SUPERADMIN_ID;
}

export function addAdmin(newAdmin: {
  id?: number | null;
  name?: string;
  username?: string;
}): { success: boolean; message: string; admin?: TelegramAdmin } {
  const data = getAdminsData();
  const cleanUser = (newAdmin.username || '').replace(/^@/, '').trim().toLowerCase();
  const numId = newAdmin.id ? Number(newAdmin.id) : null;

  if (!numId && !cleanUser) {
    return { success: false, message: "Telegram ID yoki @username kiritilishi shart." };
  }

  // Check duplicate
  const exists = data.admins.some((a) => {
    if (numId && a.id && Number(a.id) === numId) return true;
    if (cleanUser && a.username && a.username.toLowerCase() === cleanUser) return true;
    return false;
  });

  if (exists) {
    return { success: false, message: "Bu foydalanuvchi allaqachon adminlar ro'yxatida mavjud." };
  }

  const created: TelegramAdmin = {
    id: numId || null,
    name: newAdmin.name || (cleanUser ? `@${cleanUser}` : `Admin #${numId}`),
    username: cleanUser || '',
    addedAt: new Date().toISOString(),
    role: 'admin',
  };

  data.admins.push(created);
  saveAdminsData(data);

  return {
    success: true,
    message: `Admin (${created.name}) muvaffaqiyatli qo'shildi.`,
    admin: created,
  };
}

export function removeAdmin(adminIdentifier: number | string): { success: boolean; message: string } {
  const cleanId = String(adminIdentifier).replace(/^@/, '').toLowerCase();
  const numId = Number(adminIdentifier);

  if (cleanId === SUPERADMIN_USERNAME || numId === SUPERADMIN_ID) {
    return { success: false, message: "Bosh administratorni (egasi) o'chirish mumkin emas!" };
  }

  const data = getAdminsData();
  const initialLength = data.admins.length;

  data.admins = data.admins.filter((a) => {
    if (!isNaN(numId) && a.id && Number(a.id) === numId) return false;
    if (a.username && a.username.toLowerCase() === cleanId) return false;
    return true;
  });

  if (data.admins.length === initialLength) {
    return { success: false, message: "Bunday admin topilmadi." };
  }

  saveAdminsData(data);
  return { success: true, message: "Admin muvaffaqiyatli o'chirildi." };
}
