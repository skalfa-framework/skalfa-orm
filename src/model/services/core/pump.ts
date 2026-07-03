import { db } from '../../../db'



export async function pump(instance: any, payload: any, options: { trx?: any } = {}): Promise<any> {
  const isRoot  =  !options.trx
  const trx     =  options.trx ?? await db.transaction()

  try {
    if (Array.isArray(payload)) {
      const Ctor            =  instance.constructor
      const pkName          =  Ctor.primaryKey ?? 'id'
      const results: any[]  =  []

      for (const item of payload) {
        let   childInstance: any  =  null
        const pkValue             =  item[pkName]

        if (pkValue) {
          const row = await Ctor.query(trx).where(pkName, pkValue).first()

          if (row) childInstance = Ctor.hydrate([row])[0]
        }

        if (!childInstance) childInstance = Ctor.newInstance()

        await childInstance.pump(item, { trx })

        results.push(childInstance)
      }

      if (isRoot) await trx.commit()

      return results
    }

    const ctor       =  instance.constructor
    const fields     =  ctor.fields
    const relations  =  ctor.relations ?? {}

    const flat: Record<string,   any>  =  {}
    const nested: Record<string, any>  =  {}

    for (const key of Object.keys(payload)) {
      const value = payload[key]

      if (fields[key]?.fillable) {
        flat[key] = value
      } else if (relations[key] && value !== null) {
        nested[key] = value
      }
    }

    instance.fill(flat)

    await instance.useTransaction(trx).save()

    for (const [name, value] of Object.entries(nested)) {
      const relDef = relations[name]

      if (!relDef) continue

      const desc     =  relDef()
      const Related  =  desc.model()

      if (Array.isArray(value)) {
        const existing = await Related.query(trx).where(desc.foreignKey, instance[desc.localKey]).get()

        const existingIds         =  existing.map((r: any) => r[Related.primaryKey])
        const incomingIds: any[]  =  []

        for (const item of value) {
          if (item[Related.primaryKey]) {
            const child = await Related.query(trx).where(Related.primaryKey, item[Related.primaryKey]).getFirst()

            if (child) {
              await child.pump(item, { trx })

              incomingIds.push(child[Related.primaryKey])
            }
          } else {
            const child = Related.newInstance()

            child[desc.foreignKey] = instance[desc.localKey]

            await child.pump(item, { trx })

            incomingIds.push(child[Related.primaryKey])
          }
        }

        const toDelete = existingIds.filter((id: any) => !incomingIds.includes(id))

        if (toDelete.length) await Related.query(trx).whereIn(Related.primaryKey, toDelete).delete()

        continue
      }

      const child = Related.newInstance()

      if (desc.type !== 'belongsTo') child[desc.foreignKey] = instance[desc.localKey]

      await child.pump(value, { trx })
    }

    if (isRoot) await trx.commit()

    return instance
  } catch (err) {
    if (isRoot) await trx.rollback()

    throw err
  }
}