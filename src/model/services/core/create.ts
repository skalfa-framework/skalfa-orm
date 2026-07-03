import { db } from '../../../db'



export async function create(ctor: any, payload: Record<string, any>, trx?: any): Promise<any> {
  const instance = ctor.newInstance()

  instance.fill(payload)

  const data = instance.castToDB()

  await instance.runHook('before-create', { model: instance, trx })

  const conn     =  trx ?? db
  const isMySql  =  conn.client?.config?.client?.includes?.('mysql')

  let row: any
  if (isMySql) {
    const [insertId]  =  await conn(ctor.getTable()).insert(data)
    const pk          =  ctor.primaryKey ?? 'id'
    const searchId    =  (insertId !== 0 && insertId !== undefined) ? insertId : data[pk]

    row = await conn(ctor.getTable()).where(pk, searchId).first()
  } else {
    const [r] = await conn(ctor.getTable()).insert(data).returning('*')

    row = r
  }

  await instance.runHook('after-create', { model: instance, trx })

  return instance.castFromDB(row)

}
