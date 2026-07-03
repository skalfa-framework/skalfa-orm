// ==============================
// ## Driver resolver
// ==============================
export function resolveDriver(conn?: string): 'pg' | 'mysql2' {
  if (!conn) return 'pg'

  const v = conn.toLowerCase()

  if (['pg', 'pgsql', 'postgres'].includes(v)) return 'pg'
  if (['mysql', 'mysql2'].includes(v)) return 'mysql2'

  throw new Error(`Unsupported DB_CONNECTION: ${conn}`)
}
