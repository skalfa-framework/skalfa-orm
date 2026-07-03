import { db } from '../../../db'



export async function restore(instance: any): Promise<any> {
  const model  =  instance.constructor
  const soft   =  model.getSoftDeleteConfig?.()

  if (!soft) return instance

  await instance.runHook('before-update', { model: instance, trx: instance._trx })

  await (instance._trx ?? db)(model.getTable()).where(model.primaryKey, instance[model.primaryKey]).update({ [soft.column]: null })

  await instance.runHook('after-update', { model: instance, trx: instance._trx })

  instance._exists = true

  return instance
}
