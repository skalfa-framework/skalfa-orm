import { db } from '../../../db'

export async function deleteModel(instance: any): Promise<Record<string, any> | null> {
  const model  =  instance.constructor
  const soft   =  model.getSoftDeleteConfig?.()

  if (!instance._exists) return null

  if (!soft) return await instance.forceDelete()

  const trx = instance._trx ?? await db.transaction()

  try {
    await instance.runHook('before-delete', { model: instance, trx })

    await trx(model.getTable()).where(model.primaryKey, instance[model.primaryKey]).update({ [soft.column]: new Date() })
    
    await instance.runHook('after-delete', { model: instance, trx })

    if (!instance._trx) await trx.commit()

    const snapshot =  await (instance._trx ?? db)(model.getTable()).where(model.primaryKey, instance[model.primaryKey]).first()

    instance._exists = false

    return snapshot
  } catch (err) {
    if (!instance._trx) await trx.rollback()

    throw err
  }
}
