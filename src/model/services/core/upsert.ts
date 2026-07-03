import { db } from '../../../db'



export async function upsert(ctor: any, payload: Record<string, any>, uniqueKeys: string[], trx?: any): Promise<any> {
  if (uniqueKeys.length === 0) throw new Error('Upsert requires uniqueKeys')

  const constraints: Record<string, any> = {}

  for (const key of uniqueKeys) {
    if (payload[key] === undefined) throw new Error(`Missing unique key: ${key}`)

    constraints[key] = payload[key]
  }

  let row = await ctor.query().where(constraints).first()

  if (!row) {
    const instance = ctor.newInstance()

    instance.fill(payload)

    const data     =  instance.castToDB()
    const conn     =  trx ?? db
    const isMySql  =  conn.client?.config?.client?.includes?.('mysql')

    let rowData: any
    if (isMySql) {
      const [insertId]  =  await conn(ctor.getTable()).insert(data)
      const pk          =  ctor.primaryKey ?? 'id'
      const searchId    =  (insertId !== 0 && insertId !== undefined) ? insertId : data[pk]

      rowData = await conn(ctor.getTable()).where(pk, searchId).first()
    } else {
      const [r] = await conn(ctor.getTable()).insert(data).returning('*')

      rowData = r
    }

    return instance.castFromDB(rowData)
  } else {
    const instance = ctor.newInstance()

    instance.fill(payload)

    const data     =  instance.castToDB()
    const conn     =  trx ?? db
    const isMySql  =  conn.client?.config?.client?.includes?.('mysql')

    let rowData: any
    if (isMySql) {
      await conn(ctor.getTable()).where(constraints).update(data)

      rowData = await conn(ctor.getTable()).where(constraints).first()
    } else {
      const [r] = await conn(ctor.getTable()).where(constraints).update(data).returning('*')

      rowData = r
    }

    return instance.castFromDB(rowData)
  }
}
