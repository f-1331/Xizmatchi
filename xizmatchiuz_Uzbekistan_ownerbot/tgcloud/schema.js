import { table, integer, text } from 'sdk/db';

export const owners = table('owners', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').notNull().unique(),
  name: text('name'),
  username: text('username'),
  phone: text('phone'),
  role: text('role').default('owner'),
  createdAt: text('created_at'),
});

export const admins = table('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').unique(),
  name: text('name'),
  username: text('username'),
  role: text('role').default('admin'),
  createdAt: text('created_at'),
});

export const orders = table('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: text('booking_id'),
  clientName: text('client_name'),
  clientPhone: text('client_phone'),
  district: text('district'),
  address: text('address'),
  category: text('category'),
  description: text('description'),
  urgency: text('urgency'),
  preferredTime: text('preferred_time'),
  status: text('status').default('yangi'),
  photoUrl: text('photo_url'),
  createdAt: text('created_at'),
});
