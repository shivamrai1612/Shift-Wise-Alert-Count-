/** Convert PostgreSQL-style queries to SQLite-compatible SQL */
export function toSqliteSql(text) {
  return text
    .replace(/::int\b/gi, '')
    .replace(/::date\b/gi, '')
    .replace(/COALESCE\(\$(\d+)::date,\s*CURRENT_DATE\)/gi, 'COALESCE(?, date(\'now\'))')
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    .replace(/\bCURRENT_DATE\b/gi, "date('now')")
    .replace(/\$(\d+)/g, '?');
}
