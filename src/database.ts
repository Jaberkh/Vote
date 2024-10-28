import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// ایجاد پایگاه داده و جدول
async function setupDatabase() {
  const db = await open({
    filename: './votes.db',
    driver: sqlite3.Database,
  });

  // ایجاد جدول برای ذخیره آرای هریس و ترامپ
  await db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      harris INTEGER DEFAULT 0,
      trump INTEGER DEFAULT 0
    )
  `);

  return db;
}

// تابع برای بارگذاری آرای موجود از پایگاه داده
async function loadVotes(db: any) {
  const row = await db.get('SELECT harris, trump FROM votes WHERE id = 1');
  if (row) {
    return { harris: row.harris, trump: row.trump };
  } else {
    // اگر آرای اولیه موجود نباشد، مقداردهی اولیه
    await db.run('INSERT INTO votes (harris, trump) VALUES (0, 0)');
    return { harris: 0, trump: 0 };
  }
}

// تابع برای ذخیره آرای جدید در پایگاه داده
async function saveVotes(db: any, votes: { harris: number; trump: number }) {
  await db.run('UPDATE votes SET harris = ?, trump = ? WHERE id = 1', votes.harris, votes.trump);
}

// خروجی توابع
export { setupDatabase, loadVotes, saveVotes };
