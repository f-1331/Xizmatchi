import { table, integer, text, index, sql } from 'sdk/db';

export const users = table('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').unique(),
  name: text('name').notNull(),
  username: text('username'),
  phone: text('phone'),
  district: text('district'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  tgIdIdx: index('idx_users_tg_id').on(t.tgId),
}));

export const orders = table('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userTgId: integer('user_tg_id'),
  clientName: text('client_name').notNull(),
  clientPhone: text('client_phone').notNull(),
  district: text('district').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  address: text('address'),
  preferredTime: text('preferred_time'),
  status: text('status').default('yangi'), // yangi, jarayonda, bajarildi, bekor_qilindi
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  userOrdersIdx: index('idx_orders_user').on(t.userTgId),
  districtIdx: index('idx_orders_district').on(t.district),
}));
