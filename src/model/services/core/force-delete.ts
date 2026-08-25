import { db } from '../../../db'



export async function forceDelete(instance: any): Promise<any> {
  const model  =  instance.constructor
  const pk     =  model.primaryKey

  if (!instance._exists) return instance

  await (instance._trx ?? db)(model.getTable()).where(pk, instance[pk]).delete()

  instance._exists = false

  return instance
}
