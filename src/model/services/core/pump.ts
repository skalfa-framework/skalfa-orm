import { db } from '../../../db'
import { conversion } from '../../../conversion'



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

    const belongsToRelations: Record<string, any> = {}
    const otherRelations: Record<string, any>     = {}

    for (const [name, value] of Object.entries(nested)) {
      const relDef = relations[name]
      if (!relDef) continue

      const desc = relDef()
      if (desc.type === 'belongsTo') {
        belongsToRelations[name] = value
      } else {
        otherRelations[name] = value
      }
    }

    for (const [name, value] of Object.entries(belongsToRelations)) {
      const relDef   =  relations[name]
      const desc     =  relDef()
      const Related  =  desc.model()

      const item  =  Array.isArray(value) ? value[0] : value

      if (typeof item === 'object' && item !== null) {
        let child: any = null

        const pkName       =  Related.primaryKey ?? 'id'
        const itemPk       =  item[pkName]
        const parentFkVal  =  instance[desc.foreignKey]

        if (itemPk) {
          child = await Related.query(trx).where(pkName, itemPk).getFirst()
        } else if (parentFkVal) {
          child = await Related.query(trx).where(pkName, parentFkVal).getFirst()
        }

        if (!child) {
          child = Related.newInstance()
        }

        await child.pump(item, { trx })

        instance[desc.foreignKey]  =  child[desc.localKey ?? pkName]
        instance[name]             =  child
      }
    }

    instance.fill(flat)

    await instance.useTransaction(trx).save()

    for (const [name, value] of Object.entries(otherRelations)) {
      const relDef   =  relations[name]
      if (!relDef) continue

      const desc     =  relDef()
      const Related  =  desc.model()

      if (desc.type === 'belongsToMany') {
        const parentName   =  conversion.strSnake(ctor.name)
        const relatedName  =  conversion.strSnake(Related.name)

        const pivotTable    =  desc.pivotTable ?? conversion.strPlural(`${parentName}_has_${relatedName}`)
        const pivotLocal    =  desc.pivotLocal ?? `${parentName}_id`
        const pivotForeign  =  desc.pivotForeign ?? `${relatedName}_id`

        const parentKey  =  desc.localKey ?? ctor.primaryKey ?? 'id'
        const parentId   =  instance[parentKey]

        const items = Array.isArray(value) ? value : [value]

        const existingPivots      =  await trx(pivotTable).where(pivotLocal, parentId).select(pivotForeign)
        const existingForeignIds  =  existingPivots.map((r: any) => r[pivotForeign])
        const incomingForeignIds: any[] = []
        const children: any[]      = []

        for (const item of items) {
          if (typeof item !== 'object' || item === null) continue

          let child: any = null
          const pkName   = Related.primaryKey ?? 'id'
          const itemPk   = item[pkName]

          if (itemPk) {
            child = await Related.query(trx).where(pkName, itemPk).getFirst()
            if (child) {
              if (Object.keys(item).length > 1) {
                await child.pump(item, { trx })
              }
            } else {
              child = Related.newInstance()
              await child.pump(item, { trx })
            }
          } else {
            child = Related.newInstance()
            await child.pump(item, { trx })
          }

          const childId = child[pkName]
          if (childId !== undefined && childId !== null) {
            incomingForeignIds.push(childId)
            children.push(child)

            const existsInPivot = existingForeignIds.some((id: any) => String(id) === String(childId))
            if (!existsInPivot) {
              await trx(pivotTable).insert({
                [pivotLocal]    :  parentId,
                [pivotForeign]  :  childId,
              })
            }
          }
        }

        const toDeletePivots = existingForeignIds.filter((id: any) => !incomingForeignIds.some((inc: any) => String(inc) === String(id)))
        if (toDeletePivots.length) {
          await trx(pivotTable).where(pivotLocal, parentId).whereIn(pivotForeign, toDeletePivots).delete()
        }

        instance[name] = Array.isArray(value) ? children : (children[0] ?? null)
        continue
      }

      if (Array.isArray(value)) {
        const existing = await Related.query(trx).where(desc.foreignKey, instance[desc.localKey]).get()

        const existingIds         =  existing.map((r: any) => r[Related.primaryKey])
        const incomingIds: any[]  =  []
        const children: any[]     =  []

        for (const item of value) {
          let child: any = null
          if (item[Related.primaryKey]) {
            child = await Related.query(trx).where(Related.primaryKey, item[Related.primaryKey]).getFirst()

            if (child) {
              await child.pump(item, { trx })

              incomingIds.push(child[Related.primaryKey])
              children.push(child)
            }
          }

          if (!child) {
            child = Related.newInstance()

            child[desc.foreignKey] = instance[desc.localKey]

            await child.pump(item, { trx })

            incomingIds.push(child[Related.primaryKey])
            children.push(child)
          }
        }

        const toDelete = existingIds.filter((id: any) => !incomingIds.includes(id))

        if (toDelete.length) await Related.query(trx).whereIn(Related.primaryKey, toDelete).delete()

        instance[name] = children
        continue
      }

      if (typeof value === 'object' && value !== null) {
        let child: any = null
        if (value[Related.primaryKey]) {
          child = await Related.query(trx).where(Related.primaryKey, value[Related.primaryKey]).getFirst()
        }

        if (!child) {
          child = Related.newInstance()
        }

        child[desc.foreignKey] = instance[desc.localKey]

        await child.pump(value, { trx })
        instance[name] = child
      }
    }

    if (isRoot) await trx.commit()

    return instance
  } catch (err) {
    if (isRoot) await trx.rollback()

    throw err
  }
}