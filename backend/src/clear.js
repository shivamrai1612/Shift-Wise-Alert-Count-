import 'dotenv/config';
import { initDb, query } from './db.js';
import { syncExcelFromDatabaseSafe } from './utils/excelSync.js';

async function clear() {
  await initDb();
  const before = await query('SELECT COUNT(*)::int AS c FROM shift_entries');
  await query('DELETE FROM shift_entries');
  await syncExcelFromDatabaseSafe();
  console.log(`Removed ${before.rows[0].c} entries. Database is empty.`);
  process.exit(0);
}

clear().catch((err) => {
  console.error(err);
  process.exit(1);
});
