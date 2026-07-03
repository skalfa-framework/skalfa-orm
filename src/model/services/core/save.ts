import { db } from '../../../db'
import { Casts } from '../../model'



export async function save(instance: any): Promise<any> {
  const model    =  instance.constructor
  const table    =  model.getTable()
  const pk       =  model.primaryKey
  const conn     =  instance._trx ?? db
  const hookCtx  =  { model: instance, trx: instance._trx }
  
  if (!instance._exists) {
    const data = instance.castToDB()
    
    await instance.runHook('before-create', hookCtx)

    const isMySql = conn.client?.config?.client?.includes?.('mysql')
    let row: any

    if (isMySql) {
      const [insertId]  =  await conn(table).insert(data)
      const searchId    =  (insertId !== 0 && insertId !== undefined) ? insertId : data[pk]

      row = await conn(table).where(pk, searchId).first()
    } else {
      const [r] = await conn(table).insert(data).returning('*')

      row = r
    }

    instance.castFromDB(row)

    await instance.runHook('after-create', hookCtx)

    return instance

  }

  const dirty = instance.getDirty()

  if (Object.keys(dirty).length === 0) return instance

  await instance.runHook('before-update', hookCtx)

  const fields = model.fields
  const updateData: Record<string, any> = {}

  for (const [key, meta] of Object.entries(fields) as [string, any][]) {
    if (!meta.fillable) continue
    if (!(key in dirty)) continue

    const val = dirty[key]

    updateData[key] = meta.cast ? (Casts as any)[meta.cast].toDB(val) : val
  }

  if (Object.keys(updateData).length === 0) return instance

  await conn(table).where(pk, instance[pk]).update(updateData)

  Object.assign(instance._original, dirty)

  await instance.runHook('after-update', hookCtx)

  return instance
}
