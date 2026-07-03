import knex, { Knex } from 'knex'
import { resolveDriver } from './resolver'



export type knexConfig = {
  client    ?:  string
  host      ?:  string
  port      ?:  number
  user      ?:  string
  password  ?:  string
  database  ?:  string
}



export function createKnex(config: knexConfig) :  Knex {
  const client = resolveDriver(config.client)

  return knex({
    client,
    connection: {
      host      :  config.host       ??  '127.0.0.1',
      port      :  config.port       ??  (client === 'mysql2' ? 3306 : 5432),
      user      :  config.user       ??  'postgres',
      password  :  config.password   ??  'password',
      database  :  config.database   ??  'db_elysia_light',
    },
    pool: { 
      min  :  Number(process.env.DB_POOL_MIN || 2),
      max  :  Number(process.env.DB_POOL_MAX || 10)
    },
  })
}
