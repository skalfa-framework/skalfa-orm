import type { Knex } from 'knex'
import { createKnex } from './factory'



// ==============================
// ## Connection registry
// ==============================
const connections: Record<string, Knex> = {}



// ==============================
// ## Default connection
// ==============================
const DEFAULT_NAME = 'default'

connections[DEFAULT_NAME] = createKnex({
  client    :  process.env.DB_CONNECTION,
  host      :  process.env.DB_HOST,
  port      :  Number(process.env.DB_PORT),
  user      :  process.env.DB_USERNAME,
  password  :  process.env.DB_PASSWORD,
  database  :  process.env.DB_DATABASE,
})

export const db: Knex = connections[DEFAULT_NAME]



// ==============================
// ## Named connection (multiple DB)
// ==============================
export function useDB(
  name         :  string,
  config      ?:  {
    client    ?:  string
    host      ?:  string
    port      ?:  number
    user      ?:  string
    password  ?:  string
    database  ?:  string
  }
): Knex {
  if (!connections[name]) {
    if (!config) {
      throw new Error(`DB connection "${name}" not found`)
    }
    connections[name] = createKnex(config)
  }

  return connections[name]
}



// ==============================
// ## Close all connections (CLI safe)
// ==============================
export async function closeAllDB() {
  await Promise.all( Object.values(connections).map(db => db.destroy()))
}
