import { db } from '../../../db'



export async function update(ctor: any, payload: Record<string, any>, uniqueKeys: string[], trx?: any): Promise<any> {
  if (!uniqueKeys.length) throw new Error('updateByUnique requires uniqueKeys')

  const instance = ctor.newInstance()

  instance.fill(payload)

  const data = instance.castToDB()

  const where: Record<string, any> = {}

  for (const key of uniqueKeys) {
    if (payload[key] === undefined) throw new Error(`Missing unique key: ${key}`)

    where[key] = payload[key]
  }

  const conn     =  trx ?? db
  const isMySql  =  conn.client?.config?.client?.includes?.('mysql')

  let row: any
  if (isMySql) {
    await conn(ctor.getTable()).where(where).update(data)

    row = await conn(ctor.getTable()).where(where).first()
  } else {
    const [r] = await conn(ctor.getTable()).where(where).update(data).returning('*')

    row = r
  }

  if (!row) throw new Error('Record not found')



  return instance.castFromDB(row)

}
