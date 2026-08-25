import { db } from '../../../db'

export async function deleteModel(instance: any): Promise<any> {
  const model  =  instance.constructor
  const soft   =  model.getSoftDeleteConfig?.()

  if (!instance._exists) return instance

  if (!soft) return await instance.forceDelete()

  const trx = instance._trx ?? await db.transaction()

  try {
    await instance.runHook('before-delete', { model: instance, trx })

    const now = new Date()
    await trx(model.getTable()).where(model.primaryKey, instance[model.primaryKey]).update({ [soft.column]: now })
    
    await instance.runHook('after-delete', { model: instance, trx })

    if (!instance._trx) await trx.commit()

    instance[soft.column] = now
    instance._exists = false

    return instance
  } catch (err) {
    if (!instance._trx) await trx.rollback()

    throw err
  }
}
